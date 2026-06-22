import { useMemo, useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { CATEGORY_FALLBACKS } from "@/lib/giftdata";
import { generateRecommendations } from "@/lib/layoutEngine";

// Helper to generate wavy paths for decorative crinkle elements
const generateWavyPath = (w, h, isHoriz) => {
  const steps = 6;
  const stepSize = isHoriz ? w / steps : h / steps;
  let path = isHoriz ? `M 0 ${h / 2}` : `M ${w / 2} 0`;
  for (let i = 0; i < steps; i++) {
    const x1 = isHoriz ? i * stepSize + stepSize / 3 : (i % 2 === 0 ? 1 : w - 1);
    const y1 = isHoriz ? (i % 2 === 0 ? 1 : h - 1) : i * stepSize + stepSize / 3;
    const x2 = isHoriz ? i * stepSize + (2 * stepSize) / 3 : (i % 2 === 0 ? w - 1 : 1);
    const y2 = isHoriz ? (i % 2 === 0 ? h - 1 : 1) : i * stepSize + (2 * stepSize) / 3;
    const x3 = isHoriz ? (i + 1) * stepSize : w / 2;
    const y3 = isHoriz ? h / 2 : (i + 1) * stepSize;
    path += ` C ${x1} ${y1}, ${x2} ${y2}, ${x3} ${y3}`;
  }
  return path;
};

// Retrieve occasion-specific custom styling tokens
function getOccasionStyling(occasion, boxId) {
  let lining = "tissue_white";
  if (boxId === "pink_luxury") lining = "satin_pink";
  else if (boxId === "pink_pattern") lining = "tissue_gold";
  else if (boxId === "black_gold") lining = "satin_black";
  else if (boxId === "crocodile_premium") lining = "velvet_brown";
  else if (boxId === "gold_ribbon") lining = "velvet_red";

  let style = {
    filler: {
      base: "#FFFDF9",
      shreds: ["#E6D8C5", "#F2E6D8", "#DFCBB5", "#FFFFFF"]
    },
    lining,
    ribbonLayout: "classic-cross",
    flowerColors: { pri: "#F43F5E", sec: "#FDA4AF", inn: "#FFF1F2" }, // pink roses
    foliageType: "eucalyptus",
    accents: "pearls",
    card: {
      bg: "#FFFDF9",
      border: "#D4AF37",
      title: "Especially For You",
      textColor: "text-[#AA8413]",
      bodyColor: "text-slate-600",
      font: "font-serif"
    }
  };

  switch (occasion) {
    case "birthday":
      style.filler = {
        base: "#FFF0F3",
        shreds: ["#FF6B6B", "#4DABF7", "#FFD43B", "#51CF66", "#F06595", "#FFF0F6"]
      };
      style.flowerColors = { pri: "#FF6B6B", sec: "#FF8E8E", inn: "#FFE3E3" }; // bright coral
      style.foliageType = "eucalyptus";
      style.accents = "confetti-pearls";
      style.ribbonLayout = "single-horizontal";
      style.card = {
        bg: "#FFF0F6",
        border: "#FF6B6B",
        title: "Happy Birthday!",
        textColor: "text-[#D81B60]",
        bodyColor: "text-pink-700",
        font: "font-sans font-bold"
      };
      break;
    case "corporate":
      style.filler = {
        base: "#111827", // deep slate/black
        shreds: ["#1F2937", "#111827", "#C5A880", "#0B1D37", "#374151"]
      };
      style.lining = "satin_black";
      style.flowerColors = null; // no flowers, only gold laurel leaves
      style.foliageType = "gold_laurel";
      style.accents = "logo-plate";
      style.ribbonLayout = "classic-cross";
      style.card = {
        bg: "#0B1D37",
        border: "#C5A880",
        title: "Executive Greeting",
        textColor: "text-[#C5A880]",
        bodyColor: "text-slate-300",
        font: "font-serif tracking-widest text-[6.5px]"
      };
      break;
    case "wedding":
      style.filler = {
        base: "#FCFDFB", // ivory white
        shreds: ["#FFFFFF", "#FAF6F0", "#E8DCC4", "#F5EFE6", "#D4AF37"]
      };
      style.lining = "tissue_white";
      style.flowerColors = { pri: "#FCFAF2", sec: "#E8DCC4", inn: "#FFFFFF" }; // ivory roses
      style.foliageType = "silver_dollar";
      style.accents = "crystals";
      style.ribbonLayout = "symmetrical-dual";
      style.card = {
        bg: "#FCFDFB",
        border: "#E8DCC4",
        title: "Congratulations",
        textColor: "text-[#B58D5F]",
        bodyColor: "text-slate-500",
        font: "font-serif italic text-[6.5px]"
      };
      break;
    case "anniversary":
      style.filler = {
        base: "#3B0202", // velvet burgundy base
        shreds: ["#8B0000", "#7A0202", "#FF6B8B", "#FFD700", "#C94F6D"]
      };
      style.lining = "velvet_red";
      style.flowerColors = { pri: "#B91C1C", sec: "#7F1D1D", inn: "#FECACA" }; // deep red roses
      style.foliageType = "rose_leaves";
      style.accents = "rose-petals";
      style.ribbonLayout = "classic-cross";
      style.card = {
        bg: "#FFF5F5",
        border: "#B91C1C",
        title: "Happy Anniversary",
        textColor: "text-[#B91C1C]",
        bodyColor: "text-red-900",
        font: "font-serif italic font-bold"
      };
      break;
    case "graduation":
      style.filler = {
        base: "#EFECE9",
        shreds: ["#1E293B", "#F8FAFC", "#D4AF37", "#64748B", "#475569"]
      };
      style.flowerColors = { pri: "#D4AF37", sec: "#AA8413", inn: "#FFFDF0" }; // gold roses
      style.foliageType = "gold_laurel";
      style.accents = "gold-stars";
      style.ribbonLayout = "single-vertical";
      style.card = {
        bg: "#1E293B",
        border: "#D4AF37",
        title: "Happy Graduation",
        textColor: "text-[#D4AF37]",
        bodyColor: "text-slate-200",
        font: "font-sans tracking-wide font-extrabold"
      };
      break;
    case "festival":
      style.filler = {
        base: "#FFF8E7",
        shreds: ["#F97316", "#FACC15", "#EA580C", "#FFF8E7", "#D97706"]
      };
      style.flowerColors = { pri: "#F97316", sec: "#FACC15", inn: "#FFF" }; // marigold orange
      style.foliageType = "eucalyptus";
      style.accents = "marigold-petals";
      style.ribbonLayout = "classic-cross";
      style.card = {
        bg: "#FFFBEB",
        border: "#F59E0B",
        title: "Festive Wishes",
        textColor: "text-[#D97706]",
        bodyColor: "text-amber-800",
        font: "font-serif font-black"
      };
      break;
    case "baby_shower":
      style.filler = {
        base: "#F0F9FF",
        shreds: ["#38BDF8", "#F472B6", "#E0F2FE", "#FCE7F3", "#FFFFFF"]
      };
      style.flowerColors = { pri: "#F472B6", sec: "#38BDF8", inn: "#FFFFFF" }; // pastel pink/blue
      style.foliageType = "eucalyptus";
      style.accents = "pearls";
      style.ribbonLayout = "single-vertical";
      style.card = {
        bg: "#FDF2F8",
        border: "#F472B6",
        title: "Welcome Baby",
        textColor: "text-pink-600",
        bodyColor: "text-slate-600",
        font: "font-sans font-semibold text-[6.5px]"
      };
      break;
    default:
      break;
  }

  return style;
}

// Canvas-drawn crinkle paper bed with occasion styling
function CrinklePaperCanvas({ fillerConfig }) {
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
      ctx.fillStyle = fillerConfig.base;
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.shadowColor = "rgba(40, 20, 5, 0.22)";
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1.8;

      const count = 680; // Rich, premium high-density crinkle bed
      for (let i = 0; i < count; i++) {
        const color = fillerConfig.shreds[Math.floor(Math.random() * fillerConfig.shreds.length)];
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
  }, [fillerConfig]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ display: "block", zIndex: 3 }}
    />
  );
}

