const express = require("express");
const router = express.Router();
const { Product } = require("../models");

// 1. AI Gift Recommendation Assistant
router.post("/ai/recommend", async (req, res) => {
  try {
    const { occasion, budget, relationship, preferences } = req.body;
    const numBudget = parseInt(budget) || 5000;
    
    // Fetch all products from database
    const products = await Product.findAll();
    
    // Categorize occasion matches
    let occasionCategories = [];
    if (occasion === "birthday") {
      occasionCategories = ["Soft Toys", "Chocolates", "Jewelry", "Lifestyle Gifts"];
    } else if (occasion === "corporate") {
      occasionCategories = ["Corporate Gifts", "Lifestyle Gifts", "Chocolates"];
    } else if (occasion === "anniversary" || occasion === "wedding" || relationship === "romantic") {
      occasionCategories = ["Jewelry", "Flowers", "Premium Gifts", "Chocolates"];
    } else {
      occasionCategories = ["Chocolates", "Lifestyle Gifts", "Personalized Gifts", "Flowers"];
    }

    // Filter products matching occasion categories
    let pool = products.filter(p => occasionCategories.includes(p.category));
    if (pool.length === 0) {
      pool = products; // Fallback to all products
    }

    // Shuffle pool to give organic recommendations
    pool.sort(() => 0.5 - Math.random());

    // Search for a combination of up to 3 items that maximizes the total price under the budget
    let selectedProducts = [];
    let currentSum = 0;
    const n = pool.length;

    for (let i = 0; i < n; i++) {
      const p1 = pool[i];
      if (p1.price <= numBudget) {
        if (p1.price > currentSum) {
          selectedProducts = [p1];
          currentSum = p1.price;
        }
        for (let j = i + 1; j < n; j++) {
          const p2 = pool[j];
          if (p1.price + p2.price <= numBudget) {
            if (p1.price + p2.price > currentSum) {
              selectedProducts = [p1, p2];
              currentSum = p1.price + p2.price;
            }
            for (let k = j + 1; k < n; k++) {
              const p3 = pool[k];
              const combSum = p1.price + p2.price + p3.price;
              if (combSum <= numBudget) {
                if (combSum > currentSum) {
                  selectedProducts = [p1, p2, p3];
                  currentSum = combSum;
                }
              }
            }
          }
        }
      }
    }

    // If nothing fit because budget is too low, pick the single cheapest item
    if (selectedProducts.length === 0 && products.length > 0) {
      const cheapest = [...products].sort((a, b) => a.price - b.price)[0];
      selectedProducts.push(cheapest);
      currentSum = cheapest.price;
    }

    const suggestedGifts = selectedProducts.map(p => p.name);
    
    // Styling themes mapping
    let suggestedThemes = "Warm Pastel & Gold Elegance";
    let suggestedColors = ["#E6C280", "#1E293B", "#FAF7F2"];

    if (occasion === "birthday") {
      suggestedThemes = "Vibrant & Playful Celebrations";
      suggestedColors = ["#F4A7B9", "#E0B0FF", "#FFFDD0"];
    } else if (occasion === "corporate") {
      suggestedThemes = "Sophisticated Classic Corporate";
      suggestedColors = ["#9AA5B1", "#1F2937", "#FFFFFF"];
    } else if (occasion === "anniversary" || occasion === "wedding" || relationship === "romantic") {
      suggestedThemes = "Deep Crimson & Soft Silk Bow Romance";
      suggestedColors = ["#C94F6D", "#722F37", "#ECE2D0"];
    }

    res.json({
      success: true,
      suggestedGifts,
      suggestedThemes,
      suggestedColors,
      explanation: `Based on your budget of ₹${numBudget.toLocaleString("en-IN")} and relationship '${relationship}', we recommend a ${suggestedThemes} styling to match the recipient's preference for '${preferences || "gourmet sweets and accessories"}'.`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. AI Personalized Message Generator
router.post("/ai/generate-message", (req, res) => {
  const { occasion, tone, relationship, keywords } = req.body;

  const messages = {
    birthday: {
      warm: `Wishing you the happiest of birthdays! May this year bring you endless joy, laughter, and beautiful memories. So grateful to have you in my life. Cheers to you!`,
      formal: `May your birthday mark the beginning of a wonderful year filled with success, prosperity, and happiness. Happy Birthday.`,
      playful: `Happy Birthday! Another year older, but definitely not wiser! Wishing you a fantastic day filled with cake, laughter, and zero adult responsibilities!`
    },
    anniversary: {
      warm: `Happy Anniversary to a wonderful couple! Seeing the love and joy you share is truly inspiring. Wishing you many more beautiful years of partnership and happiness together.`,
      formal: `Congratulations on your anniversary. Wishing you continued happiness and shared success in the years ahead.`,
      playful: `Happy Anniversary! You guys still tolerate each other, and that is a true milestone. Wishing you a fun day of celebrating your love!`
    },
    corporate: {
      warm: `We want to extend our heartfelt appreciation for your hard work and dedication. It's a privilege having you on our team. Wishing you continued success!`,
      formal: `Thank you for your outstanding contribution and commitment. We value our professional relationship and look forward to continued collaboration.`,
      playful: `Thank you for being an awesome colleague! Work would be so boring without our daily chats. You rock!`
    }
  };

  const selectedOccasion = messages[occasion] || messages.birthday;
  const greeting = selectedOccasion[tone] || selectedOccasion.warm;
  
  res.json({
    success: true,
    message: keywords ? `${greeting} (P.S. Thinking of your favorite ${keywords}!)` : greeting
  });
});

// 3. AI Greeting Card Generator
router.post("/ai/generate-card", (req, res) => {
  const { title, occasion, message, themeStyle } = req.body;
  
  // Custom Card Mock Layout
  const borderStyles = {
    minimalist: "border-2 border-slate-300 px-8 py-10 rounded-sm text-slate-800",
    luxury: "border-4 border-double border-yellow-500 px-6 py-8 rounded-lg shadow-xl",
    floral: "border-8 border-pink-100 bg-pink-50/20 px-6 py-8 rounded-3xl"
  };

  res.json({
    success: true,
    cardText: message || "Wishing you all the best!",
    cardStyle: borderStyles[themeStyle] || borderStyles.luxury,
    decorations: occasion === "birthday" ? "🎈 🍰 ⭐" : occasion === "festival" ? "✨ 🪔 🌸" : "💐 🥂 💛"
  });
});

// 4. AI Corporate Gift Proposal Generator
router.post("/ai/corporate-proposal", (req, res) => {
  const { companyName, recipientCount, targetBudget, occasion } = req.body;
  const count = parseInt(recipientCount) || 50;
  const budget = parseInt(targetBudget) || 3000;
  const totalCost = count * budget;

  res.json({
    success: true,
    companyName,
    recipientCount: count,
    budgetPerBox: budget,
    totalEstimate: totalCost,
    proposalTitle: `B2B Gifting Campaign Proposal for ${companyName}`,
    recommendedHampers: [
      { name: "Executive Desk & Writing Hamper", items: ["Desk Organizer", "Premium Pen", "Notebook Set"] },
      { name: "Scented Lounge Premium Hamper", items: ["Scented Candle", "Plant Pot", "Ferrero Rocher"] }
    ],
    timeline: [
      { step: "Design Approval", duration: "3 Working Days" },
      { step: "Customization & Logo Engraving", duration: "5 Working Days" },
      { step: "Quality Assured Packaging", duration: "2 Working Days" },
      { step: "Dispatch & Bulk Courier Tracking", duration: "3 Working Days" }
    ],
    invoiceSummary: `Invoice Total: ₹${totalCost.toLocaleString("en-IN")} plus taxes.`
  });
});

module.exports = router;
// Seed endpoint logic for frontend compatibility
router.get("/layouts", (req, res) => {
  res.json([]);
});
