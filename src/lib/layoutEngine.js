import { BOX_TEMPLATES, formatINR } from "./giftdata.js";

// 2D Packing Optimization Algorithm
function runPack(box, products, layoutStyle, useCenterOption) {
  const margin = 1.2; // Border safety margin (cm) from walls
  const boxL = box.length;
  const boxW = box.width;

  // Sort products by footprint area (Length * Width) descending (Place largest items first)
  const sorted = [...products].sort((a, b) => (b.length * b.width) - (a.length * a.width));

  const placed = [];
  
  // Initialize candidate points
  let candidatePoints = [{ x: margin, y: margin }];
  
  if (useCenterOption) {
    candidatePoints.push({ isCenterOption: true });
  }

  for (const p of sorted) {
    let bestPoint = null;
    let bestOrient = null;
    let bestX = null;
    let bestY = null;
    let bestCost = Infinity;

    // Filter duplicate or out-of-bound candidate points
    candidatePoints = candidatePoints.filter(pt => pt.isCenterOption || (pt.x < boxL - margin && pt.y < boxW - margin));

    for (const pt of candidatePoints) {
      // Try both normal and rotated (90 deg) orientations
      const orients = [
        { w: p.length, h: p.width, rotated: false },
        { w: p.width, h: p.length, rotated: true }
      ];

      for (const orient of orients) {
        let px1, py1;

        if (pt.isCenterOption) {
          if (placed.length > 0) continue; // Center starting option is only for the first (largest) item
          px1 = (boxL - orient.w) / 2;
          py1 = (boxW - orient.h) / 2;
        } else if (pt.parent) {
          const requiredGap = (p.fragile || pt.parent.product.fragile) ? 2.0 : 0.6;
          if (pt.relation === "right") {
            px1 = pt.parent.x + pt.parent.w + requiredGap;
            py1 = pt.y;
          } else if (pt.relation === "below") {
            px1 = pt.x;
            py1 = pt.parent.y + pt.parent.h + requiredGap;
          } else if (pt.relation === "left") {
            px1 = pt.parent.x - requiredGap - orient.w;
            py1 = pt.y;
          } else if (pt.relation === "above") {
            px1 = pt.x;
            py1 = pt.parent.y - requiredGap - orient.h;
          }
        } else {
          px1 = pt.x;
          py1 = pt.y;
        }

        const px2 = px1 + orient.w;
        const py2 = py1 + orient.h;

        // 1. Boundary check: does it fit inside box margin limits?
        if (px1 < margin || py1 < margin || px2 > boxL - margin || py2 > boxW - margin) {
          continue;
        }

        // 2. Overlap and Safety Spacing checks
        let valid = true;
        for (const other of placed) {
          const dx = Math.max(0, other.x - px2, px1 - (other.x + other.w));
          const dy = Math.max(0, other.y - py2, py1 - (other.y + other.h));
          const dist = Math.max(dx, dy); // Chebyshev distance representing rectangular padding gap

          // Safety gap check: 2.0cm if either is fragile, 0.6cm otherwise
          const requiredGap = (p.fragile || other.product.fragile) ? 2.0 : 0.6;
          if (dist < requiredGap - 0.01) {
            valid = false;
            break;
          }
        }

        if (!valid) continue;

        // 3. Score placement coordinates based on layout style cost function
        let cost = 0;
        if (layoutStyle === "space_utilization") {
          // Corner-packing (top-left priority)
          cost = px1 * 0.7 + py1 * 1.3;
        } else if (layoutStyle === "showcase") {
          // Centered showcase: minimize distance from center of product to center of box
          const centerX = px1 + orient.w / 2;
          const centerY = py1 + orient.h / 2;
          const boxCenterX = boxL / 2;
          const boxCenterY = boxW / 2;
          cost = Math.pow(centerX - boxCenterX, 2) + Math.pow(centerY - boxCenterY, 2);
        } else {
          // Recommended: Focal item in center, others nested nicely around
          if (placed.length === 0) {
            // First (largest) item: center it
            const centerX = px1 + orient.w / 2;
            const centerY = py1 + orient.h / 2;
            const boxCenterX = boxL / 2;
            const boxCenterY = boxW / 2;
            cost = Math.pow(centerX - boxCenterX, 2) + Math.pow(centerY - boxCenterY, 2);
          } else {
            // Other items: pack tightly around
            cost = px1 + py1;
          }
        }

        if (cost < bestCost) {
          bestCost = cost;
          bestPoint = pt;
          bestOrient = orient;
          bestX = px1;
          bestY = py1;
        }
      }
    }

    if (!bestPoint) {
      // Cannot fit all products in this box template
      return null;
    }

    // Place product
    const placedItem = {
      product: p,
      x: bestX,
      y: bestY,
      w: bestOrient.w,
      h: bestOrient.h,
      rotated: bestOrient.rotated
    };
    placed.push(placedItem);

    // Add new candidate points (corner packing heuristics in all 4 directions if not space utilization)
    candidatePoints.push({ x: placedItem.x + placedItem.w, y: placedItem.y, parent: placedItem, relation: "right" });
    candidatePoints.push({ x: placedItem.x, y: placedItem.y + placedItem.h, parent: placedItem, relation: "below" });
    
    if (layoutStyle !== "space_utilization") {
      candidatePoints.push({ x: placedItem.x, y: placedItem.y, parent: placedItem, relation: "left" });
      candidatePoints.push({ x: placedItem.x, y: placedItem.y, parent: placedItem, relation: "above" });
    }
  }

  // Convert absolute cm coordinates to percentages relative to box dimensions
  return placed.map(item => ({
    ...item,
    pctX: (item.x / boxL) * 100,
    pctY: (item.y / boxW) * 100,
    pctW: (item.w / boxL) * 100,
    pctH: (item.h / boxW) * 100
  }));
}

