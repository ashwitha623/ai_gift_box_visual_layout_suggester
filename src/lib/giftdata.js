import birthdayImg from "@/assets/images/birthday.jpg";
import anniversaryImg from "@/assets/images/anniversary.jpg";
import graduationImg from "@/assets/images/graduation.jpg";
import weddingImg from "@/assets/images/wedding.png";
import festivalImg from "@/assets/images/festival.jpg";
import babyShowerImg from "@/assets/images/baby_shower.jpg";
import friendshipImg from "@/assets/images/friendship.png";
import farewellImg from "@/assets/images/farewell.jpg";
import corporateImg from "@/assets/images/corporate.jpg";
import justBecauseImg from "@/assets/images/just_because.jpg";

import teddyBearImg from "@/assets/images/teddy_bear.png";
import rabbitPlushImg from "@/assets/images/rabbit_plush.png";
import pandaPlushImg from "@/assets/images/panda_plush.png";

import braceletImg from "@/assets/images/bracelet.png";
import necklaceImg from "@/assets/images/necklace.png";
import ringImg from "@/assets/images/ring.png";
import earringsImg from "@/assets/images/earrings.png";

import roseBouquetImg from "@/assets/images/rose_bouquet.png";
import lilyBouquetImg from "@/assets/images/lily_bouquet.jpg";
import tulipBouquetImg from "@/assets/images/tulip_bouquet.png";
import mixedFlowersImg from "@/assets/images/mixed_flowers.png";

import ferreroRocherImg from "@/assets/images/ferrero_rocher.png";
import lindtCollectionImg from "@/assets/images/lindt_collection.jpg";
import chocolateBoxImg from "@/assets/images/chocolate_box.png";
import premiumDarkChocImg from "@/assets/images/premium_dark_choc.jpg";

import coffeeMugImg from "@/assets/images/coffee_mug.png";
import journalImg from "@/assets/images/journal.png";
import scentedCandleImg from "@/assets/images/scented_candle.jpg";
import photoFrameImg from "@/assets/images/photo_frame.png";
import plantPotImg from "@/assets/images/plant_pot.jpg";

import perfumeImg from "@/assets/images/perfume.png";
import watchImg from "@/assets/images/watch.png";
import leatherWalletImg from "@/assets/images/leather_wallet.png";
import luxuryHamperImg from "@/assets/images/luxury_hamper.png";

import personalizedJournalImg from "@/assets/images/personalized_journal.jpg";
import photoCushionImg from "@/assets/images/photo_cushion.jpg";
import nameMugImg from "@/assets/images/name_mug.jpg";
import engravedKeychainImg from "@/assets/images/engraved_keychain.png";

import deskOrganizerImg from "@/assets/images/desk_organizer.jpg";
import notebookSetImg from "@/assets/images/notebook_set.png";
import premiumPenImg from "@/assets/images/premium_pen.jpg";
import corporateHamperImg from "@/assets/images/corporate_hamper.jpg";
// Category-level fallback images (used when a product image fails to load)
export const CATEGORY_FALLBACKS = {
  "Soft Toys":          teddyBearImg,
  "Jewelry":            braceletImg,
  "Flowers":            roseBouquetImg,
  "Chocolates":         ferreroRocherImg,
  "Lifestyle Gifts":    scentedCandleImg,
  "Premium Gifts":      perfumeImg,
  "Personalized Gifts": journalImg,
  "Corporate Gifts":    deskOrganizerImg,
};

export const OCCASIONS = [
  { id: "birthday",     title: "Birthday",     icon: "Cake",          description: "Celebrate another year of joy with a vibrant surprise box.",          image: birthdayImg },
  { id: "anniversary",  title: "Anniversary",  icon: "Heart",         description: "Mark milestones of love with elegant, romantic arrangements.",         image: anniversaryImg },
  { id: "graduation",   title: "Graduation",   icon: "GraduationCap", description: "Honor achievements with sophisticated keepsake gifts.",                image: graduationImg },
  { id: "wedding",      title: "Wedding",      icon: "Gem",           description: "Bless new beginnings with timeless, luxurious presentations.",         image: weddingImg },
  { id: "festival",     title: "Festival",     icon: "Sparkles",      description: "Share festive cheer with colorful, abundant hampers.",                 image: festivalImg },
  { id: "baby_shower",  title: "Baby Shower",  icon: "Baby",          description: "Welcome little ones with soft, adorable gift collections.",            image: babyShowerImg },
  { id: "friendship",   title: "Friendship",   icon: "Users",         description: "Celebrate true bonds with thoughtful, playful surprises.",             image: friendshipImg },
  { id: "farewell",     title: "Farewell",     icon: "Send",          description: "Say goodbye memorably with heartfelt keepsake boxes.",                 image: farewellImg },
  { id: "corporate",    title: "Corporate",    icon: "Briefcase",     description: "Impress clients and teams with refined professional gifting.",          image: corporateImg },
  { id: "just_because", title: "Just Because", icon: "Gift",          description: "No reason needed — brighten someone's day spontaneously.",             image: justBecauseImg },
];

