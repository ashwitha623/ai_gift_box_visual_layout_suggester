import { useMemo, useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { CATEGORY_FALLBACKS } from "@/lib/giftdata";
import { generateRecommendations } from "@/lib/layoutEngine";

// Helper to generate wavy cubic/quadratic paths for SVG crinkle strands
const generateWavyPath = (w, h, isHoriz) => {
  if (isHoriz) {
    const steps = 6;
    const stepWidth = w / steps;
    let path = `M 0 ${h / 2}`;
    for (let i = 0; i < steps; i++) {
      const x1 = i * stepWidth + stepWidth / 3;
      const y1 = i % 2 === 0 ? 1 : h - 1;
      const x2 = i * stepWidth + (2 * stepWidth) / 3;
      const y2 = i % 2 === 0 ? h - 1 : 1;
      const x3 = (i + 1) * stepWidth;
      const y3 = h / 2;
      path += ` C ${x1} ${y1}, ${x2} ${y2}, ${x3} ${y3}`;
    }
    return path;
  } else {
    const steps = 6;
    const stepHeight = h / steps;
    let path = `M ${w / 2} 0`;
    for (let i = 0; i < steps; i++) {
      const x1 = i % 2 === 0 ? 1 : w - 1;
      const y1 = i * stepHeight + stepHeight / 3;
      const x2 = i % 2 === 0 ? w - 1 : 1;
      const y2 = i * stepHeight + (2 * stepHeight) / 3;
      const x3 = w / 2;
      const y3 = (i + 1) * stepHeight;
      path += ` C ${x1} ${y1}, ${x2} ${y2}, ${x3} ${y3}`;
    }
    return path;
  }
};

// Retrieve occasion-specific paper filler config
function getOccasionFillerColors(occasion) {
  switch (occasion) {
    case "birthday":
      return {
        base: "#FFECF0",
        shreds: ["#FF6B6B", "#4DABF7", "#FFD43B", "#51CF66", "#F06595", "#CC5DE8", "#FFF0F6"]
      };
    case "corporate":
      return {
        base: "#111827", // deep black/grey
        shreds: ["#1F2937", "#111827", "#D4AF37", "#0B1D37", "#4B5563"]
      };
    case "wedding":
      return {
        base: "#FCFBF9", // pure silk white
        shreds: ["#FFFFFF", "#FAF6F0", "#E8DCC4", "#F5EFE6", "#D4AF37"]
      };
    case "anniversary":
      return {
        base: "#4A0404", // deep velvet red
        shreds: ["#C94F6D", "#8B0000", "#FF6B8B", "#FFF0F2", "#D4AF37", "#5C0612"]
      };
    case "graduation":
      return {
        base: "#EFECE9",
        shreds: ["#1E293B", "#F8FAFC", "#D4AF37", "#64748B", "#475569"]
      };
    default:
      return {
        base: "#D7B48E", // Kraft brown default
        shreds: ["#8B623A", "#A0784E", "#B58D5F", "#C49A6C", "#D7B48E", "#E2CDAF"]
      };
  }
}

// High-performance canvas-drawn crinkle paper bed
function CrinklePaperCanvas({ occasion }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      drawShreds(ctx, rect.width, rect.height);
    };

    const drawShreds = (ctx, w, h) => {
      const config = getOccasionFillerColors(occasion);
      ctx.fillStyle = config.base;
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.shadowColor = occasion === "corporate" || occasion === "anniversary" 
        ? "rgba(0, 0, 0, 0.45)" 
        : "rgba(40, 20, 5, 0.22)";
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1.8;

      // Draw dense wood wool (450 strands)
      const count = 450;
      for (let i = 0; i < count; i++) {
        const color = config.shreds[Math.floor(Math.random() * config.shreds.length)];
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.1 + Math.random() * 0.9;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        const startX = Math.random() * (w + 40) - 20;
        const startY = Math.random() * (h + 40) - 20;
        const length = 45 + Math.random() * 75;
        const angle = Math.random() * Math.PI * 2;

        ctx.beginPath();
        ctx.moveTo(startX, startY);

        let cx = startX;
        let cy = startY;
        const segments = 4;
        const segLen = length / segments;

        for (let s = 0; s < segments; s++) {
          const nextX = cx + Math.cos(angle) * segLen + (Math.random() - 0.5) * 12;
          const nextY = cy + Math.sin(angle) * segLen + (Math.random() - 0.5) * 12;

          const cpX = (cx + nextX) / 2 + (Math.random() - 0.5) * 15;
          const cpY = (cy + nextY) / 2 + (Math.random() - 0.5) * 15;

          ctx.quadraticCurveTo(cpX, cpY, nextX, nextY);
          cx = nextX;
          cy = nextY;
        }
        ctx.stroke();
      }
      ctx.restore();
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [occasion]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ display: "block" }}
    />
  );
}

