import { BOX_TEMPLATES } from "./giftdata.js";

// Helper to check boundaries and overlaps
function isValidPlacement(x, y, w, h, boxL, boxW, margin, gap, placed) {
  if (x < margin - 0.05 || y < margin - 0.05 || x + w > boxL - margin + 0.05 || y + h > boxW - margin + 0.05) {
    return false;
  }
  for (const other of placed) {
    const dx = Math.max(0, other.x - (x + w), x - (other.x + other.w));
    const dy = Math.max(0, other.y - (y + h), y - (other.y + other.h));
    const dist = Math.max(dx, dy);
    if (dist < gap - 0.05) {
      return false;
    }
  }
  return true;
}

// 1. Premium Showcase: Center largest item, place others radially
function packShowcase(box, products, scale, margin, gap) {
  const boxL = box.length;
  const boxW = box.width;
  const placed = [];
  const cx = boxL / 2;
  const cy = boxW / 2;

  const sorted = [...products].sort((a, b) => (b.length * b.width) - (a.length * a.width));

  // Place first (largest) item in the center
  const p0 = sorted[0];
  const w0 = p0.length * scale;
  const h0 = p0.width * scale;
  const x0 = cx - w0 / 2;
  const y0 = cy - h0 / 2;

  if (!isValidPlacement(x0, y0, w0, h0, boxL, boxW, margin, gap, [])) {
    return null; // Center item doesn't fit
  }

  placed.push({ product: p0, x: x0, y: y0, w: w0, h: h0, rotated: false });

  // Place remaining items radially
  const remaining = sorted.slice(1);
  const N = remaining.length;

  for (let i = 0; i < N; i++) {
    const p = remaining[i];
    const normalW = p.length * scale;
    const normalH = p.width * scale;

    let bestX = null, bestY = null, bestW = null, bestH = null, bestRotated = false;
    let placedOk = false;

    // Try normal and rotated orientations
    const orientations = [
      { w: normalW, h: normalH, rotated: false },
      { w: normalH, h: normalW, rotated: true }
    ];

    // Try placing at radial angle
    const baseTheta = (i * 2 * Math.PI) / N;

    for (const orient of orientations) {
      // Search radial distances
      for (let r = Math.max(w0, h0) * 0.4 + gap; r < Math.max(boxL, boxW); r += 0.5) {
        // Try slight offsets in angle to bypass obstacles
        for (let angleOffset = 0; angleOffset <= Math.PI; angleOffset += Math.PI / 8) {
          for (const sign of [1, -1]) {
            const theta = baseTheta + sign * angleOffset;
            const px = cx + r * Math.cos(theta) - orient.w / 2;
            const py = cy + r * Math.sin(theta) - orient.h / 2;

            if (isValidPlacement(px, py, orient.w, orient.h, boxL, boxW, margin, gap, placed)) {
              bestX = px;
              bestY = py;
              bestW = orient.w;
              bestH = orient.h;
              bestRotated = orient.rotated;
              placedOk = true;
              break;
            }
          }
          if (placedOk) break;
        }
        if (placedOk) break;
      }
      if (placedOk) break;
    }

    if (!placedOk) {
      return null; // Failed to pack
    }

    placed.push({ product: p, x: bestX, y: bestY, w: bestW, h: bestH, rotated: bestRotated });
  }

  return placed;
}