export const CATEGORIES = [
  "Soft Toys", "Jewelry", "Flowers", "Chocolates",
  "Lifestyle Gifts", "Premium Gifts", "Personalized Gifts", "Corporate Gifts",
];

export const BOX_TEMPLATES = [
  {
    id: "pink_luxury",
    name: "Pink Luxury Ribbon Box",
    style: "Pastel Pink Luxury Rigid",
    length: 30.0,
    width: 22.0,
    height: 12.0,
    capacity: 7920.0,
    ribbonStyle: "Pink Satin Bow",
    ribbonHex: "#FFB3C6",
    packagingTheme: "Blush Luxury",
    occasions: ["farewell", "baby_shower", "friendship", "just_because"],
    cost: 450
  },
  {
    id: "pink_pattern",
    name: "Pink Pattern Celebration Box",
    style: "Pink Gold-Treillage Pattern",
    length: 28.0,
    width: 20.0,
    height: 10.0,
    capacity: 5600.0,
    ribbonStyle: "Bright Pink Ribbon",
    ribbonHex: "#FF007F",
    packagingTheme: "Confetti Celebration",
    occasions: ["birthday", "festival", "friendship", "just_because"],
    cost: 350
  },
  {
    id: "black_gold",
    name: "Black Gold Executive Box",
    style: "Matte Black Gold Floral",
    length: 32.0,
    width: 24.0,
    height: 12.0,
    capacity: 9216.0,
    ribbonStyle: "Gold Satin Bow",
    ribbonHex: "#D4AF37",
    packagingTheme: "Corporate Gold",
    occasions: ["corporate", "farewell", "graduation"],
    cost: 500
  },
  {
    id: "crocodile_premium",
    name: "Crocodile Texture Premium Box",
    style: "Brown Crocodile Leather Embossed",
    length: 34.0,
    width: 26.0,
    height: 14.0,
    capacity: 12376.0,
    ribbonStyle: "Black Velvet Bow",
    ribbonHex: "#1A1A1A",
    packagingTheme: "Luxury Crocodile Leather",
    occasions: ["anniversary", "wedding", "corporate"],
    cost: 600
  },
  {
    id: "gold_ribbon",
    name: "Gold Ribbon Classic Gift Box",
    style: "Classic Gold Foil",
    length: 26.0,
    width: 18.0,
    height: 11.0,
    capacity: 5148.0,
    ribbonStyle: "Red Satin Bow",
    ribbonHex: "#C41E3A",
    packagingTheme: "Royal Gold Red",
    occasions: ["anniversary", "wedding", "birthday", "just_because"],
    cost: 400
  }
];

