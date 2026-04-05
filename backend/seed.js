const mongoose = require('mongoose');
const Restaurant = require('./models/Restaurant');
const MenuItem = require('./models/MenuItem');
const User = require('./models/User');
const Coupon = require('./models/Coupon');

const seedData = async () => {
  try {
    await Restaurant.deleteMany({});
    await MenuItem.deleteMany({});
    await Coupon.deleteMany({});

    // Check if admin exists, if not create
    let admin = await User.findOne({ email: 'admin@cravebite.com' });
    if (!admin) {
      admin = await User.create({
        name: 'Admin',
        email: 'admin@cravebite.com',
        password: 'admin123',
        role: 'admin',
        phone: '9999999999'
      });
      console.log('👤 Admin user created: admin@cravebite.com / admin123');
    }

    const restaurants = await Restaurant.insertMany([
      {
        name: 'The Spice Garden',
        description: 'Authentic Indian cuisine with rich curries and tandoor specialties. Our chefs use traditional recipes passed down through generations.',
        cuisines: ['Indian', 'North Indian', 'Mughlai'],
        image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400',
        coverImage: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800',
        address: { street: '12 MG Road', city: 'Bangalore', state: 'KA', zip: '560001', coordinates: { lat: 12.9716, lng: 77.5946 } },
        rating: 4.5, totalRatings: 234, deliveryTime: '30-45 min', deliveryFee: 30, minOrder: 200,
        isOpen: true, tags: ['Popular', 'Trending', 'Pure Veg Options']
      },
      {
        name: 'Burger Junction',
        description: 'Gourmet burgers crafted with premium ingredients and our signature secret sauces. Every bite is an experience.',
        cuisines: ['American', 'Fast Food', 'Burgers'],
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
        coverImage: 'https://images.unsplash.com/photo-1550317138-10000687a72b?w=800',
        address: { street: '45 Brigade Road', city: 'Bangalore', state: 'KA', zip: '560025', coordinates: { lat: 12.9717, lng: 77.6100 } },
        rating: 4.3, totalRatings: 187, deliveryTime: '20-35 min', deliveryFee: 25, minOrder: 150,
        isOpen: true, tags: ['Fast Delivery', 'Best Seller']
      },
      {
        name: 'Sakura Japanese',
        description: 'Premium sushi, ramen, and Japanese delicacies. Authentic flavors from Tokyo to your doorstep.',
        cuisines: ['Japanese', 'Asian', 'Sushi'],
        image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400',
        coverImage: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=800',
        address: { street: '8 Indiranagar', city: 'Bangalore', state: 'KA', zip: '560038', coordinates: { lat: 12.9784, lng: 77.6408 } },
        rating: 4.7, totalRatings: 312, deliveryTime: '40-55 min', deliveryFee: 50, minOrder: 500,
        isOpen: true, tags: ['Premium', 'Best Rated', 'Fine Dining']
      },
      {
        name: 'Pizza Paradise',
        description: 'Wood-fired authentic Italian pizzas with fresh, locally-sourced ingredients and imported cheese.',
        cuisines: ['Italian', 'Pizza', 'Pasta'],
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
        coverImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
        address: { street: '22 Koramangala', city: 'Bangalore', state: 'KA', zip: '560034', coordinates: { lat: 12.9352, lng: 77.6245 } },
        rating: 4.4, totalRatings: 256, deliveryTime: '25-40 min', deliveryFee: 20, minOrder: 300,
        isOpen: true, tags: ['Top Rated', 'Family Favourite']
      },
      {
        name: 'Dragon Palace',
        description: 'Authentic Chinese cuisine with handmade dim sum, wok-tossed noodles, and roasted meats.',
        cuisines: ['Chinese', 'Asian', 'Dim Sum'],
        image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400',
        coverImage: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=800',
        address: { street: '67 Whitefield', city: 'Bangalore', state: 'KA', zip: '560066', coordinates: { lat: 12.9698, lng: 77.7500 } },
        rating: 4.2, totalRatings: 143, deliveryTime: '35-50 min', deliveryFee: 35, minOrder: 250,
        isOpen: true, tags: ['New', 'Spicy']
      },
      {
        name: 'Mediterranean Breeze',
        description: 'Fresh Mediterranean flavors — kebabs, falafels, hummus, and vibrant mezze plates.',
        cuisines: ['Mediterranean', 'Middle Eastern', 'Healthy'],
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400',
        coverImage: 'https://images.unsplash.com/photo-1530469912745-a215c6b256ea?w=800',
        address: { street: '3 HSR Layout', city: 'Bangalore', state: 'KA', zip: '560102', coordinates: { lat: 12.9116, lng: 77.6389 } },
        rating: 4.6, totalRatings: 198, deliveryTime: '30-45 min', deliveryFee: 40, minOrder: 350,
        isOpen: true, tags: ['Healthy', 'Popular', 'Veg Friendly']
      },
      {
        name: 'Café Mocha',
        description: 'Artisanal coffee, fresh pastries, sandwiches, and all-day breakfast in a cozy setting.',
        cuisines: ['Café', 'Continental', 'Breakfast'],
        image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400',
        coverImage: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800',
        address: { street: '15 Church Street', city: 'Bangalore', state: 'KA', zip: '560001', coordinates: { lat: 12.9750, lng: 77.6040 } },
        rating: 4.5, totalRatings: 289, deliveryTime: '15-25 min', deliveryFee: 15, minOrder: 100,
        isOpen: true, tags: ['Café', 'Quick Bites', 'Breakfast']
      },
      {
        name: 'Tandoori Nights',
        description: 'Smoky tandoor flavors with juicy kebabs, naan, and rich gravies cooked to perfection.',
        cuisines: ['Indian', 'Tandoor', 'Kebabs'],
        image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400',
        coverImage: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800',
        address: { street: '91 JP Nagar', city: 'Bangalore', state: 'KA', zip: '560078', coordinates: { lat: 12.9063, lng: 77.5857 } },
        rating: 4.3, totalRatings: 176, deliveryTime: '35-50 min', deliveryFee: 30, minOrder: 250,
        isOpen: true, tags: ['Trending', 'Non-Veg Special']
      }
    ]);

    const menuItems = [];

    // The Spice Garden  
    const r1 = restaurants[0]._id;
    menuItems.push(
      { restaurant: r1, name: 'Butter Chicken', description: 'Creamy tomato-based chicken curry with aromatic spices', price: 280, originalPrice: 320, category: 'Main Course', isVeg: false, isFeatured: true, spiceLevel: 'medium', rating: 4.6, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=300', tags: ['Bestseller'] },
      { restaurant: r1, name: 'Paneer Tikka Masala', description: 'Cottage cheese in rich spiced tomato gravy', price: 240, category: 'Main Course', isVeg: true, isFeatured: true, spiceLevel: 'medium', rating: 4.5, image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300', tags: ['Popular'] },
      { restaurant: r1, name: 'Dal Makhani', description: 'Slow-cooked black lentils with butter and cream', price: 180, category: 'Main Course', isVeg: true, spiceLevel: 'mild', rating: 4.4, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300' },
      { restaurant: r1, name: 'Garlic Naan', description: 'Soft tandoor bread with garlic and butter', price: 60, category: 'Breads', isVeg: true, rating: 4.3, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300' },
      { restaurant: r1, name: 'Chicken Biryani', description: 'Fragrant basmati rice with tender chicken and saffron', price: 320, originalPrice: 380, category: 'Rice', isVeg: false, isFeatured: true, spiceLevel: 'hot', rating: 4.7, image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=300', tags: ['Must Try'] },
      { restaurant: r1, name: 'Mango Lassi', description: 'Chilled mango yoghurt drink', price: 80, category: 'Beverages', isVeg: true, rating: 4.2, image: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=300' },
      { restaurant: r1, name: 'Gulab Jamun', description: 'Deep-fried milk solids soaked in sugar syrup', price: 100, category: 'Desserts', isVeg: true, rating: 4.5, image: 'https://images.unsplash.com/photo-1666190073498-d9ef94255ec2?w=300' },
      { restaurant: r1, name: 'Tandoori Chicken', description: 'Smoky clay oven roasted chicken with yogurt marinade', price: 350, category: 'Starters', isVeg: false, spiceLevel: 'hot', rating: 4.6, image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=300', tags: ['Spicy'] }
    );

    // Burger Junction
    const r2 = restaurants[1]._id;
    menuItems.push(
      { restaurant: r2, name: 'Classic Cheeseburger', description: 'Double patty with cheddar cheese and secret sauce', price: 250, originalPrice: 300, category: 'Burgers', isVeg: false, isFeatured: true, rating: 4.5, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300', tags: ['Bestseller'] },
      { restaurant: r2, name: 'Veggie Supreme Burger', description: 'Crispy veggie patty with fresh greens and avocado', price: 200, category: 'Burgers', isVeg: true, isFeatured: true, rating: 4.3, image: 'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=300' },
      { restaurant: r2, name: 'BBQ Bacon Burger', description: 'Smoky BBQ sauce, crispy bacon, onion rings', price: 320, category: 'Burgers', isVeg: false, spiceLevel: 'medium', rating: 4.4, image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=300' },
      { restaurant: r2, name: 'Loaded Cheese Fries', description: 'Crispy fries with cheese sauce and jalapeños', price: 150, category: 'Sides', isVeg: true, rating: 4.2, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300' },
      { restaurant: r2, name: 'Onion Rings', description: 'Golden crispy battered onion rings', price: 120, category: 'Sides', isVeg: true, rating: 4.0, image: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=300' },
      { restaurant: r2, name: 'Chocolate Milkshake', description: 'Thick and creamy Belgian chocolate shake', price: 180, category: 'Beverages', isVeg: true, rating: 4.6, image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=300' }
    );

    // Sakura Japanese
    const r3 = restaurants[2]._id;
    menuItems.push(
      { restaurant: r3, name: 'Salmon Sushi Set', description: '8-piece salmon nigiri and maki rolls', price: 650, category: 'Sushi', isVeg: false, isFeatured: true, rating: 4.8, image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=300', tags: ['Premium'] },
      { restaurant: r3, name: 'Tonkotsu Ramen', description: 'Rich pork bone broth with chashu, egg, and noodles', price: 480, category: 'Ramen', isVeg: false, isFeatured: true, spiceLevel: 'medium', rating: 4.7, image: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=300' },
      { restaurant: r3, name: 'Vegetable Tempura', description: 'Lightly battered and crispy seasonal vegetables', price: 350, category: 'Appetizers', isVeg: true, rating: 4.4, image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=300' },
      { restaurant: r3, name: 'Matcha Ice Cream', description: 'Premium Japanese green tea ice cream', price: 220, category: 'Desserts', isVeg: true, rating: 4.5, image: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=300' },
      { restaurant: r3, name: 'Gyoza', description: 'Pan-fried Japanese dumplings with dipping sauce', price: 280, category: 'Appetizers', isVeg: false, rating: 4.3, image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=300' }
    );

    // Pizza Paradise
    const r4 = restaurants[3]._id;
    menuItems.push(
      { restaurant: r4, name: 'Margherita Pizza', description: 'Classic tomato sauce, fresh mozzarella, basil', price: 380, category: 'Pizzas', isVeg: true, isFeatured: true, rating: 4.5, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300' },
      { restaurant: r4, name: 'Pepperoni Pizza', description: 'Loaded pepperoni on spicy tomato base with cheese', price: 450, originalPrice: 520, category: 'Pizzas', isVeg: false, isFeatured: true, rating: 4.6, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300', tags: ['Bestseller'] },
      { restaurant: r4, name: 'Garlic Bread', description: 'Toasted baguette with herb butter and cheese', price: 150, category: 'Sides', isVeg: true, rating: 4.1, image: 'https://images.unsplash.com/photo-1568624586149-47f26e9d79f3?w=300' },
      { restaurant: r4, name: 'Tiramisu', description: 'Classic Italian coffee-soaked ladyfingers with mascarpone', price: 280, category: 'Desserts', isVeg: true, rating: 4.7, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=300' },
      { restaurant: r4, name: 'Pasta Carbonara', description: 'Creamy egg and parmesan sauce with crispy pancetta', price: 350, category: 'Pasta', isVeg: false, rating: 4.4, image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=300' }
    );

    // Dragon Palace
    const r5 = restaurants[4]._id;
    menuItems.push(
      { restaurant: r5, name: 'Kung Pao Chicken', description: 'Wok-tossed chicken with peanuts and chili', price: 280, category: 'Main Course', isVeg: false, isFeatured: true, spiceLevel: 'hot', rating: 4.3, image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=300' },
      { restaurant: r5, name: 'Hakka Noodles', description: 'Stir-fried noodles with vegetables and soy', price: 200, category: 'Noodles', isVeg: true, rating: 4.2, image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300' },
      { restaurant: r5, name: 'Dim Sum Platter', description: 'Assorted steamed dumplings with dipping sauces', price: 380, category: 'Dim Sum', isVeg: false, isFeatured: true, rating: 4.5, image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=300', tags: ['Must Try'] },
      { restaurant: r5, name: 'Manchurian', description: 'Crispy veg balls in tangy manchurian sauce', price: 180, category: 'Starters', isVeg: true, spiceLevel: 'medium', rating: 4.1, image: 'https://images.unsplash.com/photo-1645696301019-35adcc18fc89?w=300' }
    );

    // Mediterranean Breeze
    const r6 = restaurants[5]._id;
    menuItems.push(
      { restaurant: r6, name: 'Falafel Wrap', description: 'Crispy falafel with hummus, tahini, and fresh veggies', price: 220, category: 'Wraps', isVeg: true, isFeatured: true, rating: 4.5, image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=300' },
      { restaurant: r6, name: 'Shawarma Plate', description: 'Tender marinated chicken with rice and garlic sauce', price: 300, category: 'Main Course', isVeg: false, isFeatured: true, rating: 4.6, image: 'https://images.unsplash.com/photo-1561651188-d207bbec4ec3?w=300', tags: ['Bestseller'] },
      { restaurant: r6, name: 'Mezze Platter', description: 'Hummus, baba ganoush, tabbouleh, and pita', price: 350, category: 'Starters', isVeg: true, rating: 4.4, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300' },
      { restaurant: r6, name: 'Baklava', description: 'Layers of filo pastry with nuts and honey syrup', price: 180, category: 'Desserts', isVeg: true, rating: 4.3, image: 'https://images.unsplash.com/photo-1519676867240-f03562e64548?w=300' }
    );

    // Café Mocha
    const r7 = restaurants[6]._id;
    menuItems.push(
      { restaurant: r7, name: 'Cappuccino', description: 'Rich espresso with velvety steamed milk foam', price: 150, category: 'Coffee', isVeg: true, isFeatured: true, rating: 4.5, image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=300' },
      { restaurant: r7, name: 'Avocado Toast', description: 'Sourdough with smashed avocado, egg, and seeds', price: 250, category: 'Breakfast', isVeg: true, rating: 4.4, image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=300' },
      { restaurant: r7, name: 'Club Sandwich', description: 'Triple-decker with chicken, bacon, lettuce, and mayo', price: 280, category: 'Sandwiches', isVeg: false, isFeatured: true, rating: 4.3, image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=300' },
      { restaurant: r7, name: 'Chocolate Brownie', description: 'Warm fudgy brownie with vanilla ice cream', price: 200, category: 'Desserts', isVeg: true, rating: 4.6, image: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=300' }
    );

    // Tandoori Nights
    const r8 = restaurants[7]._id;
    menuItems.push(
      { restaurant: r8, name: 'Seekh Kebab', description: 'Minced lamb kebabs with aromatic spices from the tandoor', price: 320, category: 'Starters', isVeg: false, isFeatured: true, spiceLevel: 'hot', rating: 4.5, image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=300' },
      { restaurant: r8, name: 'Paneer Tikka', description: 'Marinated cottage cheese cubes grilled in tandoor', price: 260, category: 'Starters', isVeg: true, isFeatured: true, rating: 4.4, image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=300' },
      { restaurant: r8, name: 'Mutton Rogan Josh', description: 'Aromatic Kashmiri lamb curry with fennel and cardamom', price: 400, category: 'Main Course', isVeg: false, spiceLevel: 'medium', rating: 4.6, image: 'https://images.unsplash.com/photo-1545247181-516773cae754?w=300', tags: ['Chef Special'] },
      { restaurant: r8, name: 'Butter Naan', description: 'Soft tandoor-baked bread brushed with butter', price: 50, category: 'Breads', isVeg: true, rating: 4.2, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300' }
    );

    await MenuItem.insertMany(menuItems);

    // Seed coupons
    const oneMonthFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await Coupon.insertMany([
      {
        code: 'WELCOME50', description: 'Welcome offer! Flat ₹50 off on your first order',
        discountType: 'flat', discountValue: 50, minOrderAmount: 200,
        validUntil: oneMonthFromNow, userRestrictions: { newUsersOnly: true, maxUsesPerUser: 1 }
      },
      {
        code: 'SAVE20', description: '20% off on orders above ₹500',
        discountType: 'percentage', discountValue: 20, minOrderAmount: 500, maxDiscount: 150,
        validUntil: oneMonthFromNow
      },
      {
        code: 'CRAVE100', description: 'Flat ₹100 off on orders above ₹600',
        discountType: 'flat', discountValue: 100, minOrderAmount: 600,
        validUntil: oneMonthFromNow
      },
      {
        code: 'FEAST30', description: '30% off up to ₹200 on orders above ₹800',
        discountType: 'percentage', discountValue: 30, minOrderAmount: 800, maxDiscount: 200,
        validUntil: oneMonthFromNow
      }
    ]);

    console.log(`✅ Seed data inserted: ${restaurants.length} restaurants, ${menuItems.length} menu items, 4 coupons`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
};

require('dotenv').config();
require('./config/db')().then(seedData);
