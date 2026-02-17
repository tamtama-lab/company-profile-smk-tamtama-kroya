import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "./Layout/LayoutWrapper";
import { AlertProvider } from "./components/ui/alert";
import { TooltipProvider } from "./components/ui/tooltip";
import { ThemeProvider } from "./providers/ThemeProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "SPMB SMK Tamtama Kroya",
  description: "Website Sistem Penerimaan Murid Baru SMK Tamtama Kroya",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider>
          <AlertProvider>
            <TooltipProvider>
              <LayoutWrapper>{children}</LayoutWrapper>
            </TooltipProvider>
          </AlertProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