// Product component containing sizing, shadows, and hover states
function ProductTile({ p, slot, index }) {
  const fallbackSrc =
    CATEGORY_FALLBACKS[p.category] ||
    CATEGORY_FALLBACKS["Lifestyle Gifts"];

  const [imgSrc, setImgSrc] = useState(p.image || fallbackSrc);
  const [processed, setProcessed] = useState(false);

  useEffect(() => {
    const srcToProcess = p.image || fallbackSrc;
    if (!srcToProcess) return;

    const img = new Image();
    const isExternal = srcToProcess.startsWith("http") && !srcToProcess.includes(window.location.host);
    if (isExternal) {
      img.crossOrigin = "anonymous";
    }
    img.src = srcToProcess;
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        let hasTransparency = false;
        for (let i = 3; i < data.length; i += 4) {
          if (data[i] < 200) {
            hasTransparency = true;
            break;
          }
        }

        if (hasTransparency) {
          setImgSrc(srcToProcess);
          setProcessed(true);
          return;
        }

        const W = canvas.width;
        const H = canvas.height;
        const visited = new Uint8Array(W * H);
        const queue = [];

        const isBg = (r, g, b) => {
          if (r > 200 && g > 200 && b > 200) return true;
          if (r > 160 && r < 240 && g > 160 && g < 240 && b > 160 && b < 240) {
            if (Math.abs(r - g) < 12 && Math.abs(g - b) < 12) return true;
          }
          return false;
        };

        for (let x = 0; x < W; x++) {
          queue.push(x, 0);
          visited[x] = 1;
          queue.push(x, H - 1);
          visited[(H - 1) * W + x] = 1;
        }
        for (let y = 1; y < H - 1; y++) {
          queue.push(0, y);
          visited[y * W] = 1;
          queue.push(W - 1, y);
          visited[y * W + (W - 1)] = 1;
        }

        let head = 0;
        while (head < queue.length) {
          const cx = queue[head++];
          const cy = queue[head++];
          const idx = (cy * W + cx) * 4;

          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          if (isBg(r, g, b)) {
            data[idx + 3] = 0;

            const neighbors = [
              [cx + 1, cy],
              [cx - 1, cy],
              [cx, cy + 1],
              [cx, cy - 1]
            ];
            for (let i = 0; i < neighbors.length; i++) {
              const nx = neighbors[i][0];
              const ny = neighbors[i][1];
              if (nx >= 0 && nx < W && ny >= 0 && ny < H) {
                const vIdx = ny * W + nx;
                if (visited[vIdx] === 0) {
                  visited[vIdx] = 1;
                  queue.push(nx, ny);
                }
              }
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        setImgSrc(canvas.toDataURL("image/png"));
        setProcessed(true);
      } catch (err) {
        console.error("Canvas background removal failed:", err);
        setImgSrc(srcToProcess);
        setProcessed(true);
      }
    };
    img.onerror = () => {
      setImgSrc(srcToProcess);
      setProcessed(false);
    };
  }, [p.image, fallbackSrc]);

  const visualScale = 1.5; // Scale up visually by 50%
  const visualW = slot.pctW * visualScale;
  const visualH = slot.pctH * visualScale;
  const visualX = slot.pctX - (visualW - slot.pctW) / 2;
  const visualY = slot.pctY - (visualH - slot.pctH) / 2;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, rotate: (slot.rotated ? 90 : 0) - 10, scale: 0.6 }}
      animate={{ opacity: 1, y: 0, rotate: slot.rotated ? 90 : 0, scale: 1 }}
      transition={{
        delay: index * 0.08,
        type: "spring",
        stiffness: 150,
        damping: 15
      }}
      className="absolute group flex items-center justify-center pointer-events-auto"
      style={{
        left: `${visualX}%`,
        top: `${visualY}%`,
        width: `${visualW}%`,
        height: `${visualH}%`,
        zIndex: 20 + index, 
        background: "transparent",
        filter: "drop-shadow(0 10px 15px rgba(20, 10, 5, 0.45)) drop-shadow(0 3px 6px rgba(20, 10, 5, 0.2))",
        transition: "filter 0.3s ease, transform 0.3s ease"
      }}
      whileHover={{
        scale: 1.05,
        y: -5,
        filter: "drop-shadow(0 20px 25px rgba(20, 10, 5, 0.55)) drop-shadow(0 8px 12px rgba(20, 10, 5, 0.35))",
        zIndex: 150
      }}
    >
      <img
        src={processed ? imgSrc : (p.image || fallbackSrc)}
        alt={p.name}
        className="max-w-full max-h-full object-contain select-none pointer-events-none transform transition-transform duration-300 group-hover:scale-[1.03]"
        onError={(e) => {
          e.currentTarget.src = fallbackSrc;
        }}
      />
    </motion.div>
  );
}