// 2. Luxury Symmetrical: Mirror left/right sides
function packSymmetrical(box, products, scale, margin, gap) {
  const boxL = box.length;
  const boxW = box.width;
  const placed = [];
  const cx = boxL / 2;
  const cy = boxW / 2;

  const sorted = [...products].sort((a, b) => (b.length * b.width) - (a.length * a.width));

  // Place first (largest) item in the center
  const p0 = sorted[0];
  const w0 = p0.length * scale;
  const h0 = p0.width * scale;
  const x0 = cx - w0 / 2;
  const y0 = cy - h0 / 2;

  if (!isValidPlacement(x0, y0, w0, h0, boxL, boxW, margin, gap, [])) {
    return null;
  }
  placed.push({ product: p0, x: x0, y: y0, w: w0, h: h0, rotated: false });

  // Divide remaining items into Left stack and Right stack
  const remaining = sorted.slice(1);
  const leftStack = [];
  const rightStack = [];

  for (let i = 0; i < remaining.length; i++) {
    if (i % 2 === 0) {
      leftStack.push(remaining[i]);
    } else {
      rightStack.push(remaining[i]);
    }
  }

  const placeStack = (stack, side) => {
    const totalHeight = stack.reduce((sum, p) => sum + (p.width * scale), 0) + (stack.length - 1) * gap;
    let currentY = cy - totalHeight / 2;
    const targetX = side === "left" ? boxL * 0.22 : boxL * 0.78;

    for (const p of stack) {
      const w = p.length * scale;
      const h = p.width * scale;
      let px = targetX - w / 2;
      let py = currentY;

      // Check and nudge away from center if overlapping center item
      if (px + w > x0 - gap && px < x0 + w0 + gap) {
        if (side === "left") {
          px = x0 - gap - w;
        } else {
          px = x0 + w0 + gap;
        }
      }

      // Try orientation rotation if out of bounds
      let orientationOk = false;
      const orients = [
        { w, h, rotated: false },
        { w: h, h: w, rotated: true }
      ];

      for (const orient of orients) {
        if (isValidPlacement(px, py, orient.w, orient.h, boxL, boxW, margin, gap, placed)) {
          placed.push({ product: p, x: px, y: py, w: orient.w, h: orient.h, rotated: orient.rotated });
          currentY += orient.h + gap;
          orientationOk = true;
          break;
        } else {
          // Try nudging vertically or horizontally
          for (let nx = px - 1.5; nx <= px + 1.5; nx += 0.5) {
            for (let ny = py - 1.5; ny <= py + 1.5; ny += 0.5) {
              if (isValidPlacement(nx, ny, orient.w, orient.h, boxL, boxW, margin, gap, placed)) {
                placed.push({ product: p, x: nx, y: ny, w: orient.w, h: orient.h, rotated: orient.rotated });
                currentY += orient.h + gap;
                orientationOk = true;
                break;
              }
            }
            if (orientationOk) break;
          }
        }
        if (orientationOk) break;
      }

      if (!orientationOk) return false;
    }
    return true;
  };

  if (leftStack.length > 0 && !placeStack(leftStack, "left")) return null;
  if (rightStack.length > 0 && !placeStack(rightStack, "right")) return null;

  return placed;
}

// 3. Maximum Space Utilization: Corner-dense packing
function packSpaceUtil(box, products, scale, margin, gap) {
  const boxL = box.length;
  const boxW = box.width;
  const placed = [];

  const sorted = [...products].sort((a, b) => (b.length * b.width) - (a.length * a.width));
  let candidatePoints = [{ x: margin, y: margin }];

  for (const p of sorted) {
    let bestX = null, bestY = null, bestW = null, bestH = null, bestRotated = false;
    let minCost = Infinity;

    for (const pt of candidatePoints) {
      const orients = [
        { w: p.length * scale, h: p.width * scale, rotated: false },
        { w: p.width * scale, h: p.length * scale, rotated: true }
      ];

      for (const orient of orients) {
        const px = pt.x;
        const py = pt.y;

        if (isValidPlacement(px, py, orient.w, orient.h, boxL, boxW, margin, gap, placed)) {
          // Prioritize top-left corner packing
          const cost = px * 1.0 + py * 1.4;
          if (cost < minCost) {
            minCost = cost;
            bestX = px;
            bestY = py;
            bestW = orient.w;
            bestH = orient.h;
            bestRotated = orient.rotated;
          }
        }
      }
    }

    if (bestX === null) {
      return null;
    }

    const item = { product: p, x: bestX, y: bestY, w: bestW, h: bestH, rotated: bestRotated };
    placed.push(item);

    // Add candidate points
    candidatePoints.push({ x: item.x + item.w + gap, y: item.y });
    candidatePoints.push({ x: item.x, y: item.y + item.h + gap });
  }

  return placed;
}

