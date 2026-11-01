"use client";

import { useState, useEffect } from "react";
import {
  X,
  MessageSquare,
  Lightbulb,
  Bug,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Send,
} from "lucide-react";
import { useBodyScrollLock } from "@/lib/hooks/useBodyScrollLock";
import {
  FeedbackCategory,
  FEEDBACK_CATEGORIES,
  MAX_FEEDBACK_LENGTH,
  submitFeedback,
} from "@/lib/feedback/service";

export interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  useBodyScrollLock(isOpen);

  const [category, setCategory] = useState<FeedbackCategory>("Saran");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Close on Escape key (if not currently submitting)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting]);

  // Reset success state when reopening modal
  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setErrorMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (isSubmitting) return;
    setErrorMessage(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmed = message.trim();
    if (!trimmed) {
      setErrorMessage("Pesan kritik atau saran tidak boleh kosong.");
      return;
    }

    if (trimmed.length > MAX_FEEDBACK_LENGTH) {
      setErrorMessage(
        `Pesan melebihi batas maksimal ${MAX_FEEDBACK_LENGTH} karakter.`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await submitFeedback({
        category,
        message,
      });

      if (!res.success) {
        if (res.errorDetails) {
          console.error("Feedback submission failed with details:", {
            message: res.errorDetails.message,
            code: res.errorDetails.code,
            details: res.errorDetails.details,
            hint: res.errorDetails.hint,
            status: res.errorDetails.status,
          });
        }
        // PERATURAN UX: Jika gagal, tampilkan pesan error yang jelas dan JANGAN MENGHAPUS isi pesan.
        setErrorMessage(
          res.error ||
            "Gagal mengirim feedback. Pastikan koneksi internet stabil dan coba lagi."
        );
        setIsSubmitting(false);
        return;
      }

      // Berhasil
      setIsSuccess(true);
      setIsSubmitting(false);

      // Reset input form setelah berhasil
      setMessage("");
      setCategory("Saran");

      // Tutup otomatis setelah menampilkan konfirmasi sukses
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1600);
    } catch (err: unknown) {
      console.error("Error in FeedbackModal handleSubmit:", err);
      setErrorMessage("Terjadi kendala teknis saat mengirim feedback.");
      setIsSubmitting(false);
    }
  };

  const getCategoryIcon = (cat: FeedbackCategory) => {
    switch (cat) {
      case "Kritik":
        return <MessageSquare size={15} />;
      case "Saran":
        return <Lightbulb size={15} />;
      case "Laporan Bug":
        return <Bug size={15} />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-[#e2eaf0] overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
          <div>
            <h2
              id="feedback-modal-title"
              className="text-lg font-bold text-gray-900 font-heading tracking-tight"
            >
              Berikan Kritik & Saran
            </h2>
            <p className="mt-1 text-xs text-gray-500 leading-relaxed">
              Setiap masukanmu membantu kami membuat Jobora menjadi lebih baik.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition disabled:opacity-50 cursor-pointer"
            aria-label="Tutup modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Success View */}
        {isSuccess ? (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-in zoom-in duration-300">
              <CheckCircle2 size={26} />
            </div>
            <h3 className="text-base font-bold text-gray-900 font-heading">
              Feedback Berhasil Dikirim!
            </h3>
            <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
              Terima kasih atas masukanmu. Kami akan terus mengembangkan Jobora
              agar semakin bermanfaat untuk perjalanan kariermu.
            </p>
          </div>
        ) : (
          /* Form Content */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
            {/* Error Banner */}
            {errorMessage && (
              <div
                className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in duration-150"
                role="alert"
              >
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            {/* Field 1: Jenis Feedback */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Jenis Feedback <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {FEEDBACK_CATEGORIES.map((cat) => {
                  const isSelected = category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      disabled={isSubmitting}
                      className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                        isSelected
                          ? "bg-[#e6faf7] border-[#107c74] text-[#107c74] shadow-xs"
                          : "bg-white border-[#d8e2e9] text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                      }`}
                    >
                      {getCategoryIcon(cat)}
                      <span>{cat}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Field 2: Pesan Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="feedback-message"
                  className="block text-xs font-semibold text-gray-700"
                >
                  Pesan <span className="text-red-500">*</span>
                </label>
                <span
                  className={`text-[11px] ${
                    message.length > MAX_FEEDBACK_LENGTH
                      ? "text-red-600 font-semibold"
                      : "text-gray-400"
                  }`}
                >
                  {message.length} / {MAX_FEEDBACK_LENGTH} karakter
                </span>
              </div>
              <textarea
                id="feedback-message"
                name="message"
                required
                rows={5}
                maxLength={MAX_FEEDBACK_LENGTH}
                disabled={isSubmitting}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tuliskan kritik yang membangun, saran fitur baru, atau rincian kendala/bug yang kamu temui..."
                className="w-full p-3 rounded-xl border border-[#d8e2e9] bg-[#fbfcfd] focus:bg-white text-gray-900 text-xs sm:text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#107c74]/20 focus:border-[#107c74] disabled:bg-gray-50 disabled:opacity-60 transition resize-y min-h-[110px]"
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl border border-[#d8e2e9] bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !message.trim()}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#107c74] hover:bg-[#0d6861] active:bg-[#09544e] text-white text-xs font-semibold shadow-xs hover:shadow transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#107c74]/30"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <>
                    <Send size={13} />
                    <span>Kirim Feedback</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
