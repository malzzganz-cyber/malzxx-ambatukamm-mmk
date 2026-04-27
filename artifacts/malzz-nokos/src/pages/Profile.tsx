import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { PageTransition } from "@/components/PageTransition";
import { useProfile, useOrderHistory, useDepositHistory } from "@/hooks/use-local-storage";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { User, Camera, ShoppingCart, Wallet, Edit2, Check, LogIn, LogOut, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user, isAdmin, signOut } = useAuth();
  const [profile, setProfile] = useProfile();
  const [orders] = useOrderHistory();
  const [deposits] = useDepositHistory();

  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(profile.name);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayName = user?.displayName || profile.name;
  const photoUrl = user?.photoURL || profile.photoBase64 || null;

  const handleSaveName = () => {
    if (!nameInput.trim()) return;
    setProfile({ ...profile, name: nameInput });
    setIsEditing(false);
    toast({ title: "Tersimpan", description: "Nama profil diperbarui" });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "Terlalu besar", description: "Ukuran foto maksimal 2MB", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setProfile({ ...profile, photoBase64: base64 });
      toast({ title: "Foto Diperbarui", description: "Foto profil berhasil diunggah" });
    };
    reader.readAsDataURL(file);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({ title: "Berhasil keluar" });
    } catch (e: any) {
      toast({ title: "Gagal keluar", description: e?.message || "", variant: "destructive" });
    }
  };

  return (
    <PageTransition>
      <div className="p-4 pt-12">
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4 group cursor-pointer" onClick={() => !user?.photoURL && fileInputRef.current?.click()}>
            <div className="w-24 h-24 rounded-full overflow-hidden bg-muted/50 border-4 border-background shadow-lg flex items-center justify-center relative">
              {photoUrl ? (
                <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-muted-foreground/50" />
              )}
              {!user?.photoURL && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              )}
            </div>
            {!user?.photoURL && (
              <div className="absolute bottom-0 right-0 p-1.5 bg-primary rounded-full text-primary-foreground border-2 border-background shadow-sm">
                <Camera className="w-4 h-4" />
              </div>
            )}
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handlePhotoUpload} />
          </div>

          {user ? (
            <>
              <h2 className="text-xl font-bold text-foreground">{displayName}</h2>
              {user.email && <p className="text-xs text-muted-foreground mt-1">{user.email}</p>}
              {isAdmin && (
                <span className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500 text-[10px] font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3 h-3" /> Admin
                </span>
              )}
            </>
          ) : isEditing ? (
            <div className="flex items-center gap-2">
              <Input value={nameInput} onChange={(e) => setNameInput(e.target.value)} className="h-9 w-40 text-center font-bold" autoFocus />
              <Button size="icon" className="h-9 w-9 rounded-xl" onClick={handleSaveName}>
                <Check className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsEditing(true)}>
              <h2 className="text-xl font-bold text-foreground">{profile.name}</h2>
              <Edit2 className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="border-none shadow-sm bg-white dark:bg-card">
            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
              <div className="p-3 bg-blue-500/10 rounded-full text-blue-500 mb-1">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold">{orders.length}</h3>
              <p className="text-xs text-muted-foreground font-semibold uppercase">Total Order</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white dark:bg-card">
            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
              <div className="p-3 bg-green-500/10 rounded-full text-green-500 mb-1">
                <Wallet className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold">{deposits.length}</h3>
              <p className="text-xs text-muted-foreground font-semibold uppercase">Total Deposit</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider px-1 mb-3">Akun</h3>
          {user ? (
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="w-full justify-start h-12 font-medium bg-white dark:bg-card border-none shadow-sm rounded-xl text-red-500 hover:text-red-600"
              data-testid="button-signout"
            >
              <LogOut className="w-4 h-4 mr-2" /> Keluar
            </Button>
          ) : (
            <Button
              onClick={() => setLocation("/signin")}
              className="w-full justify-start h-12 font-medium rounded-xl bg-gradient-primary text-white shadow-md"
              data-testid="button-go-signin"
            >
              <LogIn className="w-4 h-4 mr-2" /> Masuk / Daftar
            </Button>
          )}
          <Button variant="outline" className="w-full justify-start h-12 font-medium bg-white dark:bg-card border-none shadow-sm rounded-xl text-muted-foreground hover:text-foreground">
            Syarat & Ketentuan
          </Button>
          <Button variant="outline" className="w-full justify-start h-12 font-medium bg-white dark:bg-card border-none shadow-sm rounded-xl text-muted-foreground hover:text-foreground">
            Bantuan / CS
          </Button>
        </div>
      </div>
    </PageTransition>
  );
}
