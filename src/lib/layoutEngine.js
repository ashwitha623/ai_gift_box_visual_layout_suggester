import { BOX_TEMPLATES } from "./giftdata.js";

// Helper to check classification of base products (flat, wide, non-fragile)
function isEligibleBase(product) {
  const area = product.length * product.width;
  const isFlat = product.height <= 6.0;
  const isWide = area >= 140;
  return isFlat && isWide && !product.fragile;
}

// Helper to check classification of stackable products (light, small)
function isStackable(product) {
  const area = product.length * product.width;
  return area <= 100 && (product.weight || 0) <= 350;
}

// Helper to check boundaries and overlaps (layer-aware)
function isValidPlacement(x, y, w, h, boxL, boxW, margin, gap, placed, isStacked = false, stackedOnId = null) {
  if (x < margin - 0.05 || y < margin - 0.05 || x + w > boxL - margin + 0.05 || y + h > boxW - margin + 0.05) {
    return false;
  }
  for (const other of placed) {
    // If this is a stacked item and we are checking against its base item, ignore the overlap
    if (isStacked && other.product.id === stackedOnId) {
      continue;
    }

    const otherLayer = other.stackedOn || null;
    const thisLayer = stackedOnId || null;

    if (otherLayer !== thisLayer) {
      // Different vertical layers -> no 2D collision
      continue;
    }

    const dx = Math.max(0, other.x - (x + w), x - (other.x + other.w));
    const dy = Math.max(0, other.y - (y + h), y - (other.y + other.h));
    const dist = Math.max(dx, dy);
    if (dist < gap - 0.05) {
      return false;
    }
  }
  return true;
}

// Helper to attempt vertical stacking of a product onto a placed base item
function tryStackProduct(product, scale, box, margin, gap, placed) {
  if (!isStackable(product)) return null;

  for (const baseItem of placed) {
    if (baseItem.stacked) continue; // cannot stack on an already stacked item

    if (isEligibleBase(baseItem.product)) {
      // Check height constraint
      if (baseItem.product.height + product.height > box.height) continue;

      const w = product.length * scale;
      const h = product.width * scale;

      // Try normal orientation (centered on base)
      let px = baseItem.x + (baseItem.w - w) / 2;
      let py = baseItem.y + (baseItem.h - h) / 2;
      if (w <= baseItem.w && h <= baseItem.h &&
          isValidPlacement(px, py, w, h, box.length, box.width, margin, gap, placed, true, baseItem.product.id)) {
        return {
          product,
          x: px,
          y: py,
          w,
          h,
          rotated: false,
          stacked: true,
          stackedOn: baseItem.product.id,
          zOffset: baseItem.product.height
        };
      }

      // Try rotated orientation
      const rotW = h;
      const rotH = w;
      px = baseItem.x + (baseItem.w - rotW) / 2;
      py = baseItem.y + (baseItem.h - rotH) / 2;
      if (rotW <= baseItem.w && rotH <= baseItem.h &&
          isValidPlacement(px, py, rotW, rotH, box.length, box.width, margin, gap, placed, true, baseItem.product.id)) {
        return {
          product,
          x: px,
          y: py,
          w: rotW,
          h: rotH,
          rotated: true,
          stacked: true,
          stackedOn: baseItem.product.id,
          zOffset: baseItem.product.height
        };
      }
    }
  }
  return null;
}


// 1. Premium Showcase: Center largest item, place others radially
function packShowcase(box, products, scale, margin, gap, template) {
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
      { w: normalW, h: normalH, rotated: false }
    ];
    if (template?.allowRotation !== false) {
      orientations.push({ w: normalH, h: normalW, rotated: true });
    }

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
      // Try to stack as a fallback
      const stackedItem = tryStackProduct(p, scale, box, margin, gap, placed);
      if (stackedItem) {
        placed.push(stackedItem);
        placedOk = true;
      }
    }

    if (!placedOk) {
      return null; // Failed to pack
    }

    if (placed[placed.length - 1].product.id !== p.id) {
      placed.push({ product: p, x: bestX, y: bestY, w: bestW, h: bestH, rotated: bestRotated });
    }
  }

  return placed;
}

