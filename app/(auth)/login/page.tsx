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
import { useEffect, useState } from "react";
import z from "zod";
import { TextButton } from "@/components/Buttons/TextButton";
import { useAlert } from "@/components/ui/alert";
import { isAuthenticated, saveAuthData, AuthData } from "@/utils/auth";

const loginSchema = z.object({
  username: z.string().min(1, "Mohon isi username terlebih dahulu"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  remember_me: z.boolean(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { showAlert } = useAlert();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      remember_me: false,
    },
  });

  // Check if user already authenticated, redirect to dashboard
  useEffect(() => {
    const checkAuth = () => {
      if (isAuthenticated()) {
        // Get redirect destination or default to dashboard
        const redirectPath =
          sessionStorage.getItem("redirectAfterLogin") || "/dashboard";
        sessionStorage.removeItem("redirectAfterLogin");
        router.replace(redirectPath);
      } else {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: data.username,
          password: data.password,
          remember_me: data.remember_me,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        showAlert({ title: result.error || "Login gagal", variant: "error" });
        return;
      }

      // Save auth data based on remember_me preference
      const authData: AuthData = {
        access_token: result.access_token,
        expiresAt: result.expiresAt,
        user: result.user,
      };
      saveAuthData(authData, data.remember_me);

      // Redirect ke halaman dashboard atau intended destination
      showAlert({
        title: "Login berhasil",
        description: `Selamat datang, ${result.user.fullName}!`,
        variant: "success",
      });

      // Get redirect destination or default to dashboard
      const redirectPath =
        sessionStorage.getItem("redirectAfterLogin") || "/dashboard";
      sessionStorage.removeItem("redirectAfterLogin");

      setTimeout(() => {
        router.push(redirectPath);
      }, 1500);
    } catch (error) {
      showAlert({ title: "Terjadi kesalahan, coba lagi", variant: "error" });
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const message = "Halo! Mohon bantu saya untuk pembuatan akun guru";
  const encodedMessage = encodeURIComponent(message);

  // Show loading while checking authentication
  if (checkingAuth) {
    return (
      <div className="w-full max-w-md px-6 flex flex-col items-center justify-center min-h-100">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 mt-4">Memeriksa sesi...</p>
      </div>
    );
  }

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
                checked={form.watch("remember_me")}
                onChange={(e) => form.setValue("remember_me", e.target.checked)}
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
            disabled={
              loading ||
              form.formState.isSubmitting ||
              !form.formState.isValid ||
              false
            }
            className="w-full bg-primary hover:bg-primary/90 text-white rounded-md font-semibold transition"
            text={loading ? "Memuat..." : "Masuk"}
          />
        </form>
      </Form>

      {/* Links */}
      <p className="text-center text-sm text-gray-600">
        Belum punya akun?{" "}
        <Link
          href={`https://wa.me/6281325767718?text=${encodedMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline font-semibold"
        >
          Hubungi Admin
        </Link>
      </p>
    </div>
  );
}