// 4. Safe Shipping: Middle-fragile, edge-heavy, double safety margins
function packSafeShipping(box, products, scale, originalMargin, originalGap) {
  const boxL = box.length;
  const boxW = box.width;
  const placed = [];
  const cx = boxL / 2;
  const cy = boxW / 2;

  // Use increased margin and gap parameters for extra safety
  const margin = 2.0; 
  const gap = 1.8;

  // Sort fragile first (placed near center), then heavy products (shield items)
  const sorted = [...products].sort((a, b) => {
    if (a.fragile && !b.fragile) return -1;
    if (!a.fragile && b.fragile) return 1;
    return b.weight - a.weight;
  });

  // Candidate points initialized around the center and corners
  let candidatePoints = [
    { x: cx - 4, y: cy - 4, origin: "center" },
    { x: margin, y: margin, origin: "corner" },
    { x: boxL - margin - 8, y: margin, origin: "corner" },
    { x: margin, y: boxW - margin - 8, origin: "corner" },
    { x: boxL - margin - 8, y: boxW - margin - 8, origin: "corner" }
  ];

  for (const p of sorted) {
    let bestX = null, bestY = null, bestW = null, bestH = null, bestRotated = false;
    let minCost = Infinity;

    for (const pt of candidatePoints) {
      const orients = [
        { w: p.length * scale, h: p.width * scale, rotated: false },
        { w: p.width * scale, h: p.length * scale, rotated: true }
      ];

      for (const orient of orients) {
        let px = pt.x;
        let py = pt.y;

        // If starting from center, try to align to the literal center
        if (pt.origin === "center" && placed.length === 0) {
          px = cx - orient.w / 2;
          py = cy - orient.h / 2;
        }

        if (isValidPlacement(px, py, orient.w, orient.h, boxL, boxW, margin, gap, placed)) {
          // Fragile products seek center, non-fragile shield items seek edges
          const distToCenter = Math.pow(px + orient.w / 2 - cx, 2) + Math.pow(py + orient.h / 2 - cy, 2);
          const cost = p.fragile ? distToCenter : -distToCenter;

          if (cost < minCost) {
            minCost = cost;
            bestX = px;
            bestY = py;
            bestW = orient.w;
            bestH = orient.h;
            bestRotated = orient.rotated;
          }
        }
      }
    }

    if (bestX === null) {
      // Fallback: search general space
      let foundFallback = false;
      for (let px = margin; px <= boxL - margin; px += 0.5) {
        for (let py = margin; py <= boxW - margin; py += 0.5) {
          const w = p.length * scale;
          const h = p.width * scale;
          if (isValidPlacement(px, py, w, h, boxL, boxW, margin, gap, placed)) {
            bestX = px;
            bestY = py;
            bestW = w;
            bestH = h;
            bestRotated = false;
            foundFallback = true;
            break;
          }
        }
        if (foundFallback) break;
      }

      if (!foundFallback) return null;
    }

    const item = { product: p, x: bestX, y: bestY, w: bestW, h: bestH, rotated: bestRotated };
    placed.push(item);

    // Expand candidate points
    candidatePoints.push({ x: item.x + item.w + gap, y: item.y, origin: "edge" });
    candidatePoints.push({ x: item.x, y: item.y + item.h + gap, origin: "edge" });
  }

  return placed;
}

// 5. Corporate Executive: Structured grid of rows and columns
function packCorporate(box, products, scale, margin, gap) {
  const boxL = box.length;
  const boxW = box.width;
  const placed = [];

  // Sort by height descending to maintain neat rows
  const sorted = [...products].sort((a, b) => b.width - a.width);

  let currentY = margin;
  let currentX = margin;
  let rowHeight = 0;

  for (const p of sorted) {
    const w = p.length * scale;
    const h = p.width * scale;

    // Check if fits in current row
    if (currentX + w > boxL - margin) {
      // Move to next row
      currentX = margin;
      currentY += rowHeight + gap;
      rowHeight = 0;
    }

    // Check row bounds
    if (currentY + h > boxW - margin) {
      return null;
    }

    // Verify overlaps
    if (!isValidPlacement(currentX, currentY, w, h, boxL, boxW, margin, gap, placed)) {
      // Try to nudge slightly
      let nudged = false;
      for (let nx = currentX; nx <= boxL - margin - w; nx += 0.2) {
        if (isValidPlacement(nx, currentY, w, h, boxL, boxW, margin, gap, placed)) {
          placed.push({ product: p, x: nx, y: currentY, w, h, rotated: false });
          currentX = nx + w + gap;
          rowHeight = Math.max(rowHeight, h);
          nudged = true;
          break;
        }
      }
      if (!nudged) return null;
    } else {
      placed.push({ product: p, x: currentX, y: currentY, w, h, rotated: false });
      currentX += w + gap;
      rowHeight = Math.max(rowHeight, h);
    }
  }

  return placed;
}

