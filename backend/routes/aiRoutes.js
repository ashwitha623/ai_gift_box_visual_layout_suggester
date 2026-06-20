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
  const { occasion, tone, relationship, keywords, currentMessage } = req.body;

  const messages = {
    birthday: {
      warm: [
        `Wishing you the happiest of birthdays! May this year bring you endless joy, laughter, and beautiful memories. So grateful to have you in my life. Cheers to you!`,
        `Happy Birthday! Sending you warmest wishes on your special day. May your day be filled with love, laughter, and all the things that make you happiest.`,
        `May this birthday be just the beginning of a year filled with happy moments and wonderful dreams. Wishing you a truly special and memorable day!`
      ],
      formal: [
        `May your birthday mark the beginning of a wonderful year filled with success, prosperity, and happiness. Happy Birthday.`,
        `On behalf of the entire team, we wish you a very happy birthday. May the year ahead bring you new opportunities and continued professional growth.`,
        `Sending you warmest congratulations on your birthday. We wish you health, happiness, and success in all your future endeavors.`
      ],
      playful: [
        `Happy Birthday! Another year older, but definitely not wiser! Wishing you a fantastic day filled with cake, laughter, and zero adult responsibilities!`,
        `Happy Birthday! I was going to send you something special, but then I remembered you already have me in your life. Have an amazing day of celebrations!`,
        `Happy Birthday! May your day be filled with lots of fun, laughter, and cake, and may your hangover tomorrow be exceptionally mild!`
      ]
    },
    anniversary: {
      warm: [
        `Happy Anniversary to a wonderful couple! Seeing the love and joy you share is truly inspiring. Wishing you many more beautiful years of partnership and happiness together.`,
        `Happy Anniversary! Wishing you a day as special as your love story. May the bond you share grow stronger and more beautiful with each passing year.`,
        `Warmest congratulations on your anniversary. Your journey together is a beautiful testament to love and devotion. Wishing you a lifetime of happiness.`
      ],
      formal: [
        `Congratulations on your anniversary. Wishing you continued happiness and shared success in the years ahead.`,
        `Sending our best wishes on this special anniversary milestone. We celebrate your dedication and wish you continued prosperity together.`,
        `Please accept our warmest congratulations on your anniversary. May you continue to find joy and fulfillment in your shared journey.`
      ],
      playful: [
        `Happy Anniversary! You guys still tolerate each other, and that is a true milestone. Wishing you a fun day of celebrating your love!`,
        `Happy Anniversary to the couple who makes marriage look easy (even when we all know it’s a team sport of compromise). Cheers to another great year!`,
        `Happy Anniversary! I’m so happy you two found each other. Who else would put up with your quirks? Have a wonderful day of celebrations!`
      ]
    },
    corporate: {
      warm: [
        `We want to extend our heartfelt appreciation for your hard work and dedication. It's a privilege having you on our team. Wishing you continued success!`,
        `Thank you for bringing your positive energy and excellence to work every day. We are so grateful to have you as part of our professional family.`,
        `Your hard work and dedication do not go unnoticed. Thank you for being such an inspiring colleague and support system. Wishing you all the best.`
      ],
      formal: [
        `Thank you for your outstanding contribution and commitment. We value our professional relationship and look forward to continued collaboration.`,
        `We sincerely appreciate your dedication to excellence and your contributions to our organizational milestones. We value your partnership.`,
        `Accept our formal appreciation for your valuable support. We look forward to achieving many more milestones of success together.`
      ],
      playful: [
        `Thank you for being an awesome colleague! Work would be so boring without our daily chats. You rock!`,
        `Thanks for being the person who actually gets things done around here (and for keeping us all sane). We appreciate you!`,
        `Thank you for your hard work! We would say we don't know what we'd do without you, but we really don't want to find out. Cheers!`
      ]
    }
  };

  const selectedOccasion = messages[occasion] || messages.birthday;
  const templates = selectedOccasion[tone] || selectedOccasion.warm;

  // Filter out current message base if provided to ensure a new generation
  let filteredTemplates = templates;
  if (currentMessage) {
    filteredTemplates = templates.filter(t => !currentMessage.startsWith(t));
  }
  if (filteredTemplates.length === 0) {
    filteredTemplates = templates; // Fallback
  }

  // Randomly select one of the filtered templates
  const greeting = filteredTemplates[Math.floor(Math.random() * filteredTemplates.length)];
  
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
