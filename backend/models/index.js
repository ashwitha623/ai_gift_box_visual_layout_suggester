const sequelize = require("./db");
const User = require("./User");
const Product = require("./Product");
const Order = require("./Order");
const OrderItem = require("./OrderItem");
const Recipient = require("./Recipient");
const Return = require("./Return");
const Campaign = require("./Campaign");
const CRMContact = require("./CRMContact");
const PackagingMaterial = require("./PackagingMaterial");
const DesignApproval = require("./DesignApproval");
const ProductionStage = require("./ProductionStage");
const CustomerProfile = require("./CustomerProfile");
const Notification = require("./Notification");
const PackagingBox = require("./PackagingBox");
const LayoutTemplate = require("./LayoutTemplate");

// Setup relations
Order.hasMany(DesignApproval, { foreignKey: "orderId", as: "designApprovals" });
DesignApproval.belongsTo(Order, { foreignKey: "orderId", as: "order" });

Order.hasMany(ProductionStage, { foreignKey: "orderId", as: "productionStages" });
ProductionStage.belongsTo(Order, { foreignKey: "orderId", as: "order" });

User.hasOne(CustomerProfile, { foreignKey: "userId", as: "profile" });
CustomerProfile.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasMany(Notification, { foreignKey: "userId", as: "notifications" });
Notification.belongsTo(User, { foreignKey: "userId", as: "user" });