// Main coordinator wrapper that scales products to fit
function packLayout(box, products, layoutStyle) {
  const scales = [1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3];
  const margin = 1.2;
  const gap = 0.6;

  for (const scale of scales) {
    let result = null;
    if (layoutStyle === "showcase") {
      result = packShowcase(box, products, scale, margin, gap);
    } else if (layoutStyle === "symmetrical") {
      result = packSymmetrical(box, products, scale, margin, gap);
    } else if (layoutStyle === "space_utilization") {
      result = packSpaceUtil(box, products, scale, margin, gap);
    } else if (layoutStyle === "safe_shipping") {
      result = packSafeShipping(box, products, scale, margin, gap);
    } else if (layoutStyle === "corporate") {
      result = packCorporate(box, products, scale, margin, gap);
    }

    if (result) {
      // Convert layout absolute coordinates to percentages for rendering
      return result.map(item => ({
        ...item,
        pctX: (item.x / box.length) * 100,
        pctY: (item.y / box.width) * 100,
        pctW: (item.w / box.length) * 100,
        pctH: (item.h / box.width) * 100
      }));
    }
  }

  // Robust Fallback (sequential packing with overlap starting from top-left)
  return products.map((p, i) => {
    const w = Math.max(3.0, p.length * 0.35);
    const h = Math.max(3.0, p.width * 0.35);
    const offset = 1.2 + i * 2.0;
    return {
      product: p,
      x: offset,
      y: offset,
      w,
      h,
      rotated: false,
      pctX: (offset / box.length) * 100,
      pctY: (offset / box.width) * 100,
      pctW: (w / box.length) * 100,
      pctH: (h / box.width) * 100
    };
  });
}

// Calculate scores for a placed box layout
function calculateScores(box, products, placedItems, occasion, budget) {
  if (!placedItems) return { efficiency: 0, spaceUtil: 0, aesthetic: 0, safety: 0, occasionMatch: 0, costScore: 0, finalScore: 0 };

  const margin = 1.2;
  const boxL = box.length;
  const boxW = box.width;

  // 1. Layout Footprint Efficiency %
  const totalProductArea = products.reduce((s, p) => s + (p.length * p.width), 0);
  const activeArea = (boxL - 2 * margin) * (boxW - 2 * margin);
  const efficiency = Math.min(100, Math.round((totalProductArea / activeArea) * 100));

  // 2. Space Volume Utilization %
  const totalProductVolume = products.reduce((s, p) => s + (p.length * p.width * p.height), 0);
  const spaceUtil = Math.min(100, Math.round((totalProductVolume / box.capacity) * 100));

  // 3. Aesthetic Score %
  let aesthetic = 80;
  const largest = [...placedItems].sort((a, b) => (b.w * b.h) - (a.w * a.h))[0];
  if (largest) {
    const lCenterX = largest.x + largest.w / 2;
    const lCenterY = largest.y + largest.h / 2;
    const distanceToCenter = Math.sqrt(Math.pow(lCenterX - boxL / 2, 2) + Math.pow(lCenterY - boxW / 2, 2));
    const maxPossibleDistance = Math.sqrt(Math.pow(boxL / 2, 2) + Math.pow(boxW / 2, 2));
    const centeringBonus = Math.round((1 - (distanceToCenter / maxPossibleDistance)) * 15);
    aesthetic += centeringBonus;
  }
  if (box.occasions.includes(occasion)) {
    aesthetic += 5;
  }
  aesthetic = Math.min(98, aesthetic);

  // 4. Product Safety Score %
  let safety = 100;
  const fragileCount = products.filter(p => p.fragile).length;
  if (fragileCount > 0) {
    for (const item of placedItems) {
      if (item.product.fragile) {
        // wall boundary proximity penalty
        const nearLeft = item.x < margin + 0.5;
        const nearRight = item.x + item.w > boxL - margin - 0.5;
        const nearTop = item.y < margin + 0.5;
        const nearBottom = item.y + item.h > boxW - margin - 0.5;
        if (nearLeft || nearRight || nearTop || nearBottom) {
          safety -= 10;
        }

        // distance to other products
        for (const other of placedItems) {
          if (other.product.id !== item.product.id) {
            const dx = Math.max(0, other.x - (item.x + item.w), item.x - (other.x + other.w));
            const dy = Math.max(0, other.y - (item.y + item.h), item.y - (other.y + other.h));
            const dist = Math.max(dx, dy);
            if (dist < 1.8) { 
              safety -= 15;
            }
          }
        }
      }
    }
  }
  safety = Math.max(50, safety);

  // 5. Occasion Match Score %
  const occasionMatch = box.occasions.includes(occasion) ? 98 : 55;

  // 6. Packaging Cost Score % (cheaper is higher, heavily penalized if exceeds budget)
  const totalProductPrice = products.reduce((s, p) => s + p.price, 0);
  const maxBoxCost = Math.max(...BOX_TEMPLATES.map(b => b.cost));
  let costScore = Math.round(100 - (box.cost / maxBoxCost) * 30);
  if (totalProductPrice + box.cost > budget) {
    costScore -= 40;
  }
  costScore = Math.max(10, Math.min(100, costScore));

  // 7. Weighted Final Score
  const finalScore = Math.round(
    (efficiency * 0.15) + 
    (spaceUtil * 0.15) + 
    (aesthetic * 0.20) + 
    (safety * 0.20) + 
    (occasionMatch * 0.15) +
    (costScore * 0.15)
  );

  return {
    efficiency,
    spaceUtil,
    aesthetic,
    safety,
    occasionMatch,
    costScore,
    finalScore
  };
}

