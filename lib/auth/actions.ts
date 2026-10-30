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

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Provide user-friendly Indonesian message for invalid credentials
    if (error.message.toLowerCase().includes("invalid login credentials")) {
      return { error: "Email atau kata sandi salah. Silakan coba lagi." };
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