// Procedural Eucalyptus Foliage
function EucalyptusBranch({ x, y, rotate }) {
  return (
    <div
      className="absolute pointer-events-none origin-bottom-left"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: `rotate(${rotate}deg)`,
        zIndex: 32, // overlapping product boundaries
        width: "70px",
        height: "45px"
      }}
    >
      <svg viewBox="0 0 70 45" className="w-full h-full drop-shadow-[0_4px_6px_rgba(0,0,0,0.35)]">
        <path d="M 5 40 Q 25 25 60 10" fill="none" stroke="#5C6F59" strokeWidth="1.8" strokeLinecap="round" />
        <ellipse cx="18" cy="32" rx="7" ry="10" fill="#789074" stroke="#5E745A" strokeWidth="0.5" transform="rotate(-30 18 32)" />
        <ellipse cx="28" cy="20" rx="8" ry="11" fill="#8FA88B" stroke="#70876D" strokeWidth="0.5" transform="rotate(15 28 20)" />
        <ellipse cx="44" cy="18" rx="8" ry="11" fill="#789074" stroke="#5E745A" strokeWidth="0.5" transform="rotate(-15 44 18)" />
        <ellipse cx="56" cy="11" rx="6" ry="8" fill="#A2BA9D" stroke="#849C80" strokeWidth="0.5" transform="rotate(25 56 11)" />
      </svg>
    </div>
  );
}

// Rose Leaves Foliage
function RoseLeavesBranch({ x, y, rotate }) {
  return (
    <div
      className="absolute pointer-events-none origin-bottom-left"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: `rotate(${rotate}deg)`,
        zIndex: 32,
        width: "55px",
        height: "40px"
      }}
    >
      <svg viewBox="0 0 55 40" className="w-full h-full drop-shadow-[0_4px_6px_rgba(0,0,0,0.35)]">
        <path d="M 5 35 Q 25 20 48 12" fill="none" stroke="#2D4C24" strokeWidth="1.6" strokeLinecap="round" />
        <ellipse cx="16" cy="24" rx="5" ry="8" fill="#3D7532" stroke="#25511D" strokeWidth="0.4" transform="rotate(-35 16 24)" />
        <ellipse cx="26" cy="18" rx="6" ry="9" fill="#4C8E40" stroke="#2E6124" strokeWidth="0.4" transform="rotate(25 26 18)" />
        <ellipse cx="38" cy="12" rx="5" ry="8" fill="#3D7532" stroke="#25511D" strokeWidth="0.4" transform="rotate(-15 38 12)" />
        <ellipse cx="46" cy="8" rx="4" ry="6" fill="#5A9E4E" stroke="#3D7532" strokeWidth="0.4" transform="rotate(30 46 8)" />
      </svg>
    </div>
  );
}

// Silver Dollar Eucalyptus Foliage
function SilverDollarBranch({ x, y, rotate }) {
  return (
    <div
      className="absolute pointer-events-none origin-bottom-left"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: `rotate(${rotate}deg)`,
        zIndex: 32,
        width: "60px",
        height: "45px"
      }}
    >
      <svg viewBox="0 0 60 45" className="w-full h-full drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)]">
        <path d="M 5 38 Q 28 25 55 18" fill="none" stroke="#688078" strokeWidth="1.8" strokeLinecap="round" />
        <ellipse cx="18" cy="28" rx="8" ry="9" fill="#90A7A0" stroke="#758D86" strokeWidth="0.5" transform="rotate(-20 18 28)" />
        <ellipse cx="32" cy="20" rx="9" ry="10" fill="#A7BCB6" stroke="#8EA49D" strokeWidth="0.5" transform="rotate(15 32 20)" />
        <ellipse cx="48" cy="16" rx="7" ry="8" fill="#90A7A0" stroke="#758D86" strokeWidth="0.5" transform="rotate(-10 48 16)" />
      </svg>
    </div>
  );
}

// Baby's Breath delicate flowers
function BabyBreathFlower({ x, y }) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: "30px",
        height: "30px",
        transform: "translate(-50%, -50%)",
        zIndex: 32,
        filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15))"
      }}
    >
      <svg viewBox="0 0 30 30" className="w-full h-full">
        <path d="M 15 25 L 15 15 L 8 10 M 15 15 L 22 10 M 8 10 L 5 6 M 8 10 L 11 6 M 22 10 L 19 6 M 22 10 L 25 6" fill="none" stroke="#A3B49A" strokeWidth="0.8" />
        <circle cx="5" cy="6" r="2" fill="#FFF" />
        <circle cx="11" cy="6" r="1.8" fill="#FFF" />
        <circle cx="19" cy="6" r="2" fill="#FFF" />
        <circle cx="25" cy="6" r="1.8" fill="#FFF" />
        <circle cx="8" cy="10" r="1.5" fill="#FFF" />
        <circle cx="22" cy="10" r="1.5" fill="#FFF" />
      </svg>
    </div>
  );
}

// Lavender Spikes for visual flower details
function LavenderStem({ x, y, rotate }) {
  return (
    <div
      className="absolute pointer-events-none origin-bottom-left"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: `rotate(${rotate}deg)`,
        zIndex: 32,
        width: "28px",
        height: "48px"
      }}
    >
      <svg viewBox="0 0 28 48" className="w-full h-full drop-shadow-[0_2.5px_4px_rgba(0,0,0,0.22)]">
        <line x1="14" y1="42" x2="14" y2="8" stroke="#3F6212" strokeWidth="1.2" />
        {[8, 14, 20, 26, 32].map(yVal => (
          <g key={yVal} transform={`translate(0, ${yVal})`}>
            <ellipse cx="10" cy="0" rx="3" ry="1.6" fill="#8B5CF6" />
            <ellipse cx="18" cy="0" rx="3" ry="1.6" fill="#7C3AED" />
            <circle cx="14" cy="-2.5" r="1.2" fill="#A78BFA" />
          </g>
        ))}
      </svg>
    </div>
  );
}

// Tropical Fern Leaf (Green or Gold depending on occasion)
function TropicalFern({ x, y, rotate, color = "#2F6B52" }) {
  return (
    <div
      className="absolute pointer-events-none origin-bottom-left"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: `rotate(${rotate}deg)`,
        zIndex: 32,
        width: "55px",
        height: "45px"
      }}
    >
      <svg viewBox="0 0 55 45" className="w-full h-full drop-shadow-[0_4px_6px_rgba(0,0,0,0.35)]">
        <path d="M 5 40 Q 25 25 50 15" fill="none" stroke={color} strokeWidth="2.0" strokeLinecap="round" />
        <ellipse cx="14" cy="32" rx="4" ry="7" fill={color} opacity="0.9" transform="rotate(-30 14 32)" />
        <ellipse cx="23" cy="22" rx="4.5" ry="8.5" fill={color} transform="rotate(15 23 22)" />
        <ellipse cx="34" cy="18" rx="4" ry="7" fill={color} opacity="0.95" transform="rotate(-15 34 18)" />
        <ellipse cx="44" cy="14" rx="3" ry="5.5" fill={color} transform="rotate(25 44 14)" />
      </svg>
    </div>
  );
}

// Layered Rose Bud
function RoseFlower({ x, y, scale = 1, primaryColor = "#ef4444", secondaryColor = "#f43f5e", innerColor = "#fca5a5" }) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${32 * scale}px`,
        height: `${32 * scale}px`,
        transform: "translate(-50%, -50%)",
        zIndex: 32, // Floating and overlapping edges
        filter: "drop-shadow(0 6px 10px rgba(0, 0, 0, 0.4))"
      }}
    >
      <svg viewBox="0 0 32 32" className="w-full h-full">
        <circle cx="16" cy="16" r="14" fill={primaryColor} />
        <path d="M 6 16 C 6 8, 26 8, 26 16 C 26 24, 6 24, 6 16 Z" fill={secondaryColor} opacity="0.9" />
        <circle cx="16" cy="16" r="9" fill={primaryColor} />
        <circle cx="14" cy="14" r="6" fill={secondaryColor} />
        <circle cx="17" cy="17" r="4" fill={innerColor} />
        <circle cx="16" cy="16" r="2" fill="#fff" opacity="0.4" />
      </svg>
    </div>
  );
}

// Large Luxury Peony Flower
function PeonyFlower({ x, y, scale = 1, color = "#F472B6" }) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${36 * scale}px`,
        height: `${36 * scale}px`,
        transform: "translate(-50%, -50%)",
        zIndex: 32,
        filter: "drop-shadow(0 6px 12px rgba(0, 0, 0, 0.35))"
      }}
    >
      <svg viewBox="0 0 36 36" className="w-full h-full">
        <circle cx="18" cy="18" r="16" fill={color} />
        <circle cx="18" cy="18" r="13" fill="#FB7185" opacity="0.88" />
        <circle cx="18" cy="18" r="10" fill="#FDA4AF" opacity="0.95" />
        <circle cx="16" cy="16" r="7" fill="#FFE4E6" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
          <path
            key={deg}
            d="M18 18 C14 11, 22 11, 18 18 Z"
            fill="#FFF1F2"
            opacity="0.75"
            transform={`rotate(${deg} 18 18)`}
          />
        ))}
      </svg>
    </div>
  );
}