// Generate filler recommendations
function getFillerRecommendation(spaceUtil, occasion) {
  if (spaceUtil >= 90) return "Fitted tightly. No divider or filler needed.";
  
  if (occasion === "wedding") {
    return "Fill remaining gaps with premium white paper crinkle filler and nest fresh baby-breath flowers around items.";
  }
  if (occasion === "corporate") {
    return "Apply corporate navy/gold dividers to lock items, completed with black shredded paper shred.";
  }
  if (occasion === "anniversary") {
    return "Surround items with deep-red silk petals and soft ivory tissue paper shreds.";
  }
  return "Fill empty spacing with natural wood-wool crinkle paper shreds to cushion items during shipping.";
}

// Generate a layout explanation for each of the 5 layouts
function getLayoutExplanation(styleId, boxName, spaceUtil, safety, aesthetic) {
  switch (styleId) {
    case "showcase":
      return `Premium Showcase: designed for maximum visual impact. It highlights the largest product in the center of the ${boxName} with a radial spacing layout, achieving an aesthetic score of ${aesthetic}%.`;
    case "symmetrical":
      return `Luxury Symmetrical: designed for balanced presentation. Items are bilaterally aligned along the left and right center axes of the box to create a premium, mirrored look (aesthetic score of ${aesthetic}%).`;
    case "space_utilization":
      return `Maximum Space Utilization: designed to minimize unused space. It tightly packs items into the box corners, resulting in an optimal space utilization score of ${spaceUtil}%.`;
    case "safe_shipping":
      return `Safe Shipping: designed for maximum product protection. Fragile products are centered and surrounded by non-fragile buffer items with double safety spacing, scoring a safety rating of ${safety}%.`;
    case "corporate":
      return `Corporate Executive: designed for professional gifting. Items are structured into clean, aligned rows and columns to reflect executive neatness and grid symmetry.`;
    default:
      return "";
  }
}