// 2. Luxury Symmetrical: Mirror left/right sides
function packSymmetrical(box, products, scale, margin, gap, template) {
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
        { w, h, rotated: false }
      ];
      if (template?.allowRotation !== false) {
        orients.push({ w: h, h: w, rotated: true });
      }

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

      if (!orientationOk) {
        const stackedItem = tryStackProduct(p, scale, box, margin, gap, placed);
        if (stackedItem) {
          placed.push(stackedItem);
          currentY += gap;
          orientationOk = true;
        }
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
function packSpaceUtil(box, products, scale, margin, gap, template) {
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
        { w: p.length * scale, h: p.width * scale, rotated: false }
      ];
      if (template?.allowRotation !== false) {
        orients.push({ w: p.width * scale, h: p.length * scale, rotated: true });
      }

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
      const stackedItem = tryStackProduct(p, scale, box, margin, gap, placed);
      if (stackedItem) {
        placed.push(stackedItem);
      } else {
        return null;
      }
    } else {
      const item = { product: p, x: bestX, y: bestY, w: bestW, h: bestH, rotated: bestRotated };
      placed.push(item);

      // Add candidate points
      candidatePoints.push({ x: item.x + item.w + gap, y: item.y });
      candidatePoints.push({ x: item.x, y: item.y + item.h + gap });
    }
  }

  return placed;
}

// 4. Safe Shipping: Middle-fragile, edge-heavy, double safety margins
function packSafeShipping(box, products, scale, originalMargin, originalGap, template) {
  const boxL = box.length;
  const boxW = box.width;
  const placed = [];
  const cx = boxL / 2;
  const cy = boxW / 2;

  // Use increased margin and gap parameters for extra safety
  const margin = 2.0; 
  const gap = template?.minSpacing !== undefined ? template.minSpacing : 1.8;

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
        { w: p.length * scale, h: p.width * scale, rotated: false }
      ];
      if (template?.allowRotation !== false) {
        orients.push({ w: p.width * scale, h: p.length * scale, rotated: true });
      }

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

      if (!foundFallback) {
        const stackedItem = tryStackProduct(p, scale, box, margin, gap, placed);
        if (stackedItem) {
          placed.push(stackedItem);
        } else {
          return null;
        }
      } else {
        const item = { product: p, x: bestX, y: bestY, w: bestW, h: bestH, rotated: bestRotated };
        placed.push(item);

        // Expand candidate points
        candidatePoints.push({ x: item.x + item.w + gap, y: item.y, origin: "edge" });
        candidatePoints.push({ x: item.x, y: item.y + item.h + gap, origin: "edge" });
      }
    }
  }

  return placed;
}

// 5. Corporate Executive: Structured grid of rows and columns
function packCorporate(box, products, scale, margin, gap, template) {
  const boxL = box.length;
  const boxW = box.width;
  const placed = [];

  // Sort by height descending to maintain neat rows
  const sorted = [...products].sort((a, b) => b.width - a.width);

  let currentY = margin;
  let currentX = margin;
  let rowHeight = 0;

  for (const p of sorted) {
    const orients = [
      { w: p.length * scale, h: p.width * scale, rotated: false }
    ];
    if (template?.allowRotation !== false) {
      orients.push({ w: p.width * scale, h: p.length * scale, rotated: true });
    }

    let placedOk = false;
    for (const orient of orients) {
      let testX = currentX;
      let testY = currentY;
      let testRowHeight = rowHeight;

      // Wrap to next row if it exceeds box boundary
      if (testX + orient.w > boxL - margin) {
        testX = margin;
        testY = currentY + rowHeight + gap;
        testRowHeight = 0;
      }

      // Check height bounds
      if (testY + orient.h > boxW - margin) {
        continue;
      }

      if (isValidPlacement(testX, testY, orient.w, orient.h, boxL, boxW, margin, gap, placed)) {
        placed.push({ product: p, x: testX, y: testY, w: orient.w, h: orient.h, rotated: orient.rotated });
        currentX = testX + orient.w + gap;
        rowHeight = Math.max(testRowHeight, orient.h);
        currentY = testY;
        placedOk = true;
        break;
      } else {
        // Try nudging horizontally
        let nudged = false;
        for (let nx = testX; nx <= boxL - margin - orient.w; nx += 0.2) {
          if (isValidPlacement(nx, testY, orient.w, orient.h, boxL, boxW, margin, gap, placed)) {
            placed.push({ product: p, x: nx, y: testY, w: orient.w, h: orient.h, rotated: orient.rotated });
            currentX = nx + orient.w + gap;
            rowHeight = Math.max(testRowHeight, orient.h);
            currentY = testY;
            nudged = true;
            placedOk = true;
            break;
          }
        }
        if (nudged) break;
      }
    }

    if (!placedOk) {
      const stackedItem = tryStackProduct(p, scale, box, margin, gap, placed);
      if (stackedItem) {
        placed.push(stackedItem);
        placedOk = true;
      }
    }

    if (!placedOk) {
      return null; // Reject layout if product cannot fit
    }
  }

  return placed;
}

