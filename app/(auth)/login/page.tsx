"use client";

import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { FormInput } from "@/components/ui/form-input";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import z from "zod";
import { TextButton } from "@/components/Buttons/TextButton";
import { useAlert } from "@/components/ui/alert";

const loginSchema = z.object({
  username: z.string().min(1, "Username tidak boleh kosong"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { showAlert } = useAlert();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        showAlert({ title: result.error || "Login gagal", variant: "error" });
        return;
      }

      // Simpan token ke localStorage atau cookie
      localStorage.setItem("authToken", result.token);
      localStorage.setItem("tokenType", result.type);
      localStorage.setItem("tokenExpiresAt", result.expiresAt);

      // Redirect ke halaman dashboard atau home
      router.push("/");
    } catch (error) {
      showAlert({ title: "Terjadi kesalahan, coba lagi", variant: "error" });
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md px-6 flex flex-col items-center space-y-6">
      <Image src={"/header/logo.png"} alt="Logo" width={60} height={60} />
      <div className="text-center">
        <h1 className="text-2xl font-bold text-primary">
          Selamat Datang Kembali
        </h1>
        <p className="text-gray-600 text-sm mt-2">
          Mohon Masukkan Username dan Password Anda
        </p>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {errorMessage}
        </div>
      )}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-5"
        >
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FormInput
                    {...field}
                    label="Username"
                    placeholder="Masukkan Username Anda"
                    type="text"
                    error={form.formState.errors.username?.message}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FormInput
                    {...field}
                    label="Password"
                    placeholder="Masukkan Password Anda"
                    type="password"
                    error={form.formState.errors.password?.message}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="w-full flex flex-row items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4"
                aria-label="Ingat Saya"
              />
              <label
                htmlFor="remember"
                className="ml-2 text-sm text-gray-700 cursor-pointer"
              >
                Ingat Saya
              </label>
            </div>
            <Link
              href="/forgot-password"
              className="text-sm text-primary underline"
            >
              Lupa Password?
            </Link>
          </div>

          <TextButton
            variant="primary"
            isSubmit
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-white rounded-md font-semibold transition"
            text={loading ? "Memuat..." : "Masuk"}
          />
        </form>
      </Form>

      {/* Links */}
      <p className="text-center text-sm text-gray-600">
        Belum punya akun?{" "}
        <Link href="/register" className="text-primary underline font-semibold">
          Hubungi Admin
        </Link>
      </p>
    </div>
  );
}
