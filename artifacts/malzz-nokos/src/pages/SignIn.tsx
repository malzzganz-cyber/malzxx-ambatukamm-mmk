import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, AlertTriangle, Eye, EyeOff, Mail, Lock, User } from "lucide-react";

type Mode = "signin" | "register" | "reset";

export default function SignIn() {
  const [, setLocation] = useLocation();
  const { user, loading, isFirebaseReady, signInEmail, register, resetPassword } = useAuth();
  const { toast } = useToast();

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      setLocation("/");
    }
  }, [user, loading, setLocation]);

  const handleSubmit = async () => {
    if (!email.trim()) {
      toast({ title: "Email wajib diisi", variant: "destructive" });
      return;
    }

    setBusy(true);
    try {
      if (mode === "signin") {
        if (!password) {
          toast({ title: "Password wajib diisi", variant: "destructive" });
          return;
        }
        await signInEmail(email.trim(), password);
        toast({ title: "Berhasil masuk", description: "Selamat datang di Malzz Nokos" });
        setLocation("/");
      } else if (mode === "register") {
        if (!displayName.trim()) {
          toast({ title: "Nama wajib diisi", variant: "destructive" });
          return;
        }
        if (password.length < 6) {
          toast({ title: "Password minimal 6 karakter", variant: "destructive" });
          return;
        }
        if (password !== confirmPassword) {
          toast({ title: "Konfirmasi password tidak cocok", variant: "destructive" });
          return;
        }
        await register(email.trim(), password, displayName.trim());
        toast({ title: "Akun berhasil dibuat", description: "Selamat datang di Malzz Nokos!" });
        setLocation("/");
      } else if (mode === "reset") {
        await resetPassword(email.trim());
        toast({
          title: "Email terkirim",
          description: "Cek inbox kamu untuk link reset password.",
        });
        setMode("signin");
      }
    } catch (e: any) {
      const msg = translateFirebaseError(e?.code || e?.message || "");
      toast({ title: "Gagal", description: msg, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const title =
    mode === "signin"
      ? "Masuk ke Malzz Nokos"
      : mode === "register"
        ? "Daftar Akun Baru"
        : "Reset Password";

  const subtitle =
    mode === "signin"
      ? "Masuk dengan email dan password untuk mengakses layanan."
      : mode === "register"
        ? "Buat akun gratis dan mulai gunakan layanan OTP virtual."
        : "Masukkan email kamu, kami kirim link reset password.";

  return (
    <PageTransition>
      <div className="p-6 pt-12 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mb-4 shadow-lg">
          <ShieldCheck className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        <p className="text-sm text-muted-foreground mb-8 max-w-xs">{subtitle}</p>

        {!isFirebaseReady ? (
          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-500/10 mb-6 w-full max-w-xs">
            <CardContent className="p-4 flex gap-3 items-start text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-left">
                Firebase belum dikonfigurasi. Periksa env var <code>VITE_FIREBASE_*</code>.
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="w-full max-w-xs space-y-4">
            {/* Nama (register only) */}
            {mode === "register" && (
              <div className="space-y-1 text-left">
                <Label htmlFor="displayName" className="text-xs font-semibold">
                  Nama Lengkap
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="Nama kamu"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="pl-10 h-12 rounded-xl"
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1 text-left">
              <Label htmlFor="email" className="text-xs font-semibold">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="email@kamu.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 rounded-xl"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password (signin & register) */}
            {mode !== "reset" && (
              <div className="space-y-1 text-left">
                <Label htmlFor="password" className="text-xs font-semibold">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={mode === "register" ? "Min. 6 karakter" : "••••••••"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 rounded-xl"
                    autoComplete={mode === "register" ? "new-password" : "current-password"}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Confirm Password (register only) */}
            {mode === "register" && (
              <div className="space-y-1 text-left">
                <Label htmlFor="confirmPassword" className="text-xs font-semibold">
                  Konfirmasi Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Ulangi password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 h-12 rounded-xl"
                    autoComplete="new-password"
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  />
                </div>
              </div>
            )}

            {/* Forgot password link */}
            {mode === "signin" && (
              <div className="text-right">
                <button
                  type="button"
                  className="text-xs text-primary hover:underline"
                  onClick={() => setMode("reset")}
                >
                  Lupa password?
                </button>
              </div>
            )}

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={busy || loading}
              className="w-full h-12 rounded-xl font-semibold bg-gradient-primary text-white shadow-md"
              data-testid="button-submit"
            >
              {busy
                ? "Memuat..."
                : mode === "signin"
                  ? "Masuk"
                  : mode === "register"
                    ? "Daftar"
                    : "Kirim Link Reset"}
            </Button>

            {/* Mode switcher */}
            <div className="pt-2 text-sm text-muted-foreground space-y-1">
              {mode === "signin" && (
                <p>
                  Belum punya akun?{" "}
                  <button
                    type="button"
                    className="text-primary font-semibold hover:underline"
                    onClick={() => setMode("register")}
                  >
                    Daftar
                  </button>
                </p>
              )}
              {(mode === "register" || mode === "reset") && (
                <p>
                  Sudah punya akun?{" "}
                  <button
                    type="button"
                    className="text-primary font-semibold hover:underline"
                    onClick={() => setMode("signin")}
                  >
                    Masuk
                  </button>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}

function translateFirebaseError(code: string): string {
  const map: Record<string, string> = {
    "auth/user-not-found": "Akun tidak ditemukan.",
    "auth/wrong-password": "Password salah.",
    "auth/invalid-email": "Format email tidak valid.",
    "auth/email-already-in-use": "Email sudah digunakan akun lain.",
    "auth/weak-password": "Password terlalu lemah, gunakan minimal 6 karakter.",
    "auth/too-many-requests": "Terlalu banyak percobaan, coba lagi nanti.",
    "auth/network-request-failed": "Gagal terhubung ke internet.",
    "auth/invalid-credential": "Email atau password salah.",
  };
  return map[code] || code || "Terjadi kesalahan, coba lagi.";
}