// Delicate White Daisy / Chamomile flower
function DaisyFlower({ x, y, scale = 1 }) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${24 * scale}px`,
        height: `${24 * scale}px`,
        transform: "translate(-50%, -50%)",
        zIndex: 32,
        filter: "drop-shadow(0 3px 5px rgba(0, 0, 0, 0.22))"
      }}
    >
      <svg viewBox="0 0 24 24" className="w-full h-full">
        {/* Yellow center disk */}
        <circle cx="12" cy="12" r="4.5" fill="#FBBF24" />
        {/* White petals */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => (
          <ellipse
            key={deg}
            cx="12"
            cy="5"
            rx="2"
            ry="4.5"
            fill="#FFFFFF"
            transform={`rotate(${deg} 12 12)`}
          />
        ))}
        <circle cx="12" cy="12" r="2" fill="#D97706" opacity="0.2" />
      </svg>
    </div>
  );
}

// Hydrangea multi-petal blossom cluster
function HydrangeaFlower({ x, y, scale = 1, color = "#C084FC" }) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${30 * scale}px`,
        height: `${30 * scale}px`,
        transform: "translate(-50%, -50%)",
        zIndex: 32,
        filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.28))"
      }}
    >
      <svg viewBox="0 0 30 30" className="w-full h-full">
        <circle cx="15" cy="15" r="12" fill={color} opacity="0.4" />
        <g transform="translate(3, 3)">
          <path d="M5 2 C5 0, 7 0, 7 2 C7 4, 5 4, 5 2 Z" fill="#FFF" opacity="0.95" />
          <path d="M2 5 C0 5, 0 7, 2 7 C4 7, 4 5, 2 5 Z" fill="#FFF" opacity="0.95" />
          <path d="M5 8 C5 10, 7 10, 7 8 C7 6, 5 6, 5 8 Z" fill="#FFF" opacity="0.95" />
          <path d="M8 5 C10 5, 10 7, 8 7 C6 7, 6 5, 8 5 Z" fill="#FFF" opacity="0.95" />
          <circle cx="5" cy="5" r="1.2" fill="#FBBF24" />
        </g>
        <g transform="translate(13, 6)">
          <path d="M5 2 C5 0, 7 0, 7 2 C7 4, 5 4, 5 2 Z" fill="#FFF" opacity="0.95" />
          <path d="M2 5 C0 5, 0 7, 2 7 C4 7, 4 5, 2 5 Z" fill="#FFF" opacity="0.95" />
          <circle cx="5" cy="5" r="1" fill="#FBBF24" />
        </g>
        <g transform="translate(7, 13)">
          <path d="M5 2 C5 0, 7 0, 7 2 C7 4, 5 4, 5 2 Z" fill="#FFF" opacity="0.9" />
          <path d="M2 5 C0 5, 0 7, 2 7 C4 7, 4 5, 2 5 Z" fill="#FFF" opacity="0.9" />
          <circle cx="5" cy="5" r="1" fill="#FBBF24" />
        </g>
      </svg>
    </div>
  );
}

// Gold Laurel Leaf for Executive style
function GoldLaurelBranch({ x, y, rotate }) {
  return (
    <div
      className="absolute pointer-events-none origin-bottom-left"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: `rotate(${rotate}deg)`,
        zIndex: 32,
        width: "60px",
        height: "35px"
      }}
    >
      <svg viewBox="0 0 60 35" className="w-full h-full drop-shadow-[0_3px_5px_rgba(212,175,55,0.4)]">
        <path d="M 5 30 Q 25 15 55 5" fill="none" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" />
        <ellipse cx="16" cy="22" rx="5" ry="8" fill="#AA8413" stroke="#D4AF37" strokeWidth="0.4" transform="rotate(-30 16 22)" />
        <ellipse cx="26" cy="13" rx="6" ry="9" fill="#E9B646" stroke="#D4AF37" strokeWidth="0.4" transform="rotate(15 26 13)" />
        <ellipse cx="40" cy="11" rx="5" ry="8" fill="#AA8413" stroke="#D4AF37" strokeWidth="0.4" transform="rotate(-15 40 11)" />
        <ellipse cx="50" cy="6" rx="4" ry="6" fill="#FAD961" stroke="#D4AF37" strokeWidth="0.4" transform="rotate(25 50 6)" />
      </svg>
    </div>
  );
}

// Dynamic scaling function based on category, box dimensions, and available empty space
function getVisualScale(p, box, items) {
  let baseScale = 1.0;

  // 1. Proportional Sizing by product type
  if (p.name === "Ring" || p.name === "Earrings") {
    baseScale = 2.0; // Jewelries are tiny physically, need large scaling boost
  } else if (p.category === "Jewelry" || p.name === "Bracelet" || p.name === "Necklace") {
    baseScale = 1.6;
  } else if (p.name === "Engraved Keychain" || p.name === "Premium Pen") {
    baseScale = 1.55;
  } else if (p.name === "Perfume" || p.name === "Watch") {
    baseScale = 1.35;
  } else if (p.name === "Scented Candle" || p.category === "Chocolates") {
    baseScale = 1.2;
  } else if (p.category === "Soft Toys" || p.category === "Flowers") {
    baseScale = 0.95; // large items maintain their size to fit box nicely
  } else {
    baseScale = 1.15;
  }

  if (!box || !items) return baseScale;

  // 2. Box Size scaling adjustment:
  // Standard box size is ~600 cm² (e.g. 30x20).
  // Larger boxes scale small products more to fill empty zones.
  const boxArea = box.length * box.width;
  const boxScaleFactor = Math.min(1.25, Math.max(0.8, boxArea / 600));

  // 3. Surrounding Free Space density adjustment:
  // Calculate total area occupied by other items (in physical sq cm)
  const otherItemsArea = items
    .filter(item => item.product.id !== p.id)
    .reduce((sum, item) => sum + (item.w * item.h), 0);
  
  // Usable area inside box well (margin of ~1.2cm around borders)
  const usableArea = (box.length - 2.4) * (box.width - 2.4);
  const freeSpace = Math.max(0, usableArea - otherItemsArea);
  const freeSpaceRatio = usableArea > 0 ? freeSpace / usableArea : 0.5;

  // More free space => scale booster (+25% max). Low free space => shrink slightly.
  const spaceBoost = 0.8 + freeSpaceRatio * 0.45; // range: 0.8 to 1.25

  let finalScale = baseScale * boxScaleFactor * spaceBoost;

  // Clip scales strictly based on physical dimensions to prevent unrealistic sizing
  if (p.size === "Small") {
    finalScale = Math.min(2.1, Math.max(1.15, finalScale));
  } else if (p.size === "Medium") {
    finalScale = Math.min(1.4, Math.max(0.9, finalScale));
  } else {
    finalScale = Math.min(1.05, Math.max(0.75, finalScale));
  }

  return Number(finalScale.toFixed(2));
}