// Sync Database function
async function initDb() {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully.");
    
    // Additive schema alterations for SQLite (failsafe, ignores duplicates)
    try {
      await sequelize.query("ALTER TABLE products ADD COLUMN sku VARCHAR(255)");
    } catch (e) {}
    try {
      await sequelize.query("ALTER TABLE products ADD COLUMN reservedQty INTEGER DEFAULT 0");
    } catch (e) {}
    try {
      await sequelize.query("ALTER TABLE products ADD COLUMN minThreshold INTEGER DEFAULT 5");
    } catch (e) {}
    try {
      await sequelize.query("ALTER TABLE products ADD COLUMN length FLOAT DEFAULT 0");
    } catch (e) {}
    try {
      await sequelize.query("ALTER TABLE products ADD COLUMN width FLOAT DEFAULT 0");
    } catch (e) {}
    try {
      await sequelize.query("ALTER TABLE products ADD COLUMN height FLOAT DEFAULT 0");
    } catch (e) {}
    try {
      await sequelize.query("ALTER TABLE products ADD COLUMN weight FLOAT DEFAULT 0");
    } catch (e) {}
    try {
      await sequelize.query("ALTER TABLE products ADD COLUMN fragile BOOLEAN DEFAULT 0");
    } catch (e) {}
    try {
      await sequelize.query("ALTER TABLE crm_contacts ADD COLUMN status VARCHAR(255) DEFAULT 'Scheduled'");
    } catch (e) {}
    try {
      await sequelize.query("ALTER TABLE crm_contacts ADD COLUMN autoSchedule BOOLEAN DEFAULT 1");
    } catch (e) {}
    try {
      await sequelize.query("ALTER TABLE recipients ADD COLUMN phone VARCHAR(255)");
    } catch (e) {}
    try {
      await sequelize.query("ALTER TABLE orders ADD COLUMN spaceUtil FLOAT DEFAULT 0");
    } catch (e) {}
    try {
      await sequelize.query("ALTER TABLE orders ADD COLUMN packingEfficiency FLOAT DEFAULT 0");
    } catch (e) {}

    // Sync tables
    await sequelize.sync();
    console.log("Database models synchronized successfully.");
    
    // Seed default users if empty or missing
    let adminUser = await User.findOne({ where: { role: "admin" } });
    if (!adminUser) {
      adminUser = await User.create({
        username: "admin",
        email: "admin@paperplane.com",
        password: "admin", // Simple mock password for demo authentication
        role: "admin"
      });
      console.log("Default admin account created: admin / admin");
    }

    let customerUser = await User.findOne({ where: { username: "customer" } });
    if (!customerUser) {
      customerUser = await User.create({
        username: "customer",
        email: "customer@paperplane.com",
        password: "customer",
        role: "customer"
      });
      console.log("Default customer account created: customer / customer");
    }

    let corporateUser = await User.findOne({ where: { username: "corporate" } });
    if (!corporateUser) {
      corporateUser = await User.create({
        username: "corporate",
        email: "corporate@acme.com",
        password: "corporate",
        role: "corporate"
      });
      console.log("Default corporate account created: corporate / corporate");
    }

    // Seed products catalog matching frontend giftdata
    const initialProducts = [
      { name: "Rocking Horse", category: "Soft Toys", price: 899, size: "Large", stock: 15, image: null, length: 20.0, width: 14.0, height: 12.0, weight: 350, fragile: false },
      { name: "Rabbit Plush", category: "Soft Toys", price: 649, size: "Medium", stock: 20, image: null, length: 16.0, width: 11.0, height: 9.0, weight: 200, fragile: false },
      { name: "Panda Plush", category: "Soft Toys", price: 749, size: "Medium", stock: 12, image: null, length: 18.0, width: 12.0, height: 10.0, weight: 250, fragile: false },
      { name: "Bracelet", category: "Jewelry", price: 1499, size: "Small", stock: 25, image: null, length: 8.0, width: 8.0, height: 3.0, weight: 50, fragile: false },
      { name: "Necklace", category: "Jewelry", price: 2499, size: "Small", stock: 8, image: null, length: 10.0, width: 10.0, height: 4.0, weight: 80, fragile: false },
      { name: "Ring", category: "Jewelry", price: 1999, size: "Small", stock: 15, image: null, length: 6.0, width: 6.0, height: 3.0, weight: 30, fragile: false },
      { name: "Earrings", category: "Jewelry", price: 1299, size: "Small", stock: 20, image: null, length: 7.0, width: 7.0, height: 3.0, weight: 40, fragile: false },
      { name: "Rose Bouquet", category: "Flowers", price: 1199, size: "Large", stock: 30, image: null, length: 25.0, width: 11.0, height: 9.0, weight: 400, fragile: false },
      { name: "Tulip Bouquet", category: "Flowers", price: 1299, size: "Large", stock: 15, image: null, length: 24.0, width: 11.0, height: 8.0, weight: 380, fragile: false },
      { name: "Mixed Flowers", category: "Flowers", price: 1499, size: "Large", stock: 20, image: null, length: 26.0, width: 13.0, height: 11.0, weight: 500, fragile: false },
      { name: "Ferrero Rocher", category: "Chocolates", price: 799, size: "Small", stock: 25, image: null, length: 14.0, width: 14.0, height: 4.0, weight: 200, fragile: false },
      { name: "Lindt Collection", category: "Chocolates", price: 1299, size: "Medium", stock: 18, image: null, length: 18.0, width: 12.0, height: 5.0, weight: 250, fragile: false },
      { name: "Box of Chocolates", category: "Chocolates", price: 999, size: "Small", stock: 20, image: null, length: 12.0, width: 12.0, height: 4.0, weight: 150, fragile: false },
      { name: "Premium Dark Choc", category: "Chocolates", price: 599, size: "Small", stock: 30, image: null, length: 15.0, width: 8.0, height: 2.0, weight: 100, fragile: false },
      { name: "Coffee Mug", category: "Lifestyle Gifts", price: 449, size: "Small", stock: 25, image: null, length: 10.0, width: 10.0, height: 10.0, weight: 300, fragile: true },
      { name: "Journal", category: "Lifestyle Gifts", price: 599, size: "Small", stock: 35, image: null, length: 20.0, width: 13.0, height: 2.0, weight: 280, fragile: false },
      { name: "Scented Candle", category: "Lifestyle Gifts", price: 549, size: "Small", stock: 40, image: null, length: 8.0, width: 8.0, height: 8.0, weight: 250, fragile: true },
      { name: "Photo Frame", category: "Lifestyle Gifts", price: 699, size: "Medium", stock: 15, image: null, length: 21.0, width: 16.0, height: 2.0, weight: 450, fragile: true },
      { name: "Plant Pot", category: "Lifestyle Gifts", price: 649, size: "Medium", stock: 15, image: null, length: 11.0, width: 11.0, height: 11.0, weight: 600, fragile: true },
      { name: "Perfume", category: "Premium Gifts", price: 3499, size: "Small", stock: 10, image: null, length: 11.0, width: 7.0, height: 5.0, weight: 350, fragile: true },
      { name: "Clock Ornament", category: "Premium Gifts", price: 5999, size: "Small", stock: 5, image: null, length: 9.0, width: 9.0, height: 7.0, weight: 200, fragile: true },
      { name: "Leather Wallet", category: "Premium Gifts", price: 2499, size: "Small", stock: 12, image: null, length: 11.0, width: 9.0, height: 2.0, weight: 120, fragile: false },
      { name: "Luxury Hamper", category: "Premium Gifts", price: 4999, size: "Large", stock: 8, image: null, length: 26.0, width: 18.0, height: 9.0, weight: 800, fragile: true },
      { name: "Personalized Journal", category: "Personalized Gifts", price: 749, size: "Small", stock: 20, image: null, length: 20.0, width: 13.0, height: 2.0, weight: 280, fragile: false },
      { name: "Photo Cushion", category: "Personalized Gifts", price: 899, size: "Medium", stock: 15, image: null, length: 24.0, width: 24.0, height: 9.0, weight: 300, fragile: false },
      { name: "Name Mug", category: "Personalized Gifts", price: 599, size: "Small", stock: 20, image: null, length: 10.0, width: 10.0, height: 10.0, weight: 300, fragile: true },
      { name: "Engraved Keychain", category: "Personalized Gifts", price: 399, size: "Small", stock: 50, image: null, length: 6.0, width: 3.0, height: 1.0, weight: 25, fragile: false },
      { name: "Desk Organizer", category: "Corporate Gifts", price: 1299, size: "Medium", stock: 15, image: null, length: 22.0, width: 14.0, height: 9.0, weight: 700, fragile: false },
      { name: "Notebook Set", category: "Corporate Gifts", price: 699, size: "Small", stock: 25, image: null, length: 21.0, width: 14.0, height: 3.0, weight: 400, fragile: false },
      { name: "Premium Pen", category: "Corporate Gifts", price: 1899, size: "Small", stock: 20, image: null, length: 14.0, width: 2.0, height: 2.0, weight: 50, fragile: false }
    ];

    for (const p of initialProducts) {
      await Product.findOrCreate({
        where: { name: p.name },
        defaults: p
      });
    }
    console.log("Products catalog synchronized in the database.");

    // Query all products to link orders
    const products = await Product.findAll();
    const rockingHorse = products.find(p => p.name === "Rocking Horse");
    const necklace = products.find(p => p.name === "Necklace");
    const roseBouquet = products.find(p => p.name === "Rose Bouquet");
    const lindt = products.find(p => p.name === "Lindt Collection");
    const scentedCandle = products.find(p => p.name === "Scented Candle");
    const perfume = products.find(p => p.name === "Perfume");
    const clockOrnament = products.find(p => p.name === "Clock Ornament");

    // Seed orders, recipients, and items if empty
    const orderCount = await Order.count();
    if (orderCount === 0 && rockingHorse && necklace && roseBouquet && lindt && scentedCandle && perfume && clockOrnament) {
      // Order 1 (Delivered, 10 days ago)
      const order1 = await Order.create({
        userId: customerUser.id,
        totalPrice: clockOrnament.price + roseBouquet.price + 350,
        status: "Delivered",
        ribbonColor: "#D4AF37",
        boxSize: "Large",
        trackingId: "PP-543210",
        paymentStatus: "Paid",
        paymentMethod: "COD",
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      });
      await Recipient.create({
        orderId: order1.id,
        name: "Kunal Verma",
        message: "Happy Anniversary to the best couple!",
        customText: "FOREVER",
        photoUrl: null,
        logoUrl: null
      });
      await OrderItem.bulkCreate([
        { orderId: order1.id, productId: clockOrnament.id, quantity: 1, price: clockOrnament.price },
        { orderId: order1.id, productId: roseBouquet.id, quantity: 1, price: roseBouquet.price }
      ]);

      // Order 2 (Packaging, 2 days ago)
      const order2 = await Order.create({
        userId: customerUser.id,
        totalPrice: necklace.price + lindt.price + 350,
        status: "Packaging",
        ribbonColor: "#AA8413",
        boxSize: "Medium",
        trackingId: "PP-876543",
        paymentStatus: "Pending",
        paymentMethod: "COD",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      });
      await Recipient.create({
        orderId: order2.id,
        name: "Riya Sen",
        message: "Congratulations on your graduation!",
        customText: "RIYA 2026",
        photoUrl: null,
        logoUrl: null
      });
      await OrderItem.bulkCreate([
        { orderId: order2.id, productId: necklace.id, quantity: 1, price: necklace.price },
        { orderId: order2.id, productId: lindt.id, quantity: 1, price: lindt.price }
      ]);

      // Order 3 (Order Placed, 1 day ago)
      const order3 = await Order.create({
        userId: customerUser.id,
        totalPrice: rockingHorse.price + scentedCandle.price + 350,
        status: "Order Placed",
        ribbonColor: "#D4AF37",
        boxSize: "Medium",
        trackingId: "PP-987123",
        paymentStatus: "Pending",
        paymentMethod: "COD",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      });
      await Recipient.create({
        orderId: order3.id,
        name: "Ananya Sharma",
        message: "Happy Birthday! Hope you love this customized premium box.",
        customText: "ANANYA",
        photoUrl: null,
        logoUrl: null
      });
      await OrderItem.bulkCreate([
        { orderId: order3.id, productId: rockingHorse.id, quantity: 1, price: rockingHorse.price },
        { orderId: order3.id, productId: scentedCandle.id, quantity: 1, price: scentedCandle.price }
      ]);

      // Order 4 (Quality Check, 4 days ago)
      const order4 = await Order.create({
        userId: corporateUser.id,
        totalPrice: (lindt.price * 5) + 350,
        status: "Quality Check",
        ribbonColor: "#D4AF37",
        boxSize: "Large",
        trackingId: "PP-CORP-4321",
        paymentStatus: "Pending",
        paymentMethod: "COD",
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      });
      await Recipient.create({
        orderId: order4.id,
        name: "Acme Team",
        message: "Welcome to Acme Corp! Hope you enjoy this new hire package.",
        customText: "ACME CORP",
        photoUrl: null,
        logoUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop"
      });
      await OrderItem.create({
        orderId: order4.id,
        productId: lindt.id,
        quantity: 5,
        price: lindt.price
      });

      // Order 5 (Dispatch, 3 days ago)
      const order5 = await Order.create({
        userId: adminUser.id,
        totalPrice: perfume.price + 350,
        status: "Dispatch",
        ribbonColor: "#071A3D",
        boxSize: "Small",
        trackingId: "PP-ADM-9988",
        paymentStatus: "Pending",
        paymentMethod: "COD",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      });
      await Recipient.create({
        orderId: order5.id,
        name: "Vikram Sen",
        message: "Thank you for your business partnership.",
        customText: "PARTNER",
        photoUrl: null,
        logoUrl: null
      });
      await OrderItem.create({
        orderId: order5.id,
        productId: perfume.id,
        quantity: 1,
        price: perfume.price
      });

      console.log("Orders pre-seeded in database.");
    }

    // Seed DesignApproval records for seeded orders if missing
    const approvalCount = await DesignApproval.count();
    if (approvalCount === 0) {
      const orders = await Order.findAll();
      for (const order of orders) {
        let approvalStatus = "Draft Created";
        if (order.status === "Delivered") {
          approvalStatus = "Final Approved";
        } else if (order.status === "Packaging" || order.status === "Dispatch") {
          approvalStatus = "Approved";
        } else if (order.status === "Quality Check") {
          approvalStatus = "Awaiting Customer Approval";
        }
        
        await DesignApproval.create({
          orderId: order.id,
          status: approvalStatus,
          revisionNotes: null,
          history: JSON.stringify([
            { timestamp: new Date(order.createdAt).toISOString(), action: "Design Draft Created", actor: "System", note: "Auto-generated studio visualizer layout." }
          ])
        });
      }
      console.log("Design approvals pre-seeded in database.");
    }

    // Seed returns if empty
    const returnCount = await Return.count();
    if (returnCount === 0) {
      const orders = await Order.findAll();
      const order2 = orders.find(o => o.trackingId === "PP-876543");
      const order1 = orders.find(o => o.trackingId === "PP-543210");

      if (order2) {
        await Return.create({
          orderId: order2.id,
          type: "Replacement",
          reason: "The necklace has a small scratch on the clasp. Requesting replacement.",
          status: "Pending",
          adminNotes: null,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        });
      }

      if (order1) {
        await Return.create({
          orderId: order1.id,
          type: "Refund",
          reason: "Received clock ornament but box has damaged corners, item is fine but wanted to return as it was for a gift.",
          status: "Approved",
          adminNotes: "Refund approved. Return shipping initiated.",
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        });
      }
      console.log("Returns pre-seeded in database.");
    }

    // Seed B2B corporate campaigns if empty
    const campaignCount = await Campaign.count();
    if (campaignCount === 0) {
      await Campaign.create({
        name: "Acme Corp New Hire Kits",
        corporateId: corporateUser.id,
        budget: 75000,
        deliveryDate: "2026-07-01",
        status: "In Progress",
        employeeListUrl: "http://localhost:5000/uploads/employees_acme.csv",
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      });

      await Campaign.create({
        name: "Acme Corp Annual Gala Hampers",
        corporateId: corporateUser.id,
        budget: 350000,
        deliveryDate: "2026-09-15",
        status: "Scheduled",
        employeeListUrl: null,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      });

      await Campaign.create({
        name: "Q1 Client Appreciation Boxes",
        corporateId: corporateUser.id,
        budget: 120000,
        deliveryDate: "2026-04-10",
        status: "Completed",
        employeeListUrl: "http://localhost:5000/uploads/clients_acme.csv",
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
      });
      console.log("Campaigns pre-seeded in database.");
    }

    // Seed CRM contacts if empty
    const crmCount = await CRMContact.count();
    if (crmCount === 0) {
      await CRMContact.create({
        userId: customerUser.id,
        name: "Vikram Malhotra",
        relationship: "Client",
        occasionType: "birthday",
        occasionDate: "2026-06-25",
        reminderSent: false,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
      });

      await CRMContact.create({
        userId: customerUser.id,
        name: "Meera Kapoor",
        relationship: "Mother",
        occasionType: "birthday",
        occasionDate: "2026-06-30",
        reminderSent: false,
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)
      });

      await CRMContact.create({
        userId: customerUser.id,
        name: "Rohan & Sneha",
        relationship: "Friend",
        occasionType: "anniversary",
        occasionDate: "2026-07-05",
        reminderSent: false,
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
      });

      await CRMContact.create({
        userId: adminUser.id,
        name: "Aditya Roy",
        relationship: "Friend",
        occasionType: "birthday",
        occasionDate: "2026-06-25",
        reminderSent: false,
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
      });

      await CRMContact.create({
        userId: adminUser.id,
        name: "Kunal Sen",
        relationship: "Colleague",
        occasionType: "anniversary",
        occasionDate: "2026-07-02",
        reminderSent: false,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      });
      console.log("CRM contacts pre-seeded in database.");
    }

    // Add SKU details and update dimensions for existing products
    const existingProds = await Product.findAll();
    for (let p of existingProds) {
      const match = initialProducts.find(ip => ip.name === p.name);
      const updates = {};
      if (!p.sku) {
        const catCode = p.category.substring(0, 3).toUpperCase();
        const nameCode = p.name.substring(0, 4).toUpperCase().replace(/\s+/g, "");
        updates.sku = `PRD-${catCode}-${nameCode}-${p.id}`;
        updates.reservedQty = 0;
        updates.minThreshold = 5;
      }
      if (match) {
        updates.length = match.length;
        updates.width = match.width;
        updates.height = match.height;
        updates.weight = match.weight;
        updates.fragile = match.fragile;
      }
      if (Object.keys(updates).length > 0) {
        await p.update(updates);
      }
    }

    // Seed packaging boxes if empty
    const boxCount = await PackagingBox.count();
    if (boxCount === 0) {
      const initialBoxes = [
        {
          name: "Small Box",
          length: 25.0,
          width: 20.0,
          height: 8.0,
          maxWeight: 2000,
          volume: 25 * 20 * 8, // 4000
          cost: 300,
          style: "Classic Gold Foil",
          ribbonStyle: "Red Satin Bow",
          ribbonHex: "#C41E3A",
          packagingTheme: "Royal Gold Red",
          occasions: "anniversary,wedding,birthday,just_because"
        },
        {
          name: "Medium Box",
          length: 35.0,
          width: 25.0,
          height: 10.0,
          maxWeight: 4000,
          volume: 35 * 25 * 10, // 8750
          cost: 400,
          style: "Pastel Pink Luxury Rigid",
          ribbonStyle: "Pink Satin Bow",
          ribbonHex: "#FFB3C6",
          packagingTheme: "Blush Luxury",
          occasions: "farewell,baby_shower,friendship,just_because,birthday"
        },
        {
          name: "Large Box",
          length: 45.0,
          width: 35.0,
          height: 15.0,
          maxWeight: 7000,
          volume: 45 * 35 * 15, // 23625
          cost: 500,
          style: "Brown Crocodile Leather Embossed",
          ribbonStyle: "Black Velvet Bow",
          ribbonHex: "#1A1A1A",
          packagingTheme: "Luxury Crocodile Leather",
          occasions: "anniversary,wedding,corporate"
        },
        {
          name: "Luxury Premium Box",
          length: 50.0,
          width: 40.0,
          height: 18.0,
          maxWeight: 10000,
          volume: 50 * 40 * 18, // 36000
          cost: 650,
          style: "Matte Black Gold Floral",
          ribbonStyle: "Gold Satin Bow",
          ribbonHex: "#D4AF37",
          packagingTheme: "Corporate Gold",
          occasions: "corporate,farewell,graduation,anniversary,wedding"
        }
      ];
      await PackagingBox.bulkCreate(initialBoxes);
      console.log("Packaging boxes seeded.");
    }

    // Seed layout templates if empty
    const templateCount = await LayoutTemplate.count();
    if (templateCount === 0) {
      const initialTemplates = [
        {
          id: "showcase",
          name: "Premium Showcase Layout",
          minSpacing: 0.6,
          fragileBuffer: 1.5,
          allowRotation: true,
          alignmentPreference: "center",
          preferredPlacementZone: "radial",
          description: "Generous visual spacing spotlighting key items."
        },
        {
          id: "symmetrical",
          name: "Luxury Symmetrical Layout",
          minSpacing: 0.6,
          fragileBuffer: 1.5,
          allowRotation: true,
          alignmentPreference: "mirror",
          preferredPlacementZone: "left-right",
          description: "Balanced bilateral arrangement with equal visual weight."
        },
        {
          id: "space_utilization",
          name: "Maximum Space Utilization Layout",
          minSpacing: 0.6,
          fragileBuffer: 1.5,
          allowRotation: true,
          alignmentPreference: "dense",
          preferredPlacementZone: "corners",
          description: "Compact packing minimizing shifting and box size."
        },
        {
          id: "safe_shipping",
          name: "Safe Shipping Layout",
          minSpacing: 1.8,
          fragileBuffer: 1.5,
          allowRotation: true,
          alignmentPreference: "middle",
          preferredPlacementZone: "fragile-center",
          description: "Centering fragile products and adding double safety cushions."
        },
        {
          id: "corporate",
          name: "Corporate Executive Layout",
          minSpacing: 0.6,
          fragileBuffer: 1.5,
          allowRotation: true,
          alignmentPreference: "grid",
          preferredPlacementZone: "rows",
          description: "Structured rows and columns presenting items with executive neatness."
        }
      ];
      await LayoutTemplate.bulkCreate(initialTemplates);
      console.log("Layout templates seeded.");
    }

    // Seed packaging materials if empty
    const packagingCount = await PackagingMaterial.count();
    if (packagingCount === 0) {
      const initialPackaging = [
        { name: "Premium Blue Box (S)", type: "Box", sku: "BOX-BLU-S", availableQty: 120, reservedQty: 0, minThreshold: 15, status: "In Stock" },
        { name: "Premium Blue Box (M)", type: "Box", sku: "BOX-BLU-M", availableQty: 90, reservedQty: 0, minThreshold: 15, status: "In Stock" },
        { name: "Premium Blue Box (L)", type: "Box", sku: "BOX-BLU-L", availableQty: 60, reservedQty: 0, minThreshold: 10, status: "In Stock" },
        { name: "Gold Satin Ribbon", type: "Ribbon", sku: "RIB-GLD", availableQty: 400, reservedQty: 0, minThreshold: 50, status: "In Stock" },
        { name: "Navy Blue Ribbon", type: "Ribbon", sku: "RIB-NVY", availableQty: 350, reservedQty: 0, minThreshold: 50, status: "In Stock" },
        { name: "Crimson Red Ribbon", type: "Ribbon", sku: "RIB-RED", availableQty: 180, reservedQty: 0, minThreshold: 50, status: "In Stock" },
        { name: "Premium Gold Wrapping Paper", type: "Paper", sku: "WRP-GLD", availableQty: 140, reservedQty: 0, minThreshold: 20, status: "In Stock" },
        { name: "Romantic Floral Wrapping Paper", type: "Paper", sku: "WRP-FLR", availableQty: 95, reservedQty: 0, minThreshold: 20, status: "In Stock" },
        { name: "Brown Crinkle Paper Filler", type: "Filler", sku: "FIL-BRN", availableQty: 80, reservedQty: 0, minThreshold: 15, status: "In Stock" },
        { name: "Standard Greeting Card", type: "Card", sku: "CRD-STD", availableQty: 300, reservedQty: 0, minThreshold: 30, status: "In Stock" }
      ];
      await PackagingMaterial.bulkCreate(initialPackaging);
      console.log("Packaging materials pre-seeded.");
    }

    // Seed customer profiles if empty
    const profileCount = await CustomerProfile.count();
    if (profileCount === 0 && customerUser && corporateUser) {
      await CustomerProfile.create({
        userId: customerUser.id,
        phone: "+91 9876543210",
        address: "Flat 402, Signature Towers, Jubilee Hills, Hyderabad - 500033",
        favoriteColors: JSON.stringify(["#D4AF37", "#071A3D"]),
        favoriteCategories: JSON.stringify(["Jewelry", "Premium Gifts"]),
        preferredPackagingStyle: "Luxury"
      });
      await CustomerProfile.create({
        userId: corporateUser.id,
        phone: "+91 8080808080",
        address: "Building B3, Mindspace IT Park, Madhapur, Hyderabad - 500081",
        favoriteColors: JSON.stringify(["#071A3D", "#AAAA84"]),
        favoriteCategories: JSON.stringify(["Corporate Gifts", "Lifestyle Gifts"]),
        preferredPackagingStyle: "Corporate"
      });
      console.log("Customer profiles pre-seeded.");
    }

    // Seed default DesignApproval and ProductionStage for existing orders
    const existingOrders = await Order.findAll();
    for (let order of existingOrders) {
      const designCount = await DesignApproval.count({ where: { orderId: order.id } });
      if (designCount === 0) {
        let approvalStatus = "Draft Created";
        if (order.status === "Delivered") approvalStatus = "Final Approved";
        else if (order.status === "Dispatch") approvalStatus = "Approved";
        else if (order.status === "Quality Check") approvalStatus = "Approved";
        else if (order.status === "Packaging") approvalStatus = "Approved";
        else if (order.status === "Customization") approvalStatus = "Awaiting Customer Approval";

        await DesignApproval.create({
          orderId: order.id,
          status: approvalStatus,
          revisionNotes: null,
          history: JSON.stringify([
            { timestamp: new Date(order.createdAt || Date.now()).toISOString(), action: "Design Draft Created", note: "System generated AI layout draft." }
          ])
        });
      }

      const stageCount = await ProductionStage.count({ where: { orderId: order.id } });
      if (stageCount === 0) {
        const stages = ["Design", "Production", "Packaging", "Quality Check", "Dispatch", "Delivered"];
        const currentIdx = order.status === "Delivered" ? 5 :
                           order.status === "Dispatch" ? 4 :
                           order.status === "Quality Check" ? 3 :
                           order.status === "Packaging" ? 2 :
                           order.status === "Customization" ? 1 : 0;

        const employees = ["Ankit Sharma", "Prakash Raj", "Sunita Nair", "Vikram Rathore", "Kunal Roy", "Sameer Sen"];

        for (let i = 0; i < stages.length; i++) {
          let stageStatus = "Pending";
          let startDate = null;
          let completionDate = null;

          if (i < currentIdx) {
            stageStatus = "Completed";
            startDate = new Date(order.createdAt || Date.now());
            completionDate = new Date(order.createdAt || Date.now());
          } else if (i === currentIdx) {
            stageStatus = order.status === "Delivered" ? "Completed" : "In Progress";
            startDate = new Date(order.createdAt || Date.now());
            if (order.status === "Delivered") completionDate = new Date(order.createdAt || Date.now());
          }

          await ProductionStage.create({
            orderId: order.id,
            stage: stages[i],
            assignedEmployee: employees[i],
            startDate,
            completionDate,
            statusNotes: `Fulfillment operations for ${stages[i]} stage.`,
            status: stageStatus
          });
        }
      }
    }
    console.log("Design approvals and production stages synchronized for existing orders.");

    // Seed notifications if empty
    const notificationCount = await Notification.count();
    if (notificationCount === 0 && customerUser) {
      await Notification.bulkCreate([
        { userId: customerUser.id, type: "Design Approval Needed", message: "Your custom gift design draft for order #2 is ready for approval.", status: "Unread", channel: "In-App" },
        { userId: customerUser.id, type: "Production Update", message: "Production has started for your premium gift hamper order #2.", status: "Unread", channel: "WhatsApp" },
        { userId: customerUser.id, type: "Order Dispatched", message: "Good news! Your anniversary order #1 has been shipped via express delivery.", status: "Read", channel: "SMS" },
        { userId: customerUser.id, type: "Occasion Reminder", message: "Reminder: Vikram Malhotra's Birthday is coming up on June 25th. Tap to build a box!", status: "Unread", channel: "Email" }
      ]);
      console.log("Mock notifications pre-seeded.");
    }
  } catch (error) {
    console.error("Unable to initialize the database:", error);
  }
}

module.exports = {
  sequelize,
  initDb,
  User,
  Product,
  Order,
  OrderItem,
  Recipient,
  Return,
  Campaign,
  CRMContact,
  PackagingMaterial,
  DesignApproval,
  ProductionStage,
  CustomerProfile,
  Notification,
  PackagingBox,
  LayoutTemplate
};
