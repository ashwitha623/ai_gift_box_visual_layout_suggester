import birthdayImg from "@/assets/images/birthday.jpg";
import anniversaryImg from "@/assets/images/anniversary.jpg";
import graduationImg from "@/assets/images/graduation.jpg";
import weddingImg from "@/assets/images/wedding.jpg";
import festivalImg from "@/assets/images/festival.jpg";
import babyShowerImg from "@/assets/images/baby_shower.jpg";
import friendshipImg from "@/assets/images/friendship.jpg";
import farewellImg from "@/assets/images/farewell.jpg";
import corporateImg from "@/assets/images/corporate.jpg";
import justBecauseImg from "@/assets/images/just_because.jpg";

import teddyBearImg from "@/assets/images/teddy_bear.jpg";
import rabbitPlushImg from "@/assets/images/rabbit_plush.png";
import pandaPlushImg from "@/assets/images/panda_plush.jpg";

import braceletImg from "@/assets/images/bracelet.jpg";
import necklaceImg from "@/assets/images/necklace.jpg";
import ringImg from "@/assets/images/ring.jpg";
import earringsImg from "@/assets/images/earrings.jpg";

import roseBouquetImg from "@/assets/images/rose_bouquet.jpg";
import lilyBouquetImg from "@/assets/images/lily_bouquet.jpg";
import tulipBouquetImg from "@/assets/images/tulip_bouquet.jpg";
import mixedFlowersImg from "@/assets/images/mixed_flowers.jpg";

import ferreroRocherImg from "@/assets/images/ferrero_rocher.jpg";
import lindtCollectionImg from "@/assets/images/lindt_collection.jpg";
import chocolateBoxImg from "@/assets/images/chocolate_box.jpg";
import premiumDarkChocImg from "@/assets/images/premium_dark_choc.jpg";

import coffeeMugImg from "@/assets/images/coffee_mug.jpg";
import journalImg from "@/assets/images/journal.jpg";
import scentedCandleImg from "@/assets/images/scented_candle.jpg";
import photoFrameImg from "@/assets/images/photo_frame.jpg";
import plantPotImg from "@/assets/images/plant_pot.jpg";

import perfumeImg from "@/assets/images/perfume.jpg";
import watchImg from "@/assets/images/watch.png";
import leatherWalletImg from "@/assets/images/leather_wallet.jpg";
import luxuryHamperImg from "@/assets/images/luxury_hamper.jpg";

import personalizedJournalImg from "@/assets/images/personalized_journal.jpg";
import photoCushionImg from "@/assets/images/photo_cushion.jpg";
import nameMugImg from "@/assets/images/name_mug.jpg";
import engravedKeychainImg from "@/assets/images/engraved_keychain.jpg";

import deskOrganizerImg from "@/assets/images/desk_organizer.jpg";
import notebookSetImg from "@/assets/images/notebook_set.jpg";
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

export const PRODUCTS = [
  { id: 1,  name: "Teddy Bear",           category: "Soft Toys",          price: 899,  size: "Large",  image: teddyBearImg },
  { id: 2,  name: "Rabbit Plush",         category: "Soft Toys",          price: 649,  size: "Medium", image: rabbitPlushImg },
  { id: 3,  name: "Panda Plush",          category: "Soft Toys",          price: 749,  size: "Medium", image: pandaPlushImg },

  { id: 4,  name: "Bracelet",             category: "Jewelry",            price: 1499, size: "Small",  image: braceletImg },
  { id: 5,  name: "Necklace",             category: "Jewelry",            price: 2499, size: "Small",  image: necklaceImg },
  { id: 6,  name: "Ring",                 category: "Jewelry",            price: 1999, size: "Small",  image: ringImg },
  { id: 7,  name: "Earrings",             category: "Jewelry",            price: 1299, size: "Small",  image: earringsImg },

  { id: 8,  name: "Rose Bouquet",         category: "Flowers",            price: 1199, size: "Large",  image: roseBouquetImg },
  { id: 9,  name: "Lily Bouquet",         category: "Flowers",            price: 1399, size: "Large",  image: lilyBouquetImg },
  { id: 10, name: "Tulip Bouquet",        category: "Flowers",            price: 1299, size: "Large",  image: tulipBouquetImg },
  { id: 11, name: "Mixed Flowers",        category: "Flowers",            price: 1499, size: "Large",  image: mixedFlowersImg },

  { id: 12, name: "Ferrero Rocher",       category: "Chocolates",         price: 799,  size: "Small",  image: ferreroRocherImg },
  { id: 13, name: "Lindt Collection",     category: "Chocolates",         price: 1299, size: "Medium", image: lindtCollectionImg },
  { id: 14, name: "Chocolate Box",        category: "Chocolates",         price: 999,  size: "Small",  image: chocolateBoxImg },
  { id: 15, name: "Premium Dark Choc",    category: "Chocolates",         price: 599,  size: "Small",  image: premiumDarkChocImg },

  { id: 16, name: "Coffee Mug",           category: "Lifestyle Gifts",    price: 449,  size: "Small",  image: coffeeMugImg },
  { id: 17, name: "Journal",              category: "Lifestyle Gifts",    price: 599,  size: "Small",  image: journalImg },
  { id: 18, name: "Scented Candle",       category: "Lifestyle Gifts",    price: 549,  size: "Small",  image: scentedCandleImg },
  { id: 19, name: "Photo Frame",          category: "Lifestyle Gifts",    price: 699,  size: "Medium", image: photoFrameImg },
  { id: 20, name: "Plant Pot",            category: "Lifestyle Gifts",    price: 649,  size: "Medium", image: plantPotImg },

  { id: 21, name: "Perfume",              category: "Premium Gifts",      price: 3499, size: "Small",  image: perfumeImg },
  { id: 22, name: "Watch",                category: "Premium Gifts",      price: 5999, size: "Small",  image: watchImg },
  { id: 23, name: "Leather Wallet",       category: "Premium Gifts",      price: 2499, size: "Small",  image: leatherWalletImg },
  { id: 24, name: "Luxury Hamper",        category: "Premium Gifts",      price: 4999, size: "Large",  image: luxuryHamperImg },

  { id: 25, name: "Personalized Journal", category: "Personalized Gifts", price: 749,  size: "Small",  image: personalizedJournalImg },
  { id: 26, name: "Photo Cushion",        category: "Personalized Gifts", price: 899,  size: "Medium", image: photoCushionImg },
  { id: 27, name: "Name Mug",             category: "Personalized Gifts", price: 599,  size: "Small",  image: nameMugImg },
  { id: 28, name: "Engraved Keychain",    category: "Personalized Gifts", price: 399,  size: "Small",  image: engravedKeychainImg },

  { id: 29, name: "Desk Organizer",       category: "Corporate Gifts",    price: 1299, size: "Medium", image: deskOrganizerImg },
  { id: 30, name: "Notebook Set",         category: "Corporate Gifts",    price: 699,  size: "Small",  image: notebookSetImg },
  { id: 31, name: "Premium Pen",          category: "Corporate Gifts",    price: 1899, size: "Small",  image: premiumPenImg },
  { id: 32, name: "Corporate Hamper",     category: "Corporate Gifts",    price: 2999, size: "Large",  image: corporateHamperImg },
];

export const BOX_SIZES = ["Small", "Medium", "Large"];

export const formatINR = (n) => `₹${n.toLocaleString("en-IN")}`;