export const PRODUCTS = [
  { id: 1,  name: "Teddy Bear",           category: "Soft Toys",          price: 899,  size: "Large",  image: teddyBearImg, length: 20.0, width: 14.0, height: 12.0, weight: 350, fragile: false },
  { id: 2,  name: "Rabbit Plush",         category: "Soft Toys",          price: 649,  size: "Medium", image: rabbitPlushImg, length: 16.0, width: 11.0, height: 9.0, weight: 200, fragile: false },
  { id: 3,  name: "Panda Plush",          category: "Soft Toys",          price: 749,  size: "Medium", image: pandaPlushImg, length: 18.0, width: 12.0, height: 10.0, weight: 250, fragile: false },

  { id: 4,  name: "Bracelet",             category: "Jewelry",            price: 1499, size: "Small",  image: braceletImg, length: 8.0, width: 8.0, height: 3.0, weight: 50, fragile: false },
  { id: 5,  name: "Necklace",             category: "Jewelry",            price: 2499, size: "Small",  image: necklaceImg, length: 10.0, width: 10.0, height: 4.0, weight: 80, fragile: false },
  { id: 6,  name: "Ring",                 category: "Jewelry",            price: 1999, size: "Small",  image: ringImg, length: 6.0, width: 6.0, height: 3.0, weight: 30, fragile: false },
  { id: 7,  name: "Earrings",             category: "Jewelry",            price: 1299, size: "Small",  image: earringsImg, length: 7.0, width: 7.0, height: 3.0, weight: 40, fragile: false },

  { id: 8,  name: "Rose Bouquet",         category: "Flowers",            price: 1199, size: "Large",  image: roseBouquetImg, length: 25.0, width: 11.0, height: 9.0, weight: 400, fragile: false },
  { id: 9,  name: "Lily Bouquet",         category: "Flowers",            price: 1399, size: "Large",  image: lilyBouquetImg, length: 26.0, width: 12.0, height: 10.0, weight: 450, fragile: false },
  { id: 10, name: "Tulip Bouquet",        category: "Flowers",            price: 1299, size: "Large",  image: tulipBouquetImg, length: 24.0, width: 11.0, height: 8.0, weight: 380, fragile: false },
  { id: 11, name: "Mixed Flowers",        category: "Flowers",            price: 1499, size: "Large",  image: mixedFlowersImg, length: 26.0, width: 13.0, height: 11.0, weight: 500, fragile: false },

  { id: 12, name: "Ferrero Rocher",       category: "Chocolates",         price: 799,  size: "Small",  image: ferreroRocherImg, length: 14.0, width: 14.0, height: 4.0, weight: 200, fragile: false },
  { id: 13, name: "Lindt Collection",     category: "Chocolates",         price: 1299, size: "Medium", image: lindtCollectionImg, length: 18.0, width: 12.0, height: 5.0, weight: 250, fragile: false },
  { id: 14, name: "Chocolate Box",        category: "Chocolates",         price: 999,  size: "Small",  image: chocolateBoxImg, length: 12.0, width: 12.0, height: 4.0, weight: 150, fragile: false },
  { id: 15, name: "Premium Dark Choc",    category: "Chocolates",         price: 599,  size: "Small",  image: premiumDarkChocImg, length: 15.0, width: 8.0, height: 2.0, weight: 100, fragile: false },

  { id: 16, name: "Coffee Mug",           category: "Lifestyle Gifts",    price: 449,  size: "Small",  image: coffeeMugImg, length: 10.0, width: 10.0, height: 10.0, weight: 300, fragile: true },
  { id: 17, name: "Journal",              category: "Lifestyle Gifts",    price: 599,  size: "Small",  image: journalImg, length: 20.0, width: 13.0, height: 2.0, weight: 280, fragile: false },
  { id: 18, name: "Scented Candle",       category: "Lifestyle Gifts",    price: 549,  size: "Small",  image: scentedCandleImg, length: 8.0, width: 8.0, height: 8.0, weight: 250, fragile: true },
  { id: 19, name: "Photo Frame",          category: "Lifestyle Gifts",    price: 699,  size: "Medium", image: photoFrameImg, length: 21.0, width: 16.0, height: 2.0, weight: 450, fragile: true },
  { id: 20, name: "Plant Pot",            category: "Lifestyle Gifts",    price: 649,  size: "Medium", image: plantPotImg, length: 11.0, width: 11.0, height: 11.0, weight: 600, fragile: true },

  { id: 21, name: "Perfume",              category: "Premium Gifts",      price: 3499, size: "Small",  image: perfumeImg, length: 11.0, width: 7.0, height: 5.0, weight: 350, fragile: true },
  { id: 22, name: "Watch",                category: "Premium Gifts",      price: 5999, size: "Small",  image: watchImg, length: 9.0, width: 9.0, height: 7.0, weight: 200, fragile: true },
  { id: 23, name: "Leather Wallet",       category: "Premium Gifts",      price: 2499, size: "Small",  image: leatherWalletImg, length: 11.0, width: 9.0, height: 2.0, weight: 120, fragile: false },
  { id: 24, name: "Luxury Hamper",        category: "Premium Gifts",      price: 4999, size: "Large",  image: luxuryHamperImg, length: 26.0, width: 18.0, height: 9.0, weight: 800, fragile: true },

  { id: 25, name: "Personalized Journal", category: "Personalized Gifts", price: 749,  size: "Small",  image: personalizedJournalImg, length: 20.0, width: 13.0, height: 2.0, weight: 280, fragile: false },
  { id: 26, name: "Photo Cushion",        category: "Personalized Gifts", price: 899,  size: "Medium", image: photoCushionImg, length: 24.0, width: 24.0, height: 9.0, weight: 300, fragile: false },
  { id: 27, name: "Name Mug",             category: "Personalized Gifts", price: 599,  size: "Small",  image: nameMugImg, length: 10.0, width: 10.0, height: 10.0, weight: 300, fragile: true },
  { id: 28, name: "Engraved Keychain",    category: "Personalized Gifts", price: 399,  size: "Small",  image: engravedKeychainImg, length: 6.0, width: 3.0, height: 1.0, weight: 25, fragile: false },

  { id: 29, name: "Desk Organizer",       category: "Corporate Gifts",    price: 1299, size: "Medium", image: deskOrganizerImg, length: 22.0, width: 14.0, height: 9.0, weight: 700, fragile: false },
  { id: 30, name: "Notebook Set",         category: "Corporate Gifts",    price: 699,  size: "Small",  image: notebookSetImg, length: 21.0, width: 14.0, height: 3.0, weight: 400, fragile: false },
  { id: 31, name: "Premium Pen",          category: "Corporate Gifts",    price: 1899, size: "Small",  image: premiumPenImg, length: 14.0, width: 2.0, height: 2.0, weight: 50, fragile: false },
  { id: 32, name: "Corporate Hamper",     category: "Corporate Gifts",    price: 2999, size: "Large",  image: corporateHamperImg, length: 26.0, width: 20.0, height: 9.0, weight: 900, fragile: true },
];

export const BOX_SIZES = ["Small", "Medium", "Large"];

export const formatINR = (n) => `₹${n.toLocaleString("en-IN")}`;