export default function GiftBoxVisual({
  products,
  ribbonHex = "#D4AF37",
  layoutId = "recommended",
  size = "lg",
  customizations = {}
}) {
  const occasionId = customizations.occasion || "just_because";

  // Dynamically generate packing layout in the visualizer based on active layoutId
  const layoutData = useMemo(() => {
    const recs = generateRecommendations({
      occasion: occasionId,
      occasionTitle: occasionId.charAt(0).toUpperCase() + occasionId.slice(1),
      products,
      budget: customizations.budget || 100000,
      boxSize: customizations.boxSize || "Medium"
    });

    const activeLayoutId = layoutId || "recommended";
    if (recs.recommended.id === activeLayoutId) {
      return recs.recommended;
    }
    const found = recs.alternatives.find(a => a.id === activeLayoutId);
    return found || recs.recommended;
  }, [products, layoutId, occasionId, customizations.budget, customizations.boxSize]);

  const maxW = size === "lg" ? "max-w-3xl" : "max-w-xs";

  // Procedural Top-layer crinkle paper shreds (rendered above products for realistic nesting depth)
  const topShreds = useMemo(() => {
    const config = getOccasionFillerColors(occasionId);
    return Array.from({ length: 8 }).map((_, i) => {
      const isHorizontal = Math.random() > 0.5;
      const color = config.shreds[Math.floor(Math.random() * config.shreds.length)];
      const width = isHorizontal ? 60 + Math.random() * 40 : 8 + Math.random() * 4;
      const height = isHorizontal ? 8 + Math.random() * 4 : 60 + Math.random() * 40;

      return {
        id: i,
        left: Math.random() * 80 + 10,
        top: Math.random() * 80 + 10,
        width,
        height,
        rotate: Math.random() * 360,
        color: color,
        opacity: 0.85 + Math.random() * 0.15,
        isHorizontal
      };
    });
  }, [occasionId]);

  if (!layoutData) return null;
  
  const { box, items } = layoutData;

  // Box background styling mapping to template configurations
  const boxBgStyle = {
    pink_luxury: {
      background: "linear-gradient(135deg, #FFF0F2 0%, #FFD3DD 100%)", // Blush pink texture
      borderFoil: "border-pink-300/40",
      innerRim: "#FFB3C6",
      textColor: "text-pink-900"
    },
    pink_pattern: {
      background: "linear-gradient(135deg, #FF6B8B 0%, #D81B60 100%)", // Treillage Pink/Gold pattern
      borderFoil: "border-amber-300/60 shadow-[inset_0_0_15px_rgba(212,175,55,0.35)]",
      innerRim: "#C2185B",
      textColor: "text-pink-100"
    },
    black_gold: {
      background: "linear-gradient(135deg, #1C1C1C 0%, #0C0C0C 100%)", // Matte black gold
      borderFoil: "border-[#D4AF37]/50 shadow-[inset_0_0_20px_rgba(212,175,55,0.25)]",
      innerRim: "#0F0F0F",
      textColor: "text-amber-100"
    },
    crocodile_premium: {
      background: "linear-gradient(135deg, #3E2723 0%, #1A0C06 100%)", // Brown Crocodile Leather
      borderFoil: "border-slate-800/40 shadow-[inset_0_0_25px_rgba(0,0,0,0.55)]",
      innerRim: "#27120A",
      textColor: "text-amber-50"
    },
    gold_ribbon: {
      background: "linear-gradient(135deg, #FAD961 0%, #F76B1C 100%)", // Classic Foil Gold
      borderFoil: "border-red-600/40 shadow-[inset_0_0_18px_rgba(255,255,255,0.4)]",
      innerRim: "#D4AF37",
      textColor: "text-amber-950"
    }
  }[box.id] || {
    background: "linear-gradient(135deg, #0B1D37 0%, #050E1B 100%)",
    borderFoil: "border-[#D4AF37]/35",
    innerRim: "#061324",
    textColor: "text-amber-100"
  };

  return (
    <div className={`relative mx-auto w-full ${maxW}`}>
      {/* Ambient Ground Shadow */}
      <div
        className="absolute left-[3%] right-[3%] -bottom-6 h-8 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, rgba(3, 10, 25, 0.28) 0%, rgba(3, 10, 25, 0) 72%)",
          filter: "blur(12px)",
          borderRadius: "999px",
        }}
      />

      {/* Rectangular Rigid Luxury Gift Box */}
      <div
        className="relative rounded-2xl transition-all duration-500 overflow-hidden"
        style={{
          aspectRatio: `${box.length} / ${box.width}`,
          background: boxBgStyle.background,
          padding: "20px",
          boxShadow: `
            0 25px 55px rgba(2, 6, 15, 0.4),
            inset 0 1.5px 3px rgba(255, 255, 255, 0.12),
            inset 0 -1.5px 3px rgba(0, 0, 0, 0.45)
          `
        }}
      >
        {/* Outer foil borders */}
        <div className={`absolute inset-2 rounded-xl border pointer-events-none ${boxBgStyle.borderFoil}`} />
        <div className={`absolute inset-3 rounded-lg border opacity-40 pointer-events-none ${boxBgStyle.borderFoil}`} />

        {/* Box Inner Compartment Well */}
        <div
          className="relative w-full h-full rounded-lg"
          style={{
            background: "#D7B48E",
            border: `10px solid ${boxBgStyle.innerRim}`,
            boxShadow: `
              inset 0 14px 28px rgba(0, 0, 0, 0.55),
              inset 14px 0 18px rgba(0, 0, 0, 0.35),
              inset -14px 0 18px rgba(0, 0, 0, 0.35),
              inset 0 -14px 18px rgba(0, 0, 0, 0.35)
            `,
            overflow: "hidden"
          }}
        >
          {/* Canvas crinkle paper bed */}
          <CrinklePaperCanvas occasion={occasionId} />

          {/* Ribbon Shadows */}
          <div
            className="absolute inset-y-0"
            style={{
              left: "11%",
              width: "7%",
              zIndex: 2,
              backgroundColor: "rgba(0, 0, 0, 0.35)",
              filter: "blur(5px)"
            }}
          />
          <div
            className="absolute inset-x-0"
            style={{
              top: "11%",
              height: "7%",
              zIndex: 2,
              backgroundColor: "rgba(0, 0, 0, 0.35)",
              filter: "blur(5px)"
            }}
          />

          {/* Satin Ribbon Bands */}
          <div
            className="absolute inset-y-0"
            style={{
              left: "11.5%",
              width: "6%",
              zIndex: 2,
              backgroundColor: ribbonHex,
              backgroundImage: "linear-gradient(90deg, rgba(80,60,10,0.3) 0%, rgba(255,255,255,0.4) 35%, rgba(255,255,255,0.15) 50%, rgba(80,60,10,0.35) 100%)",
            }}
          />
          <div
            className="absolute inset-x-0"
            style={{
              top: "11.5%",
              height: "6%",
              zIndex: 2,
              backgroundColor: ribbonHex,
              backgroundImage: "linear-gradient(180deg, rgba(80,60,10,0.3) 0%, rgba(255,255,255,0.4) 35%, rgba(255,255,255,0.15) 50%, rgba(80,60,10,0.35) 100%)",
            }}
          />

          {/* Arranged Products */}
          <div className="absolute inset-0 pointer-events-none">
            {items.map((item, i) => (
              <ProductTile
                key={item.product.id}
                p={item.product}
                slot={item}
                index={i}
              />
            ))}
          </div>

          {/* Overlay Crinkle Shreds */}
          {topShreds.map((s) => {
            const path = generateWavyPath(s.width, s.height, s.isHorizontal);
            return (
              <svg
                key={s.id}
                className="absolute pointer-events-none"
                style={{
                  left: `${s.left}%`,
                  top: `${s.top}%`,
                  width: `${s.width}px`,
                  height: `${s.height}px`,
                  transform: `rotate(${s.rotate}deg)`,
                  opacity: s.opacity * 0.9,
                  zIndex: 40,
                  filter: "drop-shadow(1px 1.5px 1.5px rgba(0, 0, 0, 0.4))"
                }}
                viewBox={`0 0 ${s.width} ${s.height}`}
              >
                <path
                  d={path}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="2.0"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            );
          })}

          {/* Custom Polaroid Photo Insert */}
          {customizations.photoUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: -4 }}
              className="absolute bg-white p-2 pb-6 rounded-sm border border-slate-200"
              style={{
                bottom: "8%",
                left: "6%",
                width: "24%",
                height: "35%",
                zIndex: 45,
                boxShadow: "6px 12px 24px rgba(3, 10, 25, 0.25)"
              }}
            >
              <div className="w-full h-full bg-slate-100 rounded-sm overflow-hidden border border-slate-200/50">
                <img
                  src={customizations.photoUrl}
                  alt="Custom uploaded"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute bottom-1 left-0 right-0 text-center font-serif text-[6.5px] text-slate-400 tracking-wider">
                MEMORIES
              </div>
            </motion.div>
          )}

          {/* Greeting Card */}
          {(customizations.message || customizations.name) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: 6 }}
              animate={{ opacity: 1, scale: 1, rotate: 4 }}
              className="absolute bg-[#FFFDF9] text-slate-800 p-3 rounded shadow-xl border border-[#D4AF37]/35 flex flex-col justify-between"
              style={{
                bottom: "8%",
                right: "6%",
                width: "28%",
                height: "26%",
                zIndex: 46,
                boxShadow: "5px 10px 22px rgba(3, 10, 25, 0.25)"
              }}
            >
              <div className="absolute inset-1.5 border border-[#D4AF37]/30 rounded pointer-events-none" />
              <div className="relative z-10 flex flex-col h-full justify-between text-center">
                <div className="border-b border-[#D4AF37]/20 pb-0.5 mb-0.5">
                  <span className="text-[7px] font-bold uppercase tracking-widest text-[#AA8413] block font-sans">Especially For You</span>
                </div>
                <p className="italic text-slate-600 leading-relaxed font-serif text-[8px] line-clamp-2 my-auto px-0.5">
                  "{customizations.message || "Wishing you warmth and joy."}"
                </p>
                <div className="text-[6px] text-[#AA8413] font-sans tracking-widest uppercase font-bold">
                  ❤️ {customizations.name || "Recipient"}
                </div>
              </div>
            </motion.div>
          )}

          {/* Corporate Logo Plate */}
          {customizations.logoUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute bg-white/90 backdrop-blur-sm p-1.5 rounded-full border border-[#D4AF37]/35 flex items-center justify-center shadow-lg"
              style={{
                top: "6%",
                right: "6%",
                width: "40px",
                height: "40px",
                zIndex: 48
              }}
            >
              <img
                src={customizations.logoUrl}
                alt="Corporate Logo"
                className="w-full h-full object-contain"
              />
            </motion.div>
          )}

          {/* Lid Custom Engraved Text Overlay */}
          {customizations.customText && (
            <div
              className="absolute text-center select-none"
              style={{
                bottom: "4%",
                left: "50%",
                transform: "translateX(-50%)",
                width: "50%",
                zIndex: 50
              }}
            >
              <span
                className="bg-black/55 backdrop-blur-sm text-yellow-100 text-[9px] font-semibold tracking-widest px-3 py-1 rounded-full border border-[#D4AF37]/35 uppercase"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {customizations.customText}
              </span>
            </div>
          )}

          {/* Ribbon Tails */}
          <div
            className="absolute rounded-bl-[40px] pointer-events-none"
            style={{
              left: "11%",
              top: "11%",
              width: "20px",
              height: "50px",
              borderLeft: `10px solid ${ribbonHex}`,
              borderBottom: `10px solid ${ribbonHex}`,
              transform: "translate(-15px, 10px) rotate(-18deg)",
              transformOrigin: "top left",
              opacity: 0.95,
              filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.25))",
              zIndex: 3
            }}
          />
          <div
            className="absolute rounded-br-[40px] pointer-events-none"
            style={{
              left: "16%",
              top: "11%",
              width: "25px",
              height: "45px",
              borderRight: `10px solid ${ribbonHex}`,
              borderBottom: `10px solid ${ribbonHex}`,
              transform: "translate(10px, 10px) rotate(26deg)",
              transformOrigin: "top right",
              opacity: 0.95,
              filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.25))",
              zIndex: 3
            }}
          />

          {/* Luxury Bow Loop */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.35, type: "spring", stiffness: 140 }}
            className="absolute cursor-grab active:cursor-grabbing"
            style={{
              left: "14.5%",
              top: "14.5%",
              transform: "translate(-50%, -50%)",
              zIndex: 3
            }}
          >
            <div
              className="relative"
              style={{
                width: size === "lg" ? 75 : 45,
                height: size === "lg" ? 75 : 45
              }}
            >
              {[45, 135, 225, 315].map((deg) => (
                <div
                  key={`outer-${deg}`}
                  className="absolute rounded-full"
                  style={{
                    left: "50%",
                    top: "50%",
                    width: "55%",
                    height: "32%",
                    backgroundColor: ribbonHex,
                    transform: `translate(-50%, -50%) rotate(${deg}deg) translateX(45%)`,
                    boxShadow: "0 3px 6px rgba(3, 10, 25, 0.25)",
                    overflow: "hidden"
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/40 via-transparent to-black/40" />
                  <div className="absolute inset-x-0 top-0 h-1/2 bg-white/10" />
                </div>
              ))}

              {[0, 90, 180, 270].map((deg) => (
                <div
                  key={`inner-${deg}`}
                  className="absolute rounded-full"
                  style={{
                    left: "50%",
                    top: "50%",
                    width: "42%",
                    height: "25%",
                    backgroundColor: ribbonHex,
                    transform: `translate(-50%, -50%) rotate(${deg}deg) translateX(40%)`,
                    boxShadow: "0 2px 4px rgba(3, 10, 25, 0.25)",
                    overflow: "hidden",
                    opacity: 0.95
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-black/40" />
                  <div className="absolute inset-x-0 top-0 h-1/2 bg-white/10" />
                </div>
              ))}

              <div
                className="absolute rounded-full"
                style={{
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "25%",
                  height: "25%",
                  backgroundColor: ribbonHex,
                  boxShadow: "0 3px 6px rgba(3, 10, 25, 0.35)",
                  overflow: "hidden"
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-black/35 via-white/25 to-white/35" />
              </div>
            </div>
          </motion.div>

          {/* Soft Photography Shadows */}
          <div
            className="absolute inset-0 pointer-events-none mix-blend-screen opacity-[0.16]"
            style={{
              background: "radial-gradient(circle at 12% 12%, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 80%)"
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-[0.22]"
            style={{
              background: "linear-gradient(135deg, transparent 45%, rgba(0, 0, 0, 0.8) 100%)"
            }}
          />
        </div>
      </div>
    </div>
  );
}