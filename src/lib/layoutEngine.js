// AI Gift Box Layout Recommendation Engine

const LAYOUT_STYLES = [
  { id: "showcase", name: "Premium Showcase", description: "A top-down exhibition layout designed for premium visual impact, spacing items elegantly." },
  { id: "corporate", name: "Corporate Executive", description: "A highly structured, clean layout prioritizing alignment, symmetry, and corporate elegance." },
  { id: "romantic", name: "Romantic Elegance", description: "A soft, layered presentation with curved groupings designed for romantic gifts." },
  { id: "celebration", name: "Celebration Hamper", description: "A rich, packed grid layout that maximizes the visual volume of festive hampers." },
];

const RIBBONS = {
  birthday: { color: "Blush Pink", hex: "#f4a7b9" },
  anniversary: { color: "Deep Rose", hex: "#c94f6d" },
  graduation: { color: "Champagne Gold", hex: "#d4af7a" },
  wedding: { color: "Ivory Satin", hex: "#ece2d0" },
  festival: { color: "Crimson & Gold", hex: "#c0392b" },
  baby_shower: { color: "Powder Pink", hex: "#f8c8d8" },
  friendship: { color: "Coral", hex: "#f08080" },
  farewell: { color: "Dusty Lavender", hex: "#b39bc8" },
  corporate: { color: "Slate Silver", hex: "#9aa5b1" },
  just_because: { color: "Rose Gold", hex: "#cf9580" },
};

const PACKAGING = {
  low: "Kraft paper base with crinkle-cut shred filling and a matte finish lid",
  mid: "Pearl-white rigid box with blush tissue lining and satin ribbon wrap",
  high: "Velvet-lined luxury magnetic box with gold-foil trim and silk bow",
};

function scoreLayout(layoutId, { occasion, products, boxSize }) {
  let score = 70 + (products.length >= 3 && products.length <= 6 ? 8 : 2);
  const cats = new Set(products.map((p) => p.category));
  const sizes = products.map((p) => p.size);
  const hasLarge = sizes.includes("Large");
  const hasPremium = cats.has("Premium Gifts") || cats.has("Jewelry");

  if (layoutId === "showcase") {
    if (hasPremium) score += 12;
    if (["anniversary", "wedding", "corporate"].includes(occasion)) score += 6;
    if (boxSize === "Large") score += 4;
  }
  if (layoutId === "corporate") {
    if (occasion === "corporate") score += 15;
    if (products.length % 2 === 0) score += 6;
  }
  if (layoutId === "romantic") {
    if (["wedding", "anniversary", "birthday"].includes(occasion)) score += 14;
    if (cats.has("Flowers") || cats.has("Jewelry")) score += 6;
  }
  if (layoutId === "celebration") {
    if (["festival", "birthday", "just_because"].includes(occasion)) score += 14;
    if (products.length >= 4) score += 8;
  }
  return Math.min(98, score + ((products.length * 7 + layoutId.length) % 4));
}

function arrangeProducts(products) {
  const back = products.filter((p) => p.size === "Large");
  const center = products.filter((p) => p.size === "Medium");
  const front = products.filter((p) => p.size === "Small");
  return { back, center, front };
}

function buildInstructions(layout, { back, center, front }) {
  const steps = [];
  if (layout.id === "showcase") {
    steps.push("Arrange items with breathing space so each premium luxury gift reads as a highlighted featured piece.");
  }
  if (layout.id === "corporate") {
    steps.push("Align items in a clean, symmetrical parallel column grid to maintain formal corporate precision.");
  }
  if (layout.id === "romantic") {
    steps.push("Place the main romantic gift at the center with supporting items nested elegantly around it.");
  }
  if (layout.id === "celebration") {
    steps.push("Pack items side-by-side in a dense, parallel grid to build an abundant celebration hamper presentation.");
  }
  if (back.length) steps.push(`Anchor the back/center layer with ${back.map((p) => p.name).join(" and ")} for height and visual weight.`);
  if (center.length) steps.push(`Position ${center.map((p) => p.name).join(", ")} in the middle tier.`);
  if (front.length) steps.push(`Place ${front.map((p) => p.name).join(", ")} along the edges.`);
  steps.push("Fill gaps with realistic brown crinkle paper shred and finish with the greeting card.");
  return steps;
}

function buildExplanation(layout, occasion, occasionTitle, products, arrangement) {
  const focal = arrangement.back[0] || arrangement.center[0] || products[0];
  const supports = products.filter((p) => p.id !== focal.id).slice(0, 2).map((p) => p.name);
  const occasionNote = {
    anniversary: "elegant, romantic presentations suit anniversary gifting",
    wedding: "timeless elegance is essential for wedding gifts",
    corporate: "symmetry and restraint convey professionalism",
    festival: "abundant, colorful arrangements amplify festive energy",
  }[occasion] || `it complements the ${occasionTitle.toLowerCase()} mood`;
  return `This arrangement uses ${layout.name} because ${focal.name.toLowerCase()} serves as the primary focal point, while ${supports.length ? supports.join(" and ").toLowerCase() : "the supporting items"} balance the front layer for visual appeal. The style was prioritized since ${occasionNote}, and the size mix of your selection (${arrangement.back.length} large, ${arrangement.center.length} medium, ${arrangement.front.length} small) fits this layered structure naturally.`;
}

export function generateRecommendations({ occasion, occasionTitle, products, budget, boxSize }) {
  const total = products.reduce((s, p) => s + p.price, 0);
  const packaging = total > 5000 || budget > 6000 ? PACKAGING.high : total > 2000 ? PACKAGING.mid : PACKAGING.low;
  const ribbon = RIBBONS[occasion] || RIBBONS.just_because;
  const arrangement = arrangeProducts(products);

  const ranked = LAYOUT_STYLES.map((layout) => ({
    ...layout,
    matchScore: scoreLayout(layout.id, { occasion, products, boxSize }),
    ribbon,
    packaging,
    arrangement,
    instructions: buildInstructions(layout, arrangement),
    explanation: buildExplanation(layout, occasion, occasionTitle, products, arrangement),
  })).sort((a, b) => b.matchScore - a.matchScore);

  return { recommended: ranked[0], alternatives: ranked.slice(1, 3), totalPrice: total, withinBudget: total <= budget };
}

export { LAYOUT_STYLES };