// Product component containing sizing, shadows, and hover states
function ProductTile({ p, slot, index, box, items }) {
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

  // Retrieve scale factor dynamically
  const visualScale = getVisualScale(p, box, items);
  const visualW = slot.pctW * visualScale;
  const visualH = slot.pctH * visualScale;
  const visualX = slot.pctX - (visualW - slot.pctW) / 2;
  const visualY = slot.pctY - (visualH - slot.pctH) / 2;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, rotate: (slot.rotation || 0) - 10, scale: 0.6 }}
      animate={{ opacity: 1, y: 0, rotate: slot.rotation || 0, scale: 1 }}
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
        zIndex: 25 + index, // Above compartments and foam inserts
        background: "transparent",
        filter: "drop-shadow(0 14px 22px rgba(10, 5, 2, 0.48)) drop-shadow(0 4px 8px rgba(10, 5, 2, 0.22))",
        transition: "filter 0.3s ease, transform 0.3s ease"
      }}
      whileHover={{
        scale: 1.05,
        y: -6,
        filter: "drop-shadow(0 25px 30px rgba(10, 5, 2, 0.6)) drop-shadow(0 10px 16px rgba(10, 5, 2, 0.4))",
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

  if (!layoutData) return null;

  const { box, items } = layoutData;

  // Retrieve custom occasion styling configurations
  const styling = useMemo(() => {
    return getOccasionStyling(occasionId, box.id);
  }, [occasionId, box.id]);

  // Procedural Top-layer crinkle paper shreds (rendered above products for realistic nesting depth)
  const topShreds = useMemo(() => {
    const config = styling.filler;
    // Increased to 28 items for deep nesting and textured look
    return Array.from({ length: 28 }).map((_, i) => {
      const isHorizontal = Math.random() > 0.5;
      const color = config.shreds[Math.floor(Math.random() * config.shreds.length)];
      const width = isHorizontal ? 55 + Math.random() * 35 : 8 + Math.random() * 4;
      const height = isHorizontal ? 8 + Math.random() * 4 : 55 + Math.random() * 35;

      return {
        id: i,
        left: Math.random() * 80 + 10,
        top: Math.random() * 80 + 10,
        width,
        height,
        rotate: Math.random() * 360,
        color: color,
        opacity: 0.82 + Math.random() * 0.15,
        isHorizontal
      };
    });
  }, [styling.filler]);

  // Box background styling mapping to template configurations
  const boxBgStyle = {
    pink_luxury: {
      background: "linear-gradient(135deg, #FFF0F2 0%, #FFD3DD 100%)",
      borderFoil: "border-pink-300/40",
      innerRim: "#FFB3C6",
      textColor: "text-pink-900"
    },
    pink_pattern: {
      background: "linear-gradient(135deg, #FF6B8B 0%, #D81B60 100%)",
      borderFoil: "border-amber-300/60 shadow-[inset_0_0_15px_rgba(212,175,55,0.35)]",
      innerRim: "#C2185B",
      textColor: "text-pink-100"
    },
    black_gold: {
      background: "linear-gradient(135deg, #1C1C1C 0%, #0C0C0C 100%)",
      borderFoil: "border-[#D4AF37]/50 shadow-[inset_0_0_20px_rgba(212,175,55,0.25)]",
      innerRim: "#0F0F0F",
      textColor: "text-amber-100"
    },
    crocodile_premium: {
      background: "linear-gradient(135deg, #3E2723 0%, #1A0C06 100%)",
      borderFoil: "border-slate-800/40 shadow-[inset_0_0_25px_rgba(0,0,0,0.55)]",
      innerRim: "#27120A",
      textColor: "text-amber-50"
    },
    gold_ribbon: {
      background: "linear-gradient(135deg, #FAD961 0%, #F76B1C 100%)",
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

  const ribbonLayout = styling.ribbonLayout;

  // Smart placement for florist/accents framing: identify empty regions (dead zones)
  const floristArrangement = useMemo(() => {
    // Identify Hero product (largest item)
    const sortedItems = [...items].sort((a, b) => (b.pctW * b.pctH) - (a.pctW * a.pctH));
    const heroItem = sortedItems[0];
    const heroCenterX = heroItem ? heroItem.pctX + heroItem.pctW / 2 : 50;
    const heroCenterY = heroItem ? heroItem.pctY + heroItem.pctH / 2 : 50;

    // Search empty coordinates in a 12x12 grid (increased density)
    const candidates = [];
    const gridDivs = 12;
    for (let gx = 1; gx < gridDivs; gx++) {
      for (let gy = 1; gy < gridDivs; gy++) {
        const cx = (gx / gridDivs) * 100;
        const cy = (gy / gridDivs) * 100;

        let minCenterDist = Infinity;
        let overlaps = false;

        // Verify collision with products + padding
        for (const item of items) {
          const itemCX = item.pctX + item.pctW / 2;
          const itemCY = item.pctY + item.pctH / 2;
          const dist = Math.sqrt(Math.pow(cx - itemCX, 2) + Math.pow(cy - itemCY, 2));
          minCenterDist = Math.min(minCenterDist, dist);

          const padding = 3.5; // tighter padding to allow placing in smaller crevices
          if (
            cx > item.pctX - padding &&
            cx < item.pctX + item.pctW + padding &&
            cy > item.pctY - padding &&
            cy < item.pctY + item.pctH + padding
          ) {
            overlaps = true;
          }
        }

        // Verify collision with ribbon lines
        const ribbonW = 7;
        let overlapsRibbon = false;
        if (ribbonLayout === "classic-cross") {
          if (Math.abs(cx - 14.5) < ribbonW || Math.abs(cy - 14.5) < ribbonW) {
            overlapsRibbon = true;
          }
        } else if (ribbonLayout === "single-vertical" || ribbonLayout === "symmetrical-dual") {
          if (Math.abs(cx - 17.5) < ribbonW || (ribbonLayout === "symmetrical-dual" && Math.abs(cx - 82.5) < ribbonW)) {
            overlapsRibbon = true;
          }
        } else if (ribbonLayout === "single-horizontal") {
          if (Math.abs(cy - 17.5) < ribbonW) {
            overlapsRibbon = true;
          }
        }

        if (!overlaps && !overlapsRibbon) {
          candidates.push({ cx, cy, minCenterDist });
        }
      }
    }

    // Score candidates based on Stylist Framing & Visual Flow Path rules
    const scoredCandidates = candidates.map(c => {
      let score = 100;
      const distToHero = Math.sqrt(Math.pow(c.cx - heroCenterX, 2) + Math.pow(c.cy - heroCenterY, 2));

      if (occasionId === "anniversary") {
        // Flowers frame the hero item (ideal distance ~18-26% away)
        const deviation = Math.abs(distToHero - 22);
        score -= deviation * 3.5;
      } else if (occasionId === "wedding") {
        // Soft framing near the greeting card (bottom right, e.g. x:80, y:80)
        const distToCard = Math.sqrt(Math.pow(c.cx - 80, 2) + Math.pow(c.cy - 80, 2));
        const deviation = Math.abs(distToCard - 25);
        score -= deviation * 2.0;

        const frameDev = Math.abs(c.minCenterDist - 18);
        score -= frameDev * 2.0;
      } else if (occasionId === "corporate") {
        // Keep decorations minimal, gold laurel branches strictly in corners, far from products (ideal center dist > 30%)
        if (c.minCenterDist < 25) {
          score -= 50; // penalize being close to products
        } else {
          score += (c.minCenterDist - 25) * 1.5;
        }
      } else if (occasionId === "birthday") {
        // Guide attention around the box: place decorations in diagonal corners
        const cornerDists = [
          Math.sqrt(Math.pow(c.cx - 15, 2) + Math.pow(c.cy - 15, 2)),
          Math.sqrt(Math.pow(c.cx - 85, 2) + Math.pow(c.cy - 85, 2)),
          Math.sqrt(Math.pow(c.cx - 85, 2) + Math.pow(c.cy - 15, 2)),
          Math.sqrt(Math.pow(c.cx - 15, 2) + Math.pow(c.cy - 85, 2))
        ];
        const minCornerDist = Math.min(...cornerDists);
        score -= minCornerDist * 2.0;
      } else {
        // Default framing rule: ideal spacing around products (ideal distance ~20% away)
        const deviation = Math.abs(c.minCenterDist - 20);
        score -= deviation * 3.0;
      }

      return { ...c, score };
    });

    scoredCandidates.sort((a, b) => b.score - a.score);

    // Limit decorations to maintain strict empty space density limit, but allow more abundance per user request
    const productAreaRatio = items.reduce((sum, item) => sum + (item.pctW * item.pctH), 0) / 10000;
    const freeSpaceRatio = 1 - productAreaRatio;
    
    // Pick top candidates, allowing closer clustering for organic arrangement
    const selected = [];
    const minSeparation = 10; // closer separation for denser flower clusters
    for (const cand of scoredCandidates) {
      let tooClose = false;
      for (const sel of selected) {
        const d = Math.sqrt(Math.pow(cand.cx - sel.cx, 2) + Math.pow(cand.cy - sel.cy, 2));
        if (d < minSeparation) {
          tooClose = true;
          break;
        }
      }
      if (!tooClose) {
        selected.push(cand);
        // Up to 22 decorative slots for a rich floral presentation
        if (selected.length >= 22) break;
      }
    }

    const foliage = []; // Leaves completely removed per user request
    const flowers = [];

    // Map selected coordinates to flowers and floral elements only (no leaf foliage)
    selected.forEach((s, idx) => {
      let flowerType = "rose";
      const cycle = idx % 6;
      if (cycle === 0) flowerType = "rose";
      else if (cycle === 1) flowerType = "daisy";
      else if (cycle === 2) flowerType = "peony";
      else if (cycle === 3) flowerType = "hydrangea";
      else if (cycle === 4) flowerType = "baby_breath"; // baby's breath (tiny white flowers)
      else flowerType = "lavender"; // lavender (purple flower spikes)
      
      flowers.push({
        id: `flower-${idx}`,
        // Add random slight offsets for a natural handcrafted arrangement
        cx: s.cx + (Math.sin(idx) * 1.5),
        cy: s.cy + (Math.cos(idx) * 1.5),
        scale: 0.95 + (idx % 3) * 0.15,
        rotate: (idx * 65 + 30) % 360,
        type: flowerType
      });
    });

    return { foliage, flowers };
  }, [items, styling, occasionId, ribbonLayout]);

  // Pre-generate scattered decorative accents (pearls, petals, stars, crystals, sparkles) - TRIPLE count
  const accentsList = useMemo(() => {
    let count = 0;
    if (styling.accents === "pearls") count = 38;
    else if (styling.accents === "rose-petals") count = 42;
    else if (styling.accents === "marigold-petals") count = 42;
    else if (styling.accents === "gold-stars") count = 30;
    else if (styling.accents === "confetti-pearls") count = 45;
    else if (styling.accents === "crystals") count = 45; // Crystals for wedding

    return Array.from({ length: count }).map((_, i) => ({
      id: `accent-${i}`,
      x: 8 + Math.random() * 84,
      y: 8 + Math.random() * 84,
      scale: 0.65 + Math.random() * 0.6,
      rotate: Math.random() * 360
    }));
  }, [styling.accents]);

  // Pre-generate scattered luxury gold foil flakes (all occasions) - INCREASED count
  const goldFoilFlakesList = useMemo(() => {
    return Array.from({ length: 28 }).map((_, i) => ({
      id: `gold-flake-${i}`,
      x: 8 + Math.random() * 84,
      y: 8 + Math.random() * 84,
      scale: 0.5 + Math.random() * 0.65,
      rotate: Math.random() * 360,
      shapeIdx: i % 4
    }));
  }, []);

  // Pre-generate scattered magic sparkles (glitter sparkles) for that premium "wow" factor - INCREASED count
  const sparklesList = useMemo(() => {
    const needsSparkles = ["wedding", "anniversary", "birthday", "festival", "just_because"].includes(occasionId);
    if (!needsSparkles) return [];

    return Array.from({ length: 36 }).map((_, i) => ({
      id: `sparkle-${i}`,
      x: 8 + Math.random() * 84,
      y: 8 + Math.random() * 84,
      scale: 0.55 + Math.random() * 0.7,
      rotate: Math.random() * 360
    }));
  }, [occasionId]);

  // Theme-aware lighting effects: Increase density to 48 bulbs for extra glow and warmth
  const isCorporateOrExec = occasionId === "corporate" || occasionId === "graduation" || box.id === "black_gold";
  const hasFairyLights = !isCorporateOrExec && ["anniversary", "birthday", "wedding", "festival", "just_because"].includes(occasionId);

  // Generate fairy lights coordinates (density increased to 48 with copper wire connection)
  const fairyLightsData = useMemo(() => {
    if (!hasFairyLights) return { bulbs: [], wirePath: "" };
    
    // Generate 48 bulbs
    const bulbs = Array.from({ length: 48 }).map((_, i) => ({
      id: i,
      x: 8 + Math.random() * 84,
      y: 8 + Math.random() * 84,
      scale: 0.65 + Math.random() * 0.65,
      pulseDelay: Math.random() * 2.5
    }));

    // Nearest Neighbor path to draw connecting string
    const unvisited = [...bulbs];
    const ordered = [];
    let current = unvisited.shift();
    if (current) ordered.push(current);

    while (unvisited.length > 0) {
      let nearestIdx = 0;
      let nearestDist = Infinity;
      for (let i = 0; i < unvisited.length; i++) {
        const d = Math.sqrt(
          Math.pow(current.x - unvisited[i].x, 2) + Math.pow(current.y - unvisited[i].y, 2)
        );
        if (d < nearestDist) {
          nearestDist = d;
          nearestIdx = i;
        }
      }
      current = unvisited.splice(nearestIdx, 1)[0];
      ordered.push(current);
    }

    // Connect them with smooth waves
    let wirePath = "";
    if (ordered.length > 0) {
      wirePath = `M ${ordered[0].x} ${ordered[0].y}`;
      for (let i = 1; i < ordered.length; i++) {
        const prev = ordered[i - 1];
        const curr = ordered[i];
        const cpX = (prev.x + curr.x) / 2 + (Math.random() - 0.5) * 12;
        const cpY = (prev.y + curr.y) / 2 + (Math.random() - 0.5) * 12;
        wirePath += ` Q ${cpX} ${cpY}, ${curr.x} ${curr.y}`;
      }
    }

    return { bulbs: ordered, wirePath };
  }, [hasFairyLights]);

  // Find center of hero item for showcasing spotlight
  const heroItem = useMemo(() => {
    if (!items || items.length === 0) return null;
    const sorted = [...items].sort((a, b) => (b.pctW * b.pctH) - (a.pctW * a.pctH));
    return sorted[0];
  }, [items]);

  return (
    <div className={`relative mx-auto w-full ${maxW}`}>
      {/* SVG Definitions for Gradients and lighting masks */}
      <svg className="absolute w-0 h-0 pointer-events-none">
        <defs>
          <linearGradient id="satinGradPink" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF0F2" />
            <stop offset="30%" stopColor="#FFD3DD" />
            <stop offset="50%" stopColor="#FFAEC1" />
            <stop offset="70%" stopColor="#FFD3DD" />
            <stop offset="100%" stopColor="#FFE3E8" />
          </linearGradient>
          <linearGradient id="satinGradBlack" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E1E1E" />
            <stop offset="35%" stopColor="#0B0B0B" />
            <stop offset="50%" stopColor="#333333" />
            <stop offset="65%" stopColor="#0A0A0A" />
            <stop offset="100%" stopColor="#222222" />
          </linearGradient>
          <linearGradient id="goldFoilGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE082" />
            <stop offset="30%" stopColor="#F5B041" />
            <stop offset="55%" stopColor="#F39C12" />
            <stop offset="75%" stopColor="#FAD7A0" />
            <stop offset="100%" stopColor="#D4AF37" />
          </linearGradient>
        </defs>
      </svg>

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
          className="relative w-full h-full rounded-lg CompartmentWell"
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
          {/* Packaging Layers: Tissue Folds / Satin / Velvet Lining Liners */}
          {styling.lining === "satin_pink" && (
            <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1, overflow: "hidden" }}>
              <div className="absolute inset-0 bg-[#FFF0F2] opacity-[0.9]" />
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M -10 20 Q 30 40 50 110 L -10 110 Z" fill="url(#satinGradPink)" opacity="0.9" />
                <path d="M 40 -10 Q 70 30 110 10 L 110 -10 Z" fill="url(#satinGradPink)" opacity="0.95" />
                <path d="M 20 110 Q 60 70 110 80 L 110 110 Z" fill="url(#satinGradPink)" opacity="0.88" />
              </svg>
            </div>
          )}
          {styling.lining === "satin_black" && (
            <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1, overflow: "hidden" }}>
              <div className="absolute inset-0 bg-[#121212] opacity-[0.95]" />
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M -10 15 Q 35 30 45 110 L -10 110 Z" fill="url(#satinGradBlack)" opacity="0.95" />
                <path d="M 35 -10 Q 75 25 110 15 L 110 -10 Z" fill="url(#satinGradBlack)" opacity="0.9" />
                <path d="M 15 110 Q 55 65 110 85 L 110 110 Z" fill="url(#satinGradBlack)" opacity="0.85" />
              </svg>
            </div>
          )}
          {styling.lining === "velvet_brown" && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                zIndex: 1,
                backgroundColor: "#2C1A12",
                border: "12px solid #4E3629",
                borderRadius: "8px",
                boxShadow: "inset 0 0 25px rgba(0, 0, 0, 0.85), inset 0 0 10px rgba(0,0,0,0.6)",
                backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 0)",
                backgroundSize: "4px 4px"
              }}
            />
          )}
          {styling.lining === "velvet_red" && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                zIndex: 1,
                backgroundColor: "#4A0404",
                border: "12px solid #5C0612",
                borderRadius: "8px",
                boxShadow: "inset 0 0 25px rgba(0, 0, 0, 0.8), inset 0 0 10px rgba(0,0,0,0.5)",
                backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 0)",
                backgroundSize: "4px 4px"
              }}
            />
          )}
          {styling.lining.startsWith("tissue_") && (
            <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
              <div className="absolute inset-0 bg-[#FCFAF0] opacity-[0.9]" />
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M 0 0 L 100 0 L 95 12 L 60 7 L 30 14 L 0 8 Z" fill={styling.lining === "tissue_gold" ? "#FAD961" : "#FFFFFF"} opacity="0.45" />
                <path d="M 0 100 L 100 100 L 93 88 L 65 92 L 35 85 L 0 92 Z" fill={styling.lining === "tissue_gold" ? "#FAD961" : "#FFFFFF"} opacity="0.45" />
                <path d="M 0 0 L 0 100 L 8 92 L 6 60 L 9 30 L 7 0 Z" fill={styling.lining === "tissue_gold" ? "#FAD961" : "#FFFFFF"} opacity="0.4" />
                <path d="M 100 0 L 100 100 L 92 90 L 94 55 L 91 35 L 93 0 Z" fill={styling.lining === "tissue_gold" ? "#FAD961" : "#FFFFFF"} opacity="0.4" />
              </svg>
            </div>
          )}

          {/* Canvas crinkle paper bed */}
          <CrinklePaperCanvas fillerConfig={styling.filler} />

          {/* Symmetrical Dual Ribbon */}
          {ribbonLayout === "symmetrical-dual" && (
            <>
              <div className="absolute inset-y-0" style={{ left: "14%", width: "7%", zIndex: 5, backgroundColor: "rgba(0, 0, 0, 0.35)", filter: "blur(5px)" }} />
              <div className="absolute inset-y-0" style={{ right: "14%", width: "7%", zIndex: 5, backgroundColor: "rgba(0, 0, 0, 0.35)", filter: "blur(5px)" }} />

              <div
                className="absolute inset-y-0"
                style={{
                  left: "14.5%",
                  width: "6%",
                  zIndex: 6,
                  backgroundColor: ribbonHex,
                  backgroundImage: "linear-gradient(90deg, rgba(80,60,10,0.3) 0%, rgba(255,255,255,0.4) 35%, rgba(255,255,255,0.15) 50%, rgba(80,60,10,0.35) 100%)",
                }}
              />
              <div
                className="absolute inset-y-0"
                style={{
                  right: "14.5%",
                  width: "6%",
                  zIndex: 6,
                  backgroundColor: ribbonHex,
                  backgroundImage: "linear-gradient(90deg, rgba(80,60,10,0.3) 0%, rgba(255,255,255,0.4) 35%, rgba(255,255,255,0.15) 50%, rgba(80,60,10,0.35) 100%)",
                }}
              />
            </>
          )}

          {/* Ribbon Shadows */}
          {ribbonLayout === "classic-cross" && (
            <>
              <div className="absolute inset-y-0" style={{ left: "11%", width: "7%", zIndex: 5, backgroundColor: "rgba(0, 0, 0, 0.35)", filter: "blur(5px)" }} />
              <div className="absolute inset-x-0" style={{ top: "11%", height: "7%", zIndex: 5, backgroundColor: "rgba(0, 0, 0, 0.35)", filter: "blur(5px)" }} />
            </>
          )}
          {ribbonLayout === "single-vertical" && (
            <div className="absolute inset-y-0" style={{ left: "14%", width: "7%", zIndex: 5, backgroundColor: "rgba(0, 0, 0, 0.35)", filter: "blur(5px)" }} />
          )}
          {ribbonLayout === "single-horizontal" && (
            <div className="absolute inset-x-0" style={{ top: "14%", height: "7%", zIndex: 5, backgroundColor: "rgba(0, 0, 0, 0.35)", filter: "blur(5px)" }} />
          )}

          {/* Satin Ribbon Bands */}
          {ribbonLayout === "classic-cross" && (
            <>
              <div
                className="absolute inset-y-0"
                style={{
                  left: "11.5%",
                  width: "6%",
                  zIndex: 6,
                  backgroundColor: ribbonHex,
                  backgroundImage: "linear-gradient(90deg, rgba(80,60,10,0.3) 0%, rgba(255,255,255,0.4) 35%, rgba(255,255,255,0.15) 50%, rgba(80,60,10,0.35) 100%)",
                }}
              />
              <div
                className="absolute inset-x-0"
                style={{
                  top: "11.5%",
                  height: "6%",
                  zIndex: 6,
                  backgroundColor: ribbonHex,
                  backgroundImage: "linear-gradient(180deg, rgba(80,60,10,0.3) 0%, rgba(255,255,255,0.4) 35%, rgba(255,255,255,0.15) 50%, rgba(80,60,10,0.35) 100%)",
                }}
              />
            </>
          )}
          {ribbonLayout === "single-vertical" && (
            <div
              className="absolute inset-y-0"
              style={{
                left: "14.5%",
                width: "6%",
                zIndex: 6,
                backgroundColor: ribbonHex,
                backgroundImage: "linear-gradient(90deg, rgba(80,60,10,0.3) 0%, rgba(255,255,255,0.4) 35%, rgba(255,255,255,0.15) 50%, rgba(80,60,10,0.35) 100%)",
              }}
            />
          )}
          {ribbonLayout === "single-horizontal" && (
            <div
              className="absolute inset-x-0"
              style={{
                top: "14.5%",
                height: "6%",
                zIndex: 6,
                backgroundColor: ribbonHex,
                backgroundImage: "linear-gradient(180deg, rgba(80,60,10,0.3) 0%, rgba(255,255,255,0.4) 35%, rgba(255,255,255,0.15) 50%, rgba(80,60,10,0.35) 100%)",
              }}
            />
          )}
          {ribbonLayout === "diagonal-top-left" && (
            <div
              className="absolute w-[40%] h-[6%] origin-top-left"
              style={{
                left: "0%",
                top: "30%",
                transform: "rotate(-45deg)",
                zIndex: 6,
                backgroundColor: ribbonHex,
                backgroundImage: "linear-gradient(180deg, rgba(80,60,10,0.3) 0%, rgba(255,255,255,0.4) 35%, rgba(255,255,255,0.15) 50%, rgba(80,60,10,0.35) 100%)",
              }}
            />
          )}

          {/* Layout Feature 1: Showcase central spotlight glow mask */}
          {layoutId === "showcase" && heroItem && (
            <div
              className="absolute pointer-events-none rounded-full animate-pulse"
              style={{
                left: `${heroItem.pctX + heroItem.pctW / 2}%`,
                top: `${heroItem.pctY + heroItem.pctH / 2}%`,
                width: `${Math.max(heroItem.pctW, heroItem.pctH) * 2.3}%`,
                height: `${Math.max(heroItem.pctW, heroItem.pctH) * 2.3}%`,
                transform: "translate(-50%, -50%)",
                background: "radial-gradient(circle, rgba(212,175,55,0.38) 0%, rgba(212,175,55,0.1) 45%, rgba(212,175,55,0) 70%)",
                boxShadow: "0 0 50px rgba(212,175,55,0.22)",
                zIndex: 10,
                animationDuration: "4s"
              }}
            />
          )}

          {/* Layout Feature 2: Corporate wood compartment dividers */}
          {layoutId === "corporate" && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
              {(() => {
                const cols = Array.from(new Set(items.map(item => Math.round(item.pctX + item.pctW)))).sort((a,b)=>a-b).filter(x => x > 10 && x < 90);
                const rows = Array.from(new Set(items.map(item => Math.round(item.pctY + item.pctH)))).sort((a,b)=>a-b).filter(y => y > 10 && y < 90);
                return (
                  <>
                    {cols.map((x, idx) => (
                      <g key={`col-grp-${idx}`}>
                        <line x1={`${x}%`} y1="2%" x2={`${x}%`} y2="98%" stroke="#3E2723" strokeWidth="5.5" opacity="0.9" style={{ filter: "drop-shadow(1px 2px 2.5px rgba(0,0,0,0.4))" }} />
                        <line x1={`${x}%`} y1="2%" x2={`${x}%`} y2="98%" stroke="#D4AF37" strokeWidth="1.2" opacity="0.65" />
                      </g>
                    ))}
                    {rows.map((y, idx) => (
                      <g key={`row-grp-${idx}`}>
                        <line x1="2%" y1={`${y}%`} x2="98%" y2={`${y}%`} stroke="#3E2723" strokeWidth="5.5" opacity="0.9" style={{ filter: "drop-shadow(1px 2px 2.5px rgba(0,0,0,0.4))" }} />
                        <line x1="2%" y1={`${y}%`} x2="98%" y2={`${y}%`} stroke="#D4AF37" strokeWidth="1.2" opacity="0.65" />
                      </g>
                    ))}
                  </>
                );
              })()}
            </svg>
          )}


          {/* Fairy Lights Copper Connecting Wire */}
          {hasFairyLights && fairyLightsData.wirePath && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ zIndex: 4 }}
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <path
                d={fairyLightsData.wirePath}
                fill="none"
                stroke="#B8860B" // dark goldenrod copper wire
                strokeWidth="0.6"
                opacity="0.65"
                strokeDasharray="2, 2"
              />
            </svg>
          )}

          {/* Glowing Fairy Lights Bed */}
          {hasFairyLights && fairyLightsData.bulbs.map(light => (
            <div
              key={light.id}
              className="absolute pointer-events-none"
              style={{
                left: `${light.x}%`,
                top: `${light.y}%`,
                transform: "translate(-50%, -50%)",
                zIndex: 4
              }}
            >
              {/* Outer Glow Halo */}
              <motion.div
                animate={{
                  scale: [0.85, 1.25, 0.85],
                  opacity: [0.35, 0.8, 0.35]
                }}
                transition={{
                  duration: 2.2 + Math.sin(light.id) * 0.7,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: light.pulseDelay
                }}
                className="absolute rounded-full"
                style={{
                  width: `${28 * light.scale}px`,
                  height: `${28 * light.scale}px`,
                  transform: "translate(-50%, -50%)",
                  background: "radial-gradient(circle, rgba(255, 224, 130, 0.6) 0%, rgba(255, 179, 0, 0.2) 50%, rgba(255, 143, 0, 0) 70%)",
                }}
              />
              {/* Core Bulb */}
              <motion.div
                animate={{
                  scale: [0.95, 1.15, 0.95]
                }}
                transition={{
                  duration: 1.5 + Math.cos(light.id) * 0.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: light.pulseDelay
                }}
                className="rounded-full"
                style={{
                  width: `${6.5 * light.scale}px`,
                  height: `${6.5 * light.scale}px`,
                  backgroundColor: "#FFF9C4",
                  border: "0.5px solid #FFF",
                  boxShadow: `
                    0 0 8px #FFD54F,
                    0 0 16px #FFB300,
                    0 0 30px #FF8F00,
                    0 0 45px #FF6F00
                  `
                }}
              />
            </div>
          ))}

          {/* Scattered Decorative Accents (pearls, petals, stars, crystals) */}
          {accentsList.map(acc => {
            if (styling.accents === "pearls" || styling.accents === "confetti-pearls") {
              const colors = styling.accents === "pearls"
                ? ["#FCF9F2", "#FFFBF6", "#E8DCC4"]
                : ["#FFD3DD", "#E0F2FE", "#FFFBEB", "#F1F5F9"];
              const color = colors[acc.id.charCodeAt(acc.id.length - 1) % colors.length];
              return (
                <div
                  key={acc.id}
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    left: `${acc.x}%`,
                    top: `${acc.y}%`,
                    width: `${4.5 * acc.scale}px`,
                    height: `${4.5 * acc.scale}px`,
                    backgroundColor: color,
                    border: "0.5px solid rgba(255,255,255,0.7)",
                    boxShadow: "1px 2px 3px rgba(0,0,0,0.22), inset -1px -1px 2px rgba(0,0,0,0.15)",
                    zIndex: 22
                  }}
                />
              );
            } else if (styling.accents === "rose-petals") {
              return (
                <div
                  key={acc.id}
                  className="absolute pointer-events-none"
                  style={{
                    left: `${acc.x}%`,
                    top: `${acc.y}%`,
                    width: `${11 * acc.scale}px`,
                    height: `${8 * acc.scale}px`,
                    backgroundColor: "#9B1C1C",
                    borderRadius: "50% 30% 50% 40%",
                    transform: `rotate(${acc.rotate}deg)`,
                    boxShadow: "1px 2px 3px rgba(0,0,0,0.3)",
                    zIndex: 22,
                    opacity: 0.9
                  }}
                />
              );
            } else if (styling.accents === "marigold-petals") {
              const color = acc.scale > 0.9 ? "#F97316" : "#FACC15";
              return (
                <div
                  key={acc.id}
                  className="absolute pointer-events-none"
                  style={{
                    left: `${acc.x}%`,
                    top: `${acc.y}%`,
                    width: `${7 * acc.scale}px`,
                    height: `${5 * acc.scale}px`,
                    backgroundColor: color,
                    borderRadius: "80% 20% 80% 40%",
                    transform: `rotate(${acc.rotate}deg)`,
                    boxShadow: "0.5px 1px 2px rgba(0,0,0,0.25)",
                    zIndex: 22
                  }}
                />
              );
            } else if (styling.accents === "gold-stars") {
              return (
                <div
                  key={acc.id}
                  className="absolute pointer-events-none"
                  style={{
                    left: `${acc.x}%`,
                    top: `${acc.y}%`,
                    width: `${10 * acc.scale}px`,
                    height: `${10 * acc.scale}px`,
                    transform: `rotate(${acc.rotate}deg)`,
                    zIndex: 22,
                    filter: "drop-shadow(1px 1.5px 1.5px rgba(0,0,0,0.25))"
                  }}
                >
                  <svg viewBox="0 0 24 24" className="w-full h-full">
                    <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" fill="#D4AF37" />
                  </svg>
                </div>
              );
            } else if (styling.accents === "crystals") {
              return (
                <div
                  key={acc.id}
                  className="absolute pointer-events-none"
                  style={{
                    left: `${acc.x}%`,
                    top: `${acc.y}%`,
                    width: `${6 * acc.scale}px`,
                    height: `${6 * acc.scale}px`,
                    transform: `rotate(${acc.rotate}deg)`,
                    zIndex: 22,
                    filter: "drop-shadow(0.5px 1px 1px rgba(0,0,0,0.15))"
                  }}
                >
                  <svg viewBox="0 0 10 10" className="w-full h-full">
                    <polygon points="5,0 10,5 5,10 0,5" fill="#93C5FD" opacity="0.8" />
                  </svg>
                </div>
              );
            }
            return null;
          })}

          {/* Scattered Luxury Gold Foil Flakes */}
          {goldFoilFlakesList.map((flake) => {
            const pointsOptions = [
              "2,1 7,2 9,6 4,9 1,5",
              "1,3 6,1 9,4 6,9 2,7",
              "3,1 8,3 7,8 2,6 1,4",
              "2,2 5,1 9,5 5,8 1,5"
            ];
            const points = pointsOptions[flake.shapeIdx];
            return (
              <div
                key={flake.id}
                className="absolute pointer-events-none"
                style={{
                  left: `${flake.x}%`,
                  top: `${flake.y}%`,
                  width: `${11 * flake.scale}px`,
                  height: `${11 * flake.scale}px`,
                  transform: `rotate(${flake.rotate}deg)`,
                  zIndex: 21,
                  filter: "drop-shadow(1px 1.5px 2px rgba(0, 0, 0, 0.3))"
                }}
              >
                <svg viewBox="0 0 10 10" className="w-full h-full">
                  <polygon points={points} fill="url(#goldFoilGrad)" />
                </svg>
              </div>
            );
          })}

          {/* Scattered Magic Glitter Sparkles for extra "wow" factor */}
          {sparklesList.map(sp => (
            <div
              key={sp.id}
              className="absolute pointer-events-none animate-pulse"
              style={{
                left: `${sp.x}%`,
                top: `${sp.y}%`,
                width: `${14 * sp.scale}px`,
                height: `${14 * sp.scale}px`,
                transform: `rotate(${sp.rotate}deg)`,
                zIndex: 23,
                opacity: 0.85,
                filter: "drop-shadow(0 0 4px #FDE047)"
              }}
            >
              <svg viewBox="0 0 24 24" className="w-full h-full">
                <path d="M12,2 L14,10 L22,12 L14,14 L12,22 L10,14 L2,12 L10,10 Z" fill="#FEF08A" />
              </svg>
            </div>
          ))}

          {/* Foliage framing empty spaces (nested below flowers) */}
          {floristArrangement.foliage.map(fol => {
            if (fol.type === "gold_laurel") {
              return <GoldLaurelBranch key={fol.id} x={fol.cx} y={fol.cy} rotate={fol.rotate} />;
            } else if (fol.type === "rose_leaves") {
              return <RoseLeavesBranch key={fol.id} x={fol.cx} y={fol.cy} rotate={fol.rotate} />;
            } else if (fol.type === "silver_dollar") {
              return <SilverDollarBranch key={fol.id} x={fol.cx} y={fol.cy} rotate={fol.rotate} />;
            } else if (fol.type === "baby_breath") {
              return <BabyBreathFlower key={fol.id} x={fol.cx} y={fol.cy} />;
            } else if (fol.type === "lavender") {
              return <LavenderStem key={fol.id} x={fol.cx} y={fol.cy} rotate={fol.rotate} />;
            } else if (fol.type === "tropical_fern") {
              const fColor = box.id === "black_gold" ? "#D4AF37" : "#1B4332";
              return <TropicalFern key={fol.id} x={fol.cx} y={fol.cy} rotate={fol.rotate} color={fColor} />;
            } else {
              return <EucalyptusBranch key={fol.id} x={fol.cx} y={fol.cy} rotate={fol.rotate} />;
            }
          })}

          {/* Flowers nested in empty spaces and foliage */}
          {floristArrangement.flowers.map(fl => {
            const colors = styling.flowerColors || { pri: "#EF4444", sec: "#C94F6D", inn: "#FFF0F2" };
            if (fl.type === "daisy") {
              return <DaisyFlower key={fl.id} x={fl.cx} y={fl.cy} scale={fl.scale} />;
            } else if (fl.type === "hydrangea") {
              const hColor = occasionId === "wedding" ? "#F5D0C5" : (occasionId === "birthday" ? "#F472B6" : "#C084FC");
              return <HydrangeaFlower key={fl.id} x={fl.cx} y={fl.cy} scale={fl.scale} color={hColor} />;
            } else if (fl.type === "peony") {
              const pColor = occasionId === "anniversary" ? "#E11D48" : "#F472B6";
              return <PeonyFlower key={fl.id} x={fl.cx} y={fl.cy} scale={fl.scale} color={pColor} />;
            } else if (fl.type === "baby_breath") {
              return <BabyBreathFlower key={fl.id} x={fl.cx} y={fl.cy} />;
            } else if (fl.type === "lavender") {
              return <LavenderStem key={fl.id} x={fl.cx} y={fl.cy} rotate={fl.rotate} />;
            } else {
              return (
                <RoseFlower
                  key={fl.id}
                  x={fl.cx}
                  y={fl.cy}
                  scale={fl.scale}
                  primaryColor={colors.pri}
                  secondaryColor={colors.sec}
                  innerColor={colors.inn}
                />
              );
            }
          })}

          {/* Arranged Products */}
          <div className="absolute inset-0 pointer-events-none">
            {items.map((item, i) => (
              <ProductTile
                key={item.product.id}
                p={item.product}
                slot={item}
                index={i}
                box={box}
                items={items}
              />
            ))}
          </div>

          {/* Overlay Crinkle Shreds overlapping products slightly (nested) */}
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
                  zIndex: 4, // sit underneath products so they remain fully clear
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
                width: "22%",
                height: "32%",
                zIndex: 15, // Nested in tissue folds
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
              <div className="absolute bottom-1 left-0 right-0 text-center font-serif text-[6px] text-slate-400 tracking-wider">
                MEMORIES
              </div>
            </motion.div>
          )}

          {/* Greeting Card - Framed elegantly per occasion */}
          {(customizations.message || customizations.name) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: 6 }}
              animate={{ opacity: 1, scale: 1, rotate: 4 }}
              className={`absolute text-slate-800 p-2.5 rounded shadow-xl border flex flex-col justify-between`}
              style={{
                bottom: "8%",
                right: "6%",
                width: "26%",
                height: "24%",
                backgroundColor: styling.card.bg,
                borderColor: `${styling.card.border}35`,
                zIndex: 15,
                boxShadow: "5px 10px 22px rgba(3, 10, 25, 0.25)"
              }}
            >
              <div className="absolute inset-1.5 border border-dashed rounded pointer-events-none" style={{ borderColor: `${styling.card.border}30` }} />
              <div className="relative z-10 flex flex-col h-full justify-between text-center">
                <div className="border-b pb-0.5 mb-0.5" style={{ borderColor: `${styling.card.border}20` }}>
                  <span className={`text-[7px] font-extrabold uppercase tracking-widest block ${styling.card.textColor}`}>
                    {styling.card.title}
                  </span>
                </div>
                <p className={`italic ${styling.card.bodyColor} leading-relaxed ${styling.card.font} text-[7px] line-clamp-2 my-auto px-0.5`}>
                  "{customizations.message || "Wishing you warmth and joy."}"
                </p>
                <div className={`text-[6px] ${styling.card.textColor} tracking-widest uppercase font-bold`}>
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
                width: "35px",
                height: "35px",
                zIndex: 15
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
                className="bg-black/55 backdrop-blur-sm text-yellow-100 text-[8px] font-semibold tracking-widest px-3 py-1 rounded-full border border-[#D4AF37]/35 uppercase"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {customizations.customText}
              </span>
            </div>
          )}

          {/* Ribbon Tails */}
          {ribbonLayout !== "diagonal-top-left" && (
            <>
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
                  zIndex: 7
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
                  zIndex: 7
                }}
              />
            </>
          )}

          {/* Luxury Bow Loop */}
          {ribbonLayout !== "diagonal-top-left" && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.35, type: "spring", stiffness: 140 }}
              className="absolute cursor-grab active:cursor-grabbing"
              style={{
                left: "14.5%",
                top: "14.5%",
                transform: "translate(-50%, -50%)",
                zIndex: 8
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
          )}

          {/* Specular Photographic Lighting Reflection */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(circle at 25% 20%, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0) 60%)",
              mixBlendMode: "overlay",
              zIndex: 100
            }}
          />

          {/* Vignette Shading Layer */}
          <div
            className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-[0.28]"
            style={{
              background: "linear-gradient(135deg, transparent 40%, rgba(0, 0, 0, 0.8) 100%)",
              zIndex: 99
            }}
          />
        </div>
      </div>
    </div>
  );
}