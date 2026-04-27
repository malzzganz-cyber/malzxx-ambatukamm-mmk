import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { useCreateTestimonial } from "@/hooks/use-nokos";
import { useToast } from "@/hooks/use-toast";

export function TestimonialDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast();
  const createTestimonial = useCreateTestimonial();
  
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);

  const handleSubmit = async () => {
    if (!name || !comment) {
      toast({ title: "Inkomplit", description: "Isi nama dan komentar", variant: "destructive" });
      return;
    }
    
    try {
      await createTestimonial.mutateAsync({ name, rating, comment });
      toast({ title: "Berhasil", description: "Terima kasih atas testimoni Anda!" });
      setName("");
      setComment("");
      setRating(5);
      onOpenChange(false);
    } catch (e) {
      toast({ title: "Gagal", description: "Tidak dapat mengirim testimoni", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[380px] rounded-3xl p-6">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-bold text-center">Tulis Testimoni</DialogTitle>
          <DialogDescription className="text-center text-xs">Bagikan pengalaman Anda menggunakan Malzz Nokos.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-center gap-2 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-8 h-8 cursor-pointer transition-colors ${star <= rating ? "text-yellow-400 fill-yellow-400" : "text-muted"}`}
                onClick={() => setRating(star)}
              />
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Nama Anda</label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Budi Santoso" className="h-12 bg-muted/30" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Komentar</label>
            <Textarea 
              value={comment} 
              onChange={e => setComment(e.target.value)} 
              placeholder="Mantap banget layanannya cepat..." 
              className="bg-muted/30 resize-none min-h-[100px]" 
            />
          </div>

          <Button 
            className="w-full h-12 font-bold rounded-xl mt-2" 
            onClick={handleSubmit}
            disabled={createTestimonial.isPending}
          >
            {createTestimonial.isPending ? "Mengirim..." : "Kirim Testimoni"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
