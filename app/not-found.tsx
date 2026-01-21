import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary">404</h1>
        <h2 className="text-3xl font-semibold text-gray-800 mt-4">
          Halaman Tidak Ditemukan
        </h2>
        <p className="text-gray-600 mt-2 mb-8">
          Maaf, halaman yang Anda cari tidak tersedia.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 text-primary text-white rounded-lg hover:bg-[#013318] transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
