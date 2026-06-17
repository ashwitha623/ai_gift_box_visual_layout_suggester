import { useMemo, useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { CATEGORY_FALLBACKS } from "@/lib/giftdata";

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

// Rebuilt AI Layout Engine Slot Coordinates and Sizing
const getLayoutSlots = (layoutId, items) => {
  const count = items.length;

  // Base slot width and height depending on product count to fill 70-85% box area
  let baseW = 14;
  let baseH = 18;

  if (count === 1) {
    baseW = 21;
    baseH = 27;
  } else if (count === 2) {
    baseW = 16;
    baseH = 21.5;
  } else if (count === 3) {
    baseW = 14.5;
    baseH = 19;
  } else if (count === 4) {
    baseW = 13.5;
    baseH = 17.5;
  } else if (count >= 5 && count <= 6) {
    baseW = 12.5;
    baseH = 16.5;
  } else {
    baseW = 11.2;
    baseH = 14.8;
  }

  // Position templates: coordinates represent slot centers in percentages
  let positions = [];

  if (count === 1) {
    // 1 Product: Centered showcase layout
    positions = [{ x: 50, y: 50, rot: 0, z: 2 }];
  } else if (count === 2) {
    // 2 Products: Side-by-side luxury arrangement
    positions = [
      { x: 30, y: 50, rot: -2, z: 2 },
      { x: 70, y: 50, rot: 2, z: 3 }
    ];
  } else if (count === 3) {
    // 3 Products: Triangle arrangement (Anchor top-center, supporting bottom flanking)
    positions = [
      { x: 50, y: 36, rot: 0, z: 3 }, // Anchor (top-center)
      { x: 24, y: 69, rot: -4, z: 2 }, // bottom-left supporting
      { x: 76, y: 69, rot: 4, z: 2 }  // bottom-right supporting
    ];
  } else if (count === 4) {
    // 4 Products: 2x2 premium grid
    positions = [
      { x: 27, y: 29, rot: -2, z: 2 }, // top-left
      { x: 73, y: 29, rot: 2, z: 3 },  // top-right
      { x: 27, y: 71, rot: -1, z: 4 }, // bottom-left
      { x: 73, y: 71, rot: 1, z: 5 }   // bottom-right
    ];
  } else if (count === 5) {
    // 5 Products: Hero center layout (focal item center, 4 supporting items in corners)
    positions = [
      { x: 50, y: 50, rot: 0, z: 4 }, // Hero center
      { x: 22, y: 25, rot: -3, z: 2 }, // top-left
      { x: 78, y: 25, rot: 3, z: 2 },  // top-right
      { x: 22, y: 75, rot: -2, z: 3 }, // bottom-left
      { x: 78, y: 75, rot: 2, z: 3 }  // bottom-right
    ];
  } else if (count === 6) {
    // 6 Products: Balanced luxury hamper 2x3 grid
    positions = [
      { x: 50, y: 28, rot: 0, z: 3 }, // top-center (anchor)
      { x: 22, y: 28, rot: -4, z: 2 }, // top-left
      { x: 78, y: 28, rot: 4, z: 2 },  // top-right
      { x: 22, y: 72, rot: -2, z: 4 }, // bottom-left
      { x: 50, y: 72, rot: 1, z: 5 },  // bottom-center
      { x: 78, y: 72, rot: 2, z: 4 }   // bottom-right
    ];
  } else if (count === 7) {
    // 7 Products: Full hamper arrangement
    positions = [
      { x: 50, y: 22, rot: 0, z: 3 }, // top focal
      { x: 22, y: 24, rot: -3, z: 2 }, // top-left
      { x: 78, y: 24, rot: 3, z: 2 },  // top-right
      { x: 35, y: 50, rot: -1, z: 4 }, // mid-left
      { x: 65, y: 50, rot: 1, z: 4 },  // mid-right
      { x: 22, y: 76, rot: -2, z: 5 }, // bottom-left
      { x: 78, y: 76, rot: 2, z: 5 }   // bottom-right
    ];
  } else {
    // 8 Products: Full hamper arrangement
    positions = [
      { x: 50, y: 22, rot: 0, z: 3 }, // top focal
      { x: 20, y: 24, rot: -3, z: 2 }, // top-left
      { x: 80, y: 24, rot: 3, z: 2 },  // top-right
      { x: 20, y: 52, rot: -1, z: 4 }, // mid-left
      { x: 50, y: 52, rot: 0, z: 4 },  // mid-center
      { x: 80, y: 52, rot: 1, z: 5 },  // mid-right
      { x: 32, y: 78, rot: -2, z: 6 }, // bottom-left
      { x: 68, y: 78, rot: 2, z: 6 }   // bottom-right
    ];
  }

  // Calculate dynamic scales and box boundary margin sizes for each product
  return positions.map((pos, idx) => {
    const item = items[idx];
    if (!item) return pos;

    // Scale factors: Large: 2.7, Medium: 2.2, Small: 1.85 (Proportional scales)
    const scale = item.size === "Large" ? 2.7 : item.size === "Medium" ? 2.2 : 1.85;

    let w = baseW * scale;
    let h = baseH * scale;

    // Special sizing rule for 1 Product: scale to occupy approx 60% of box space
    if (count === 1) {
      const singleScale = item.size === "Large" ? 1.05 : item.size === "Medium" ? 0.88 : 0.74;
      w = 52 * singleScale;
      h = 60 * singleScale;
    }

    return {
      ...pos,
      w,
      h,
      scaleFactor: scale
    };
  });
};

// High-performance canvas-drawn crinkle paper bed
function CrinklePaperCanvas() {
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
      ctx.fillStyle = "#D7B48E"; // Kraft brown base
      ctx.fillRect(0, 0, w, h);

      const colors = [
        "#8B623A", // Dark Kraft
        "#A0784E", // Wood-wool brown
        "#B58D5F", // Warm tan
        "#C49A6C", // Tan filler
        "#D7B48E", // Light Kraft
        "#E2CDAF", // Cream tan
      ];

      ctx.save();
      // Apply soft shadows to canvas strokes
      ctx.shadowColor = "rgba(40, 20, 5, 0.22)";
      ctx.shadowBlur = 3.5;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1.8;

      // Draw dense wood wool (1600 strands)
      for (let i = 0; i < 1600; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.6 + Math.random() * 1.0;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        const startX = Math.random() * (w + 40) - 20;
        const startY = Math.random() * (h + 40) - 20;
        const length = 55 + Math.random() * 85;
        const angle = Math.random() * Math.PI * 2;

        ctx.beginPath();
        ctx.moveTo(startX, startY);

        let cx = startX;
        let cy = startY;
        const segments = 4;
        const segLen = length / segments;

        for (let s = 0; s < segments; s++) {
          const nextX = cx + Math.cos(angle) * segLen + (Math.random() - 0.5) * 15;
          const nextY = cy + Math.sin(angle) * segLen + (Math.random() - 0.5) * 15;

          const cpX = (cx + nextX) / 2 + (Math.random() - 0.5) * 20;
          const cpY = (cy + nextY) / 2 + (Math.random() - 0.5) * 20;

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
  }, []);

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
    // Verify external origins. Apply crossOrigin anonymous strictly on external assets.
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

        // Scan all pixels for any transparent pixel (alpha < 200)
        let hasTransparency = false;
        for (let i = 3; i < data.length; i += 4) {
          if (data[i] < 200) {
            hasTransparency = true;
            break;
          }
        }

        // If the image already has transparent pixels, keep it as is (bypass BFS keyer)
        if (hasTransparency) {
          setImgSrc(srcToProcess);
          setProcessed(true);
          return;
        }

        // BFS Flood-Fill Background Removal Filter
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

  // Centering logic based on slot coordinate offset
  const leftPos = slot.x - slot.w / 2;
  const topPos = slot.y - slot.h / 2;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, rotate: slot.rot - 10, scale: 0.6 }}
      animate={{ opacity: 1, y: 0, rotate: slot.rot, scale: 1 }}
      transition={{
        delay: index * 0.08,
        type: "spring",
        stiffness: 150,
        damping: 15
      }}
      className="absolute group flex items-center justify-center pointer-events-auto"
      style={{
        left: `${leftPos}%`,
        top: `${topPos}%`,
        width: `${slot.w}%`,
        height: `${slot.h}%`,
        transform: `rotate(${slot.rot}deg)`,
        zIndex: slot.z * 10 + 20, // Rendered safely above the ribbon bands (zIndex 2-5)
        background: "transparent",
        filter: "drop-shadow(0 8px 12px rgba(35, 15, 5, 0.42)) drop-shadow(0 2px 4px rgba(35, 15, 5, 0.18))",
        transition: "filter 0.3s ease, transform 0.3s ease"
      }}
      whileHover={{
        scale: 1.05,
        y: -4,
        filter: "drop-shadow(0 16px 20px rgba(35, 15, 5, 0.52)) drop-shadow(0 5px 8px rgba(35, 15, 5, 0.3))",
        zIndex: 150
      }}
    >
      <img
        src={processed ? imgSrc : (p.image || fallbackSrc)}
        alt={p.name}
        className="max-w-full max-h-full object-contain select-none pointer-events-none transform transition-transform duration-300 group-hover:scale-[1.02]"
        onError={(e) => {
          e.currentTarget.src = fallbackSrc;
        }}
      />
    </motion.div>
  );
}