function packLayout(box, products, layoutStyle) {
  if (layoutStyle === "recommended" || layoutStyle === "showcase") {
    const centeredResult = runPack(box, products, layoutStyle, true);
    if (centeredResult) return centeredResult;
  }
  return runPack(box, products, layoutStyle, false);
}

// Calculate scores for a placed box layout
function calculateScores(box, products, placedItems, occasion) {
  if (!placedItems) return { efficiency: 0, spaceUtil: 0, aesthetic: 0, safety: 0, occasionMatch: 0, finalScore: 0 };

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
  // Center alignment bonus for the largest product
  const largest = [...placedItems].sort((a, b) => (b.w * b.h) - (a.w * a.h))[0];
  if (largest) {
    const lCenterX = largest.x + largest.w / 2;
    const lCenterY = largest.y + largest.h / 2;
    const distanceToCenter = Math.sqrt(Math.pow(lCenterX - boxL / 2, 2) + Math.pow(lCenterY - boxW / 2, 2));
    const maxPossibleDistance = Math.sqrt(Math.pow(boxL / 2, 2) + Math.pow(boxW / 2, 2));
    const centeringBonus = Math.round((1 - (distanceToCenter / maxPossibleDistance)) * 15);
    aesthetic += centeringBonus;
  }
  // Occasion aesthetics bonus
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
            if (dist < 2.0) { // fragile items need at least 2.0cm buffer
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

  // 6. Weighted Final Score
  const finalScore = Math.round(
    (efficiency * 0.15) + 
    (spaceUtil * 0.20) + 
    (aesthetic * 0.25) + 
    (safety * 0.25) + 
    (occasionMatch * 0.15)
  );

  return {
    efficiency,
    spaceUtil,
    aesthetic,
    safety,
    occasionMatch,
    finalScore
  };
}

// Generate fill recommendations for remaining space
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

// Build human-friendly dynamic explanation text
function buildExplanation(box, products, scores, occasion) {
  const fragileItems = products.filter(p => p.fragile).map(p => p.name);
  const fragileText = fragileItems.length > 0
    ? ` securely shielding fragile items (${fragileItems.join(", ")}) with buffer zones,`
    : "";

  return `The AI selected the ${box.name} (${box.length}x${box.width}cm) as the optimal match. It packs all selected items with a volume space utilization of ${scores.spaceUtil}%. By${fragileText} organizing layouts according to ${occasion.toUpperCase()} rules, it achieves an aesthetic balance score of ${scores.aesthetic}% and an overall safety score of ${scores.safety}%.`;
}

// Main recommendation export
export function generateRecommendations({ occasion, occasionTitle, products, budget, boxSize }) {
  const totalProductPrice = products.reduce((s, p) => s + p.price, 0);

  // 1. Evaluate all box templates
  const candidates = [];
  for (const box of BOX_TEMPLATES) {
    // 2D packing for each layout style
    const recommendedLayout = packLayout(box, products, "recommended");
    const showcaseLayout = packLayout(box, products, "showcase");
    const utilLayout = packLayout(box, products, "space_utilization");

    if (recommendedLayout) {
      candidates.push({
        box,
        layouts: {
          recommended: recommendedLayout,
          showcase: showcaseLayout || recommendedLayout, // fallback if showcase fails
          space_utilization: utilLayout || recommendedLayout // fallback if util fails
        }
      });
    }
  }

  // Fallback: If no box template fits, force pack on the largest box template
  let selectedCandidate = null;
  if (candidates.length === 0) {
    const largestBox = [...BOX_TEMPLATES].sort((a, b) => b.capacity - a.capacity)[0];
    const recommendedLayout = packLayout(largestBox, products, "recommended") || [];
    selectedCandidate = {
      box: largestBox,
      layouts: {
        recommended: recommendedLayout,
        showcase: packLayout(largestBox, products, "showcase") || recommendedLayout,
        space_utilization: packLayout(largestBox, products, "space_utilization") || recommendedLayout
      }
    };
  } else {
    // Score candidate boxes based on occasion match, price/budget fit, and utilization
    const scoredCandidates = candidates.map(c => {
      const recScores = calculateScores(c.box, products, c.layouts.recommended, occasion);
      // Cost penalty: we prefer box sizes that fit our budget well
      const withinBudget = (totalProductPrice + c.box.cost) <= budget;
      let costScore = withinBudget ? 100 : 50;
      
      const totalScore = recScores.finalScore * 0.8 + costScore * 0.2;
      return { ...c, totalScore, scores: recScores };
    });

    // Sort by total score descending
    scoredCandidates.sort((a, b) => b.totalScore - a.totalScore);
    selectedCandidate = scoredCandidates[0];
  }

  const { box, layouts } = selectedCandidate;

  // 2. Generate the 3 layouts configurations
  const layoutStylesList = ["recommended", "showcase", "space_utilization"];
  const options = layoutStylesList.map(style => {
    const layoutItems = layouts[style];
    const scores = calculateScores(box, products, layoutItems, occasion);
    const filler = getFillerRecommendation(scores.spaceUtil, occasion);
    
    // Ribbon styling selection
    const ribbonColor = box.ribbonStyle.split(" ")[0] + " Ribbon";

    // Style description
    let styleName = "Recommended Layout";
    let styleDesc = "Focal center placement balancing spacing, weight, and visual alignment.";
    if (style === "showcase") {
      styleName = "Premium Showcase Layout";
      styleDesc = "Featured top-down showcase layout spacing items generously for high-value presentation.";
    } else if (style === "space_utilization") {
      styleName = "Maximum Space Utilization Layout";
      styleDesc = "Compact layout utilizing every corner of the box footprint to reduce container volume.";
    }

    return {
      id: style,
      name: styleName,
      description: styleDesc,
      box,
      items: layoutItems,
      scores,
      ribbon: {
        color: box.ribbonStyle,
        hex: box.ribbonHex
      },
      packaging: box.style,
      filler,
      explanation: buildExplanation(box, products, scores, occasion),
      instructions: [
        `Anchor placement inside the ${box.name} (${box.style}).`,
        `Fill the empty sections using: ${filler}`,
        `Wrap the exterior with a premium ${box.ribbonStyle} (${ribbonColor}).`,
        "Place the customized greeting card on the front-right overlay layer."
      ],
      matchScore: scores.finalScore
    };
  });

  const recommendedOption = options.find(o => o.id === "recommended");
  const showcaseOption = options.find(o => o.id === "showcase");
  const spaceUtilOption = options.find(o => o.id === "space_utilization");

  // Alternatives are the other 2 options
  const alternatives = options.filter(o => o.id !== "recommended");

  return {
    recommended: recommendedOption,
    alternatives,
    totalPrice: totalProductPrice,
    withinBudget: (totalProductPrice + box.cost) <= budget
  };
}

export const LAYOUT_STYLES = [
  { id: "recommended", name: "Recommended Layout", description: "Balanced focal arrangement prioritizing safety and symmetry." },
  { id: "showcase", name: "Premium Showcase Layout", description: "Generous visual spacing spotlighting key items." },
  { id: "space_utilization", name: "Maximum Space Utilization Layout", description: "Compact packing minimizing shifting and size." }
];