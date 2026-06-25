import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Package, Upload, Briefcase, Calendar, AlertTriangle } from "lucide-react";
import { BOX_SIZES, BOX_TEMPLATES, formatINR } from "@/lib/giftdata";
import { generateRecommendations } from "@/lib/layoutEngine";

export default function RecipientStep({ details, onChange, selectedTotal, products, occasion, dbBoxes, dbLayoutTemplates }) {
  const sizeFits = (size) => {
    if (!occasion || !products || products.length === 0) return true;
    const testResult = generateRecommendations({
      occasion: occasion.id,
      occasionTitle: occasion.title,
      products,
      budget: details.budget,
      boxSize: size,
      boxTemplates: dbBoxes,
      layoutTemplates: dbLayoutTemplates
    });
    return testResult.success;
  };
  
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
          <Label className="font-semibold text-xs text-primary flex items-center justify-between">
            <span>Recipient Phone <span className="text-rose-500">*</span></span>
            {details.phone && details.phone.length !== 10 && (
              <span className="text-rose-500 text-[10px] font-semibold animate-pulse">* Must be exactly 10 digits</span>
            )}
          </Label>
          <Input
            placeholder="10-digit mobile number"
            value={details.phone || ""}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "").slice(0, 10);
              onChange({ ...details, phone: val });
            }}
            className="rounded-xl h-11"
            maxLength={10}
          />
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
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))" }}>
            {BOX_SIZES.map((size) => {
              const template = BOX_TEMPLATES.find(t => t.name.toLowerCase().startsWith(size.toLowerCase()));
              const fits = sizeFits(size);
              const isSelected = details.boxSize === size;

              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => onChange({ ...details, boxSize: size })}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border-2 py-3.5 transition-all ${
                    isSelected
                      ? fits
                        ? "border-primary bg-secondary shadow-md shadow-primary/10"
                        : "border-rose-500 bg-rose-50/20 shadow-md shadow-rose-500/5"
                      : fits
                        ? "border-border bg-white hover:border-primary/40"
                        : "border-rose-100 bg-rose-50/10 hover:border-rose-300"
                  }`}
                >
                  <Package className={`${size === "Small" ? "w-5 h-5" : size === "Medium" ? "w-7 h-7" : "w-9 h-9"} ${fits ? "text-primary" : "text-rose-500"}`} />
                  <span className={`text-xs font-bold ${fits ? "text-primary" : "text-rose-600"}`}>{size}</span>
                  <span className={`text-[9px] font-semibold ${fits ? "text-slate-400" : "text-rose-500"}`}>
                    {fits ? (template ? `${template.length} x ${template.width} x ${template.height} cm` : "") : "Insufficient Space"}
                  </span>
                </button>
              );
            })}
          </div>

          {!sizeFits(details.boxSize) && (
            <div className="mt-3 p-3 bg-rose-50/40 border border-rose-100 rounded-xl flex items-start gap-2.5 text-rose-700 animate-pulse">
              <AlertTriangle className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-[11px] font-bold tracking-tight">Box Size Too Small</p>
                <p className="text-[10px] text-rose-600 font-medium leading-relaxed">
                  Your selected items exceed the physical capacity of the {details.boxSize} box. Please select a larger box size or reduce items.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}