// Main recommendation export
export function generateRecommendations({ occasion, occasionTitle, products, budget = 5000, boxSize = "Medium" }) {
  const totalProductPrice = products.reduce((s, p) => s + p.price, 0);

  // 1. Evaluate all box templates. Compare all suitable boxes and choose the one with the highest overall score.
  const candidates = [];
  for (const box of BOX_TEMPLATES) {
    // Generate all 5 layout options for this candidate box
    const layouts = {
      showcase: packLayout(box, products, "showcase"),
      symmetrical: packLayout(box, products, "symmetrical"),
      space_utilization: packLayout(box, products, "space_utilization"),
      safe_shipping: packLayout(box, products, "safe_shipping"),
      corporate: packLayout(box, products, "corporate")
    };

    // Score each layout option
    const scores = {};
    let validLayoutsCount = 0;
    for (const style in layouts) {
      if (layouts[style]) {
        scores[style] = calculateScores(box, products, layouts[style], occasion, budget);
        validLayoutsCount++;
      }
    }

    if (validLayoutsCount === 5) {
      // Find the highest score among its layouts
      const maxScore = Math.max(...Object.values(scores).map(s => s.finalScore));
      candidates.push({
        box,
        layouts,
        scores,
        maxScore
      });
    }
  }

  let selectedCandidate = null;
  if (candidates.length === 0) {
    // Fallback: Pick the largest box template
    const largestBox = [...BOX_TEMPLATES].sort((a, b) => b.capacity - a.capacity)[0];
    const layouts = {
      showcase: packLayout(largestBox, products, "showcase"),
      symmetrical: packLayout(largestBox, products, "symmetrical"),
      space_utilization: packLayout(largestBox, products, "space_utilization"),
      safe_shipping: packLayout(largestBox, products, "safe_shipping"),
      corporate: packLayout(largestBox, products, "corporate")
    };
    const scores = {};
    for (const style in layouts) {
      scores[style] = calculateScores(largestBox, products, layouts[style], occasion, budget);
    }
    selectedCandidate = { box: largestBox, layouts, scores };
  } else {
    // Sort candidate boxes by their highest layout overall score descending
    candidates.sort((a, b) => b.maxScore - a.maxScore);
    selectedCandidate = candidates[0];
  }

  const { box, layouts, scores } = selectedCandidate;

  // 2. Generate the 5 layout configurations for the selected box
  const layoutStylesList = ["showcase", "symmetrical", "space_utilization", "safe_shipping", "corporate"];
  const options = layoutStylesList.map(style => {
    const layoutItems = layouts[style];
    const itemScores = scores[style] || calculateScores(box, products, layoutItems, occasion, budget);
    const filler = getFillerRecommendation(itemScores.spaceUtil, occasion);
    const ribbonColor = box.ribbonStyle.split(" ")[0] + " Ribbon";

    let name = "";
    let description = "";
    if (style === "showcase") {
      name = "Premium Showcase Layout";
      description = "Generous visual spacing spotlighting key items.";
    } else if (style === "symmetrical") {
      name = "Luxury Symmetrical Layout";
      description = "Balanced bilateral arrangement with equal visual weight.";
    } else if (style === "space_utilization") {
      name = "Maximum Space Utilization Layout";
      description = "Compact packing minimizing shifting and unused box volume.";
    } else if (style === "safe_shipping") {
      name = "Safe Shipping Layout";
      description = "Centering fragile products and adding double safety cushions.";
    } else if (style === "corporate") {
      name = "Corporate Executive Layout";
      description = "Structured rows and columns presenting items with executive neatness.";
    }

    return {
      id: style,
      name,
      description,
      box,
      items: layoutItems,
      scores: itemScores,
      ribbon: {
        color: box.ribbonStyle,
        hex: box.ribbonHex
      },
      packaging: box.style,
      filler,
      explanation: getLayoutExplanation(style, box.name, itemScores.spaceUtil, itemScores.safety, itemScores.aesthetic),
      instructions: [
        `Anchor placement inside the ${box.name} (${box.style}).`,
        `Fill the empty sections using: ${filler}`,
        `Wrap the exterior with a premium ${box.ribbonStyle} (${ribbonColor}).`,
        "Place the customized greeting card on the front-right overlay layer."
      ],
      matchScore: itemScores.finalScore
    };
  });

  // Sort layouts to identify the one with the highest match score as recommended
  const sortedOptions = [...options].sort((a, b) => b.matchScore - a.matchScore);
  const recommendedOption = sortedOptions[0];

  // The rest are alternatives
  const alternatives = options.filter(o => o.id !== recommendedOption.id);

  return {
    recommended: recommendedOption,
    alternatives,
    totalPrice: totalProductPrice,
    withinBudget: (totalProductPrice + box.cost) <= budget
  };
}

export const LAYOUT_STYLES = [
  { id: "showcase", name: "Premium Showcase Layout", description: "Generous visual spacing spotlighting key items." },
  { id: "symmetrical", name: "Luxury Symmetrical Layout", description: "Balanced bilateral arrangement with equal visual weight." },
  { id: "space_utilization", name: "Maximum Space Utilization Layout", description: "Compact packing minimizing shifting and box size." },
  { id: "safe_shipping", name: "Safe Shipping Layout", description: "Centering fragile products and adding double safety cushions." },
  { id: "corporate", name: "Corporate Executive Layout", description: "Structured rows and columns presenting items with executive neatness." }
];