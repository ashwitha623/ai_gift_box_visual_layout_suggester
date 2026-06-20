import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Package, Upload, Briefcase, Calendar } from "lucide-react";
import { BOX_SIZES, formatINR } from "@/lib/giftdata";

export default function RecipientStep({ details, onChange, selectedTotal }) {
  
  const getMinDeliveryDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 5);
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Handles loading local images as base64 data URLs for instant rendering
  const handleFileChange = (key, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      onChange({ ...details, [key]: e.target.result });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold font-heading text-foreground mb-2">Personalize Your Box</h2>
      <p className="text-muted-foreground mb-8">Add personal touches, custom messages, photos, or logos.</p>

      <div className="space-y-6 bg-card rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="font-semibold text-xs text-primary">Recipient Name <span className="text-rose-500">*</span></Label>
            <Input
              placeholder="e.g. Ananya Sharma"
              value={details.name || ""}
              onChange={(e) => onChange({ ...details, name: e.target.value })}
              className="rounded-xl h-11"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold text-xs text-primary">Sender Name <span className="text-rose-500">*</span></Label>
            <Input
              placeholder="Your Name"
              value={details.senderName || ""}
              onChange={(e) => onChange({ ...details, senderName: e.target.value })}
              className="rounded-xl h-11"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="font-semibold text-xs text-primary">Personal Message Card <span className="text-rose-500">*</span></Label>
          <Textarea
            placeholder="Write a heartfelt note to include in the box..."
            value={details.message || ""}
            onChange={(e) => onChange({ ...details, message: e.target.value })}
            className="rounded-xl h-20"
          />
        </div>

        {/* Custom Text Engraving */}
        <div className="space-y-2">
          <Label className="font-semibold text-xs text-primary">Custom Box Engraving (Lid Text)</Label>
          <Input
            placeholder="e.g. WITH LOVE, HAPPY BIRTHDAY"
            value={details.customText || ""}
            onChange={(e) => onChange({ ...details, customText: e.target.value })}
            className="rounded-xl h-11 uppercase"
            maxLength={30}
          />
        </div>

        {/* Delivery Address & Date */}
        <div className="space-y-2">
          <Label className="font-semibold text-xs text-primary">Delivery Address <span className="text-rose-500">*</span></Label>
          <Input
            placeholder="Complete shipping address..."
            value={details.deliveryAddress || ""}
            onChange={(e) => onChange({ ...details, deliveryAddress: e.target.value })}
            className="rounded-xl h-11"
          />
        </div>

        <div className="space-y-2">
          <Label className="font-semibold text-xs text-primary">Preferred Delivery Date <span className="text-rose-500">*</span></Label>
          <Input
            type="date"
            min={getMinDeliveryDate()}
            value={details.deliveryDate || ""}
            onChange={(e) => onChange({ ...details, deliveryDate: e.target.value })}
            className="rounded-xl h-11 bg-white"
          />
        </div>

        {/* Upload Personal Photo Card */}
        <div className="space-y-2">
          <Label className="font-semibold text-xs text-primary">Personal Photo Card Insert</Label>
          <div className="flex items-center gap-4">
            <label className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl p-3 hover:border-primary/50 cursor-pointer transition-colors bg-white">
              <Upload className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-muted-foreground">
                {details.photoUrl ? "✓ Photo Selected" : "Upload Photo"}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange("photoUrl", e.target.files[0])}
              />
            </label>
            {details.photoUrl && (
              <button 
                type="button" 
                onClick={() => onChange({ ...details, photoUrl: "" })}
                className="text-xs text-destructive hover:underline"
              >
                Remove
              </button>
            )}
          </div>
        </div>

        {/* Upload Corporate Logo */}
        <div className="space-y-2">
          <Label className="font-semibold text-xs text-primary">Corporate Logo Plate</Label>
          <div className="flex items-center gap-4">
            <label className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl p-3 hover:border-primary/50 cursor-pointer transition-colors bg-white">
              <Briefcase className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-muted-foreground">
                {details.logoUrl ? "✓ Logo Selected" : "Upload Logo"}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange("logoUrl", e.target.files[0])}
              />
            </label>
            {details.logoUrl && (
              <button 
                type="button" 
                onClick={() => onChange({ ...details, logoUrl: "" })}
                className="text-xs text-destructive hover:underline"
              >
                Remove
              </button>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Your selected products total {formatINR(selectedTotal)}.</p>
        </div>

        <div className="space-y-3">
          <Label className="font-semibold text-sm text-primary">Box Size</Label>
          <div className="grid grid-cols-3 gap-3">
            {BOX_SIZES.map((size) => (
              <button
                key={size}
                onClick={() => onChange({ ...details, boxSize: size })}
                className={`flex flex-col items-center gap-1.5 rounded-xl border-2 py-3.5 transition-all ${
                  details.boxSize === size
                    ? "border-primary bg-secondary shadow-md shadow-primary/10"
                    : "border-border bg-white hover:border-primary/40"
                }`}
              >
                <Package className={`${size === "Small" ? "w-5 h-5" : size === "Medium" ? "w-7 h-7" : "w-9 h-9"} text-primary`} />
                <span className="text-xs font-bold text-primary">{size}</span>
                <span className="text-[10px] font-medium text-slate-400">
                  {size === "Small" ? "26 x 18 x 11 cm" : size === "Medium" ? "30 x 22 x 12 cm" : "34 x 26 x 14 cm"}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}