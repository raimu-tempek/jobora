import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

interface GemPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: "GEMINI_API_KEY is not configured on the server.",
          isOcrConfigured: false,
        },
        { status: 500 }
      );
    }

    let mimeType = "image/jpeg";
    let base64Data = "";

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("receipt") as File | null;
      if (!file) {
        return NextResponse.json(
          { error: "No receipt file provided." },
          { status: 400 }
        );
      }
      mimeType = file.type || "image/jpeg";
      const bytes = await file.arrayBuffer();
      base64Data = Buffer.from(bytes).toString("base64");
    } else if (contentType.includes("application/json")) {
      const body = await req.json();
      base64Data = body.imageBase64 || "";
      mimeType = body.mimeType || "image/jpeg";
      // Strip data:image/...;base64, if present
      if (base64Data.includes(",")) {
        base64Data = base64Data.split(",")[1];
      }
    } else {
      return NextResponse.json(
        { error: "Unsupported content type." },
        { status: 400 }
      );
    }

    if (!base64Data) {
      return NextResponse.json(
        { error: "Missing image data for OCR." },
        { status: 400 }
      );
    }

    const promptText = `
Anda adalah sistem OCR cerdas ekstraksi struk belanja & dokumen transaksi keuangan ("Struk-Ku") untuk aplikasi pencatatan keuangan pribadi.
Tugas Anda adalah membaca gambar struk pembayaran, bon kasir, atau bukti transfer/penerimaan dana, lalu mengekstrak informasi detail transaksi dalam format JSON murni.

Format JSON yang wajib dihasilkan (hanya output JSON tanpa markdown codeblock tambahan):
{
  "merchant_name": "Nama Toko / Pengirim / Penerima / Merchant Name",
  "transaction_type": "expense" (default untuk pengeluaran/belanja/tagihan) ATAU "income" (untuk bukti transfer masuk/dana diterima/slip gaji/pembayaran dari klien),
  "transaction_date": "YYYY-MM-DD",
  "transaction_time": "HH:MM",
  "receipt_number": "Nomor Struk / Invoice No / No Referensi",
  "items": [
    {
      "name": "Nama Produk / Keterangan Transaksi",
      "quantity": 1,
      "unit_price": 15000,
      "subtotal": 15000
    }
  ],
  "subtotal": 15000,
  "tax": 0,
  "discount": 0,
  "grand_total": 15000,
  "payment_method": "Tunai / QRIS / Transfer Bank / Debit / dsb",
  "suggested_category": "Makanan & Minuman",
  "confidence_notes": "Catatan singkat pembacaan struk"
}

Panduan Penentuan transaction_type:
- "expense": Struk kasir belanja, struk restoran/minimarket, tagihan listrik/air/pulsa, bukti transfer uang keluar, tiket transportasi.
- "income": Bukti transfer uang masuk (dana masuk / transfer diterima), slip gaji, bukti pelunasan invoice oleh klien, hasil penjualan, hadiah, cashback/refund.

Pilihan suggested_category (pilih 1 yang paling sesuai):
Jika transaction_type === "expense":
- "Makanan & Minuman" (Restoran, Cafe, Makanan, Minuman, Minimarket belanja camilan/sembako)
- "Transportasi" (SPBU, Bensin, Tiket Kereta, Parkir, Tol, Ojek Online)
- "Belanja" (Pakaian, Elektronik, Swalayan besar)
- "Tagihan & Utilitas" (Listrik PLN, Air PDAM, Pulsa, Internet)
- "Hiburan" (Bioskop, Rekreasi, Game)
- "Kesehatan & Pribadi" (Apotek, Obat, Salon, Skincare)
- "Pendidikan" (Buku, Kursus, Alat Tulis)
- "Tempat Tinggal" (Perabot rumah tangga)
- "Langganan" (Netflix, Spotify, Cloud)
- "Pengeluaran Lainnya" (Jika tidak termasuk di atas)

Jika transaction_type === "income":
- "Gaji" (Gaji bulanan, upah tetap)
- "Bonus" (Bonus kinerja, THR, komisi penjualan)
- "Freelance" (Proyek sampingan, honorarium, jasa lepas)
- "Investasi" (Dividen, imbal hasil reksadana, capital gain saham/kripto)
- "Pemasukan Lainnya" (Transfer masuk umum, hadiah, cashback, pengembalian dana)

Catatan Penting:
1. Semua nilai nominal uang adalah bilangan bulat integer IDR (Rupiah).
2. Jika tanggal di struk hanya tertulis hari dan bulan, gunakan tahun 2026.
3. Pastikan grand_total mencerminkan total akhir transaksi.
4. Jika struk agak buram atau ada teks tak terbaca, lakukan estimasi terbaik dan berikan catatan di confidence_notes.
`;

    const requestPayload = {
      contents: [
        {
          parts: [
            { text: promptText },
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data,
              },
            },
          ] as GemPart[],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    };

    // Call Gemini models in order of preference (2.5-flash -> 3.5-flash -> 3.8-flash -> flash-latest)
    const candidateModels = ["gemini-2.5-flash", "gemini-3.5-flash", "gemini-3.8-flash", "gemini-flash-latest"];
    let responseData = null;
    let lastError = null;

    for (const model of candidateModels) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const res = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestPayload),
        });

        if (res.ok) {
          const json = await res.json();
          const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            responseData = text;
            break;
          }
        } else {
          const errText = await res.text();
          lastError = `Model ${model} returned ${res.status}: ${errText}`;
        }
      } catch (err: unknown) {
        lastError = err instanceof Error ? err.message : String(err);
      }
    }

    if (!responseData) {
      return NextResponse.json(
        {
          error: "Failed to extract receipt data using OCR.",
          details: lastError,
        },
        { status: 502 }
      );
    }

    // Clean text response in case wrapped in markdown backticks
    let cleaned = responseData.trim();
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    const parsed = JSON.parse(cleaned);

    return NextResponse.json({
      success: true,
      data: parsed,
    });
  } catch (error: unknown) {
    console.error("OCR Route error:", error);
    return NextResponse.json(
      {
        error: "Internal server error during OCR processing.",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
