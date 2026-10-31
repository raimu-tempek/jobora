"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface AuthActionResult {
  error?: string;
  success?: boolean;
  message?: string;
}

export async function signIn(formData: FormData): Promise<AuthActionResult> {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email dan kata sandi wajib diisi." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: "Format email tidak valid. Silakan periksa kembali." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("invalid login credentials")) {
      return { error: "Email atau kata sandi salah. Silakan periksa kembali." };
    }
    if (msg.includes("email not confirmed")) {
      return {
        error:
          "Email belum dikonfirmasi. Silakan periksa kotak masuk email Anda untuk verifikasi.",
      };
    }
    if (msg.includes("too many requests") || msg.includes("rate limit")) {
      return {
        error: "Terlalu banyak percobaan masuk. Harap tunggu beberapa saat.",
      };
    }
    return { error: error.message };
  }

  redirect("/dashboard");
}

export async function signUp(formData: FormData): Promise<AuthActionResult> {
  const fullName = (formData.get("fullName") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!fullName || !email || !password) {
    return { error: "Semua kolom wajib diisi." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: "Format email tidak valid. Masukkan email yang benar." };
  }

  if (password.length < 6) {
    return { error: "Kata sandi harus terdiri dari minimal 6 karakter." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("already registered") || msg.includes("already exists")) {
      return {
        error:
          "Email ini sudah terdaftar. Silakan gunakan email lain atau masuk ke akun Anda.",
      };
    }
    if (msg.includes("password") && msg.includes("least")) {
      return { error: "Kata sandi harus terdiri dari minimal 6 karakter." };
    }
    return { error: error.message };
  }

  // If Supabase has email confirmation enabled, data.session will be null
  if (!data.session) {
    return {
      success: true,
      message:
        "Akun berhasil dibuat! Silakan periksa kotak masuk email Anda untuk konfirmasi pendaftaran sebelum masuk.",
    };
  }

  redirect("/dashboard");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
