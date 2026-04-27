import { PageTransition } from "@/components/PageTransition";
import { BookOpen, ShoppingCart, Wallet, ArrowUpRight, ShieldCheck, Star, HelpCircle, ChevronRight } from "lucide-react";
import { Link } from "wouter";

interface Section {
  id: string;
  icon: React.ElementType;
  color: string;
  title: string;
  content: string;
  steps?: string[];
}

const sections: Section[] = [
  {
    id: "about",
    icon: BookOpen,
    color: "bg-blue-500",
    title: "Apa itu Malzz Nokos?",
    content:
      "Malzz Nokos adalah platform layanan nomor virtual (OTP) terpercaya yang membantu kamu mendapatkan nomor telepon sementara untuk verifikasi berbagai aplikasi tanpa menggunakan nomor pribadi.",
  },
  {
    id: "order",
    icon: ShoppingCart,
    color: "bg-indigo-500",
    title: "Cara Order Nomor",
    content: "Pesan nomor virtual dalam 3 langkah mudah:",
    steps: [
      "Buka menu Order lalu pilih layanan/aplikasi yang ingin kamu verifikasi.",
      "Pilih negara & provider yang tersedia, lalu klik Pesan Nomor.",
      "Salin nomor yang muncul, gunakan di aplikasi tujuan, lalu tunggu OTP masuk di halaman detail order.",
    ],
  },
  {
    id: "deposit",
    icon: Wallet,
    color: "bg-green-500",
    title: "Cara Deposit Saldo",
    content: "Isi saldo akunmu menggunakan QRIS:",
    steps: [
      "Buka menu Deposit dan masukkan nominal yang ingin ditambahkan.",
      "Scan QR Code yang muncul menggunakan aplikasi pembayaran (GoPay, OVO, Dana, dll.).",
      "Saldo otomatis bertambah setelah pembayaran berhasil.",
    ],
  },
  {
    id: "withdraw",
    icon: ArrowUpRight,
    color: "bg-orange-500",
    title: "Tarik Saldo (Admin)",
    content:
      "Fitur tarik saldo tersedia khusus untuk admin. Admin dapat mentransfer saldo ke rekening bank atau e-wallet yang terdaftar melalui menu Tarik.",
  },
  {
    id: "account",
    icon: ShieldCheck,
    color: "bg-purple-500",
    title: "Akun & Keamanan",
    content: "Tips menjaga keamanan akun kamu:",
    steps: [
      "Gunakan password yang kuat (minimal 8 karakter, kombinasi huruf & angka).",
      "Jangan bagikan email dan password ke siapapun.",
      "Gunakan fitur Lupa Password jika kamu lupa kredensial login.",
      "Hubungi CS jika akun kamu terindikasi disalahgunakan.",
    ],
  },
  {
    id: "testimoni",
    icon: Star,
    color: "bg-yellow-500",
    title: "Testimoni",
    content:
      "Puas dengan layanan kami? Tulis testimoni kamu di halaman utama! Testimoni membantu pengguna lain mengenal Malzz Nokos lebih baik.",
  },
  {
    id: "faq",
    icon: HelpCircle,
    color: "bg-teal-500",
    title: "FAQ",
    content: "",
    steps: [
      "OTP tidak masuk? Pastikan nomor masih aktif & belum expired di halaman detail order.",
      "Deposit belum masuk? Tunggu hingga 5 menit, jika masih belum masuk hubungi CS.",
      "Nomor sudah expired tapi OTP belum datang? Saldo tidak dipotong untuk order yang gagal.",
      "Bisa request layanan baru? Ya, hubungi admin via WhatsApp.",
    ],
  },
];

export default function Docs() {
  return (
    <PageTransition>
      <div className="pb-10">
        {/* Header */}
        <div className="bg-gradient-primary pt-12 pb-16 px-6 rounded-b-[2rem] text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-white/80 text-xs font-bold uppercase tracking-widest">Panduan</span>
            </div>
            <h1 className="text-2xl font-bold mb-1">Dokumentasi</h1>
            <p className="text-white/75 text-sm">Semua yang perlu kamu tahu tentang Malzz Nokos</p>
          </div>
        </div>

        {/* Sections */}
        <div className="px-4 mt-6 space-y-4">
          {sections.map((s) => (
            <div
              key={s.id}
              className="bg-white dark:bg-card rounded-2xl shadow-sm border overflow-hidden"
            >
              {/* Section header */}
              <div className="flex items-center gap-3 p-4 border-b">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 ${s.color}`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <h2 className="font-bold text-sm text-foreground">{s.title}</h2>
              </div>

              {/* Section body */}
              <div className="p-4">
                {s.content && (
                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{s.content}</p>
                )}
                {s.steps && (
                  <ol className="space-y-2">
                    {s.steps.map((step, i) => (
                      <li key={i} className="flex gap-3 items-start">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <p className="text-sm text-foreground/80 leading-relaxed">{step}</p>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          ))}

          {/* CTA card */}
          <Link href="/">
            <div className="mt-2 bg-gradient-primary rounded-2xl p-4 flex items-center justify-between text-white shadow-md active:scale-95 transition-transform cursor-pointer">
              <div>
                <p className="font-bold text-sm">Siap Mulai?</p>
                <p className="text-white/75 text-xs mt-0.5">Kembali ke halaman utama</p>
              </div>
              <ChevronRight className="w-5 h-5 text-white/80" />
            </div>
          </Link>
        </div>
      </div>
    </PageTransition>
  );
}