export default function GiftBoxVisual({
  products,
  ribbonHex = "#D4AF37", // Premium Gold Ribbon
  layoutId = "showcase",
  size = "lg",
  customizations = {} // name, message, photoUrl, logoUrl, customText
}) {
  const items = useMemo(() => {
    return [...products]
      .sort((a, b) => {
        const order = { Large: 3, Medium: 2, Small: 1 };
        return order[b.size] - order[a.size];
      })
      .slice(0, 8);
  }, [products]);

  const slots = useMemo(() => {
    return getLayoutSlots(layoutId, items);
  }, [layoutId, items]);

  const maxW = size === "lg" ? "max-w-3xl" : "max-w-xs";

  // Procedural Top-layer crinkle paper shreds (rendered above products for realistic nesting depth)
  const topShreds = useMemo(() => {
    const colors = [
      "#A0784E", // Wood-wool brown
      "#B58D5F", // Warm tan
      "#8B623A", // Dark Kraft brown
      "#D7B48E", // Light Kraft paper
      "#C49A6C", // Tan filler
      "#E2CDAF", // Pale cream tan
    ];
    return Array.from({ length: 35 }).map((_, i) => {
      const isHorizontal = Math.random() > 0.5;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const width = isHorizontal ? 70 + Math.random() * 50 : 10 + Math.random() * 5;
      const height = isHorizontal ? 10 + Math.random() * 5 : 70 + Math.random() * 50;

      return {
        id: i,
        left: Math.random() * 92 + 4,
        top: Math.random() * 92 + 4,
        width,
        height,
        rotate: Math.random() * 360,
        color: color,
        opacity: 0.8 + Math.random() * 0.2,
        isHorizontal
      };
    });
  }, []);

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

      {/* Rectangular Rigid Luxury Navy Gift Box (Rigid edges with rounded-2xl) */}
      <div
        className="relative rounded-2xl transition-all duration-500 overflow-hidden"
        style={{
          aspectRatio: "1.6 / 1",
          background: "linear-gradient(135deg, #0B1D37 0%, #050E1B 100%)", // Rich Corporate Navy
          padding: "20px", // Thick box wall padding
          boxShadow: `
            0 25px 55px rgba(2, 6, 15, 0.4),
            inset 0 1.5px 3px rgba(255, 255, 255, 0.12),
            inset 0 -1.5px 3px rgba(0, 0, 0, 0.45)
          `
        }}
      >
        {/* Subtle Double Gold foil borders near the outer wall edges */}
        <div className="absolute inset-2 rounded-xl border border-[#D4AF37]/35 pointer-events-none" />
        <div className="absolute inset-3 rounded-lg border border-[#D4AF37]/15 pointer-events-none" />

        {/* Box Inner Compartment Well */}
        <div
          className="relative w-full h-full rounded-lg"
          style={{
            background: "#D7B48E", // Kraft paper base
            border: "10px solid #061324", // Inner navy rim walls
            boxShadow: `
              inset 0 14px 28px rgba(0, 0, 0, 0.55),
              inset 14px 0 18px rgba(0, 0, 0, 0.35),
              inset -14px 0 18px rgba(0, 0, 0, 0.35),
              inset 0 -14px 18px rgba(0, 0, 0, 0.35)
            `,
            overflow: "hidden"
          }}
        >
          {/* Canvas crinkle paper bed (zIndex: 1) */}
          <CrinklePaperCanvas />

          {/* Elegant Corner-Wrapped Satin Ribbon (Runs vertically and horizontally at 15%) */}
          
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

          {/* Satin Ribbon Bands (Luxury Gold or Custom ribbonHex) */}
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

          {/* Arranged Products (zIndex: 20+) */}
          <div className="absolute inset-0 pointer-events-none">
            {items.map((product, i) => (
              <ProductTile
                key={product.id}
                p={product}
                slot={slots[i]}
                index={i}
              />
            ))}
          </div>

          {/* Overlay Crinkle Shreds (zIndex: 40 - overlays products slightly for nesting depth) */}
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

          {/* Polaroid Style Custom Photo Card */}
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
                zIndex: 45, // Above top crinkles but below products if they overlap
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

          {/* Greeting Card - Styled to match "Especially For You" */}
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

          {/* Ribbon Tails draping from the Bow (zIndex: 3) */}
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

          {/* Luxury 8-Loop Satin Bow at the (15%, 15%) Ribbon intersection */}
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
              {/* Outer Loops */}
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

              {/* Inner Loops */}
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

              {/* Central Knot Center */}
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

          {/* Soft Photography Studio Shadow & Key Lighting overlay */}
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