// Main coordinator wrapper that scales products to fit
function packLayout(box, products, layoutStyle, template) {
  // Enforce strict physical fit validation at actual 1:1 scale
  const scales = [1.0];
  const margin = 1.2;
  const gap = template?.minSpacing !== undefined ? template.minSpacing : (layoutStyle === "safe_shipping" ? 1.8 : 0.6);
  const boxCapacity = box.capacity !== undefined ? box.capacity : (box.volume !== undefined ? box.volume : (box.length * box.width * box.height));

  // Validate height constraints
  for (const p of products) {
    if (p.height > box.height) {
      return null; // Reject immediately if a product is taller than the box
    }
  }

  // Validate weight capacity limits
  const totalWeight = products.reduce((sum, p) => sum + (p.weight || 0), 0);
  if (box.maxWeight && totalWeight > box.maxWeight) {
    return null; // Reject if total products weight exceeds box capacity
  }

  // Validate total volume capacity
  const totalProductVolume = products.reduce((sum, p) => sum + (p.length * p.width * p.height), 0);
  if (totalProductVolume > boxCapacity) {
    return null; // Reject if volume of products exceeds box capacity
  }

  for (const scale of scales) {
    let result = null;
    if (layoutStyle === "showcase") {
      result = packShowcase(box, products, scale, margin, gap, template);
    } else if (layoutStyle === "symmetrical") {
      result = packSymmetrical(box, products, scale, margin, gap, template);
    } else if (layoutStyle === "space_utilization") {
      result = packSpaceUtil(box, products, scale, margin, gap, template);
    } else if (layoutStyle === "safe_shipping") {
      result = packSafeShipping(box, products, scale, margin, gap, template);
    } else if (layoutStyle === "corporate") {
      result = packCorporate(box, products, scale, margin, gap, template);
    }

    if (result) {
      // Convert layout absolute coordinates to percentages for rendering
      return result.map((item, idx) => {
        const seed = (item.product.id * 7 + idx * 13) % 31; // 0 to 30
        const rotation = seed - 15; // Strictly clamped between -15 and +15 degrees
        const cx = item.x + item.w / 2;
        const cy = item.y + item.h / 2;
        return {
          ...item,
          rotation,
          centerX: cx,
          centerY: cy,
          pctX: (item.x / box.length) * 100,
          pctY: (item.y / box.width) * 100,
          pctW: (item.w / box.length) * 100,
          pctH: (item.h / box.width) * 100,
          pctCenterX: (cx / box.length) * 100,
          pctCenterY: (cy / box.width) * 100,
          stacked: item.stacked || false,
          stackedOn: item.stackedOn || null,
          zOffset: item.zOffset || 0
        };
      });
    }
  }

  // Reject layout if actual physical placement is impossible
  return null;
}

// Calculate scores for a placed box layout
function calculateScores(box, products, placedItems, occasion, budget, boxTemplates, template) {
  if (!placedItems) return { efficiency: 0, spaceUtil: 0, aesthetic: 0, safety: 0, occasionMatch: 0, costScore: 0, finalScore: 0 };

  const margin = 1.2;
  const boxL = box.length;
  const boxW = box.width;
  const boxCapacity = box.capacity !== undefined ? box.capacity : (box.volume !== undefined ? box.volume : (box.length * box.width * box.height));

  // 1. Layout Footprint Efficiency %
  const totalProductArea = products.reduce((s, p) => s + (p.length * p.width), 0);
  const activeArea = (boxL - 2 * margin) * (boxW - 2 * margin);
  const efficiency = Math.min(100, Math.round((totalProductArea / activeArea) * 100));

  // 2. Space Volume Utilization %
  const totalProductVolume = products.reduce((s, p) => s + (p.length * p.width * p.height), 0);
  const spaceUtil = Math.min(100, Math.round((totalProductVolume / boxCapacity) * 100));

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
            const otherLayer = other.stackedOn || null;
            const thisLayer = item.stackedOn || null;
            if (otherLayer !== thisLayer) {
              continue; // Different layers -> skip proximity safety penalty
            }
            const dx = Math.max(0, other.x - (item.x + item.w), item.x - (other.x + other.w));
            const dy = Math.max(0, other.y - (item.y + item.h), item.y - (other.y + other.h));
            const dist = Math.max(dx, dy);
            const fBuffer = template?.fragileBuffer !== undefined ? template.fragileBuffer : 1.5;
            if (dist < fBuffer + 0.3) { 
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
  const boxesForCost = boxTemplates && boxTemplates.length > 0 ? boxTemplates : BOX_TEMPLATES;
  const maxBoxCost = Math.max(...boxesForCost.map(b => b.cost), 1);
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

// Helper to select the optimal box for a layout based on dimensions, capacity, weight, cost, and layout scores
function selectBoxForLayout(products, layoutStyle, boxTemplates, budget, occasion, template) {
  const boxes = (boxTemplates && boxTemplates.length > 0 ? boxTemplates : BOX_TEMPLATES).map(b => ({
    ...b,
    capacity: b.capacity !== undefined ? b.capacity : (b.volume !== undefined ? b.volume : (b.length * b.width * b.height))
  }));
  const fittingBoxes = [];

  for (const box of boxes) {
    const packedItems = packLayout(box, products, layoutStyle, template);
    if (packedItems) {
      const scores = calculateScores(box, products, packedItems, occasion, budget, boxTemplates, template);
      fittingBoxes.push({ box, items: packedItems, scores });
    }
  }

  if (fittingBoxes.length === 0) {
    return null; // Reject if no box can physically accommodate the products
  }

  // Dynamic Box Recommendation Ranking:
  // 1. Box volume capacity (smallest first to maximize space efficiency)
  // 2. Space utilization % (highest first)
  // 3. Packaging cost (lowest first)
  // 4. Product safety score (highest first)
  // 5. Aesthetic score (highest first)
  fittingBoxes.sort((a, b) => {
    if (a.box.capacity !== b.box.capacity) {
      return a.box.capacity - b.box.capacity;
    }
    if (a.scores.spaceUtil !== b.scores.spaceUtil) {
      return b.scores.spaceUtil - a.scores.spaceUtil;
    }
    if (a.box.cost !== b.box.cost) {
      return a.box.cost - b.box.cost;
    }
    if (a.scores.safety !== b.scores.safety) {
      return b.scores.safety - a.scores.safety;
    }
    return b.scores.aesthetic - a.scores.aesthetic;
  });

  return fittingBoxes[0]; // Return the optimal (smallest suitable) box configuration
}

// Main recommendation export
export function generateRecommendations({ occasion, occasionTitle, products, budget = 5000, boxSize = "Medium", boxTemplates, layoutTemplates }) {
  const boxes = (boxTemplates && boxTemplates.length > 0 ? boxTemplates : BOX_TEMPLATES).map(b => ({
    ...b,
    capacity: b.capacity !== undefined ? b.capacity : (b.volume !== undefined ? b.volume : (b.length * b.width * b.height))
  }));
  const totalProductPrice = products.reduce((s, p) => s + p.price, 0);

  const layoutStylesList = ["showcase", "symmetrical", "space_utilization", "safe_shipping", "corporate"];
  const options = layoutStylesList.map(style => {
    const template = layoutTemplates?.find(t => t.id === style) || {
      minSpacing: style === "safe_shipping" ? 1.8 : 0.6,
      fragileBuffer: 1.5,
      allowRotation: true
    };

    const match = selectBoxForLayout(products, style, boxes, budget, occasion, template);
    if (!match) return null;

    const { box, items, scores } = match;
    const filler = getFillerRecommendation(scores.spaceUtil, occasion);
    const ribbonColor = box.ribbonStyle ? box.ribbonStyle.split(" ")[0] + " Ribbon" : "Gold Ribbon";

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
      items,
      scores,
      template,
      ribbon: {
        color: box.ribbonStyle || "Gold Satin Ribbon",
        hex: box.ribbonHex || "#D4AF37"
      },
      packaging: box.style || "Classic Gold Foil",
      filler,
      explanation: getLayoutExplanation(style, box.name, scores.spaceUtil, scores.safety, scores.aesthetic),
      instructions: [
        `Anchor placement inside the ${box.name} (${box.style || "Classic Gold Foil"}).`,
        `Fill the empty sections using: ${filler}`,
        `Wrap the exterior with a premium ${box.ribbonStyle || "Gold Satin Ribbon"}.`,
        "Place the customized greeting card on the front-right overlay layer."
      ],
      matchScore: scores.finalScore
    };
  }).filter(Boolean);

  // If no layouts fit, return a failure indicator
  if (options.length === 0) {
    return {
      success: false,
      error: "Selected products exceed available box capacities. Please reduce items or create a larger box configuration."
    };
  }

  // Sort layouts to identify the one with the highest match score as recommended
  const sortedOptions = [...options].sort((a, b) => b.matchScore - a.matchScore);
  const recommendedOption = sortedOptions[0];

  // The rest are alternatives
  const alternatives = options.filter(o => o.id !== recommendedOption.id);

  return {
    success: true,
    recommended: recommendedOption,
    alternatives,
    totalPrice: totalProductPrice,
    withinBudget: (totalProductPrice + recommendedOption.box.cost) <= budget
  };
}

export const LAYOUT_STYLES = [
  { id: "showcase", name: "Premium Showcase Layout", description: "Generous visual spacing spotlighting key items." },
  { id: "symmetrical", name: "Luxury Symmetrical Layout", description: "Balanced bilateral arrangement with equal visual weight." },
  { id: "space_utilization", name: "Maximum Space Utilization Layout", description: "Compact packing minimizing shifting and box size." },
  { id: "safe_shipping", name: "Safe Shipping Layout", description: "Centering fragile products and adding double safety cushions." },
  { id: "corporate", name: "Corporate Executive Layout", description: "Structured rows and columns presenting items with executive neatness." }
];