const User = require('../models/User');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const DeliveryPartner = require('../models/DeliveryPartner');
const Coupon = require('../models/Coupon');

exports.getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalOrders, totalRestaurants, totalMenuItems, activeDeliveryPartners] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Restaurant.countDocuments(),
      MenuItem.countDocuments(),
      User.countDocuments({ role: 'delivery_partner' })
    ]);

    const revenue = await Order.aggregate([
      { $match: { orderStatus: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } }
    ]);

    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const [todayOrders, todayRevenue] = await Promise.all([
      Order.countDocuments({ createdAt: { $gte: todayStart } }),
      Order.aggregate([
        { $match: { createdAt: { $gte: todayStart }, orderStatus: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$pricing.total' } } }
      ])
    ]);

    const pendingOrders = await Order.countDocuments({ orderStatus: { $in: ['placed', 'confirmed', 'preparing'] } });

    const recentOrders = await Order.find()
      .populate('user', 'name email avatar')
      .populate('restaurant', 'name image')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      totalUsers,
      totalOrders,
      totalRestaurants,
      totalMenuItems,
      activeDeliveryPartners,
      totalRevenue: revenue[0]?.total || 0,
      todayOrders,
      todayRevenue: todayRevenue[0]?.total || 0,
      pendingOrders,
      recentOrders
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRevenueAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const dailyRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, orderStatus: 'delivered' } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$pricing.total' },
        orders: { $sum: 1 },
        avgOrderValue: { $avg: '$pricing.total' }
      }},
      { $sort: { _id: 1 } }
    ]);

    const categoryBreakdown = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, orderStatus: 'delivered' } },
      { $unwind: '$items' },
      { $group: {
        _id: '$items.name',
        totalSold: { $sum: '$items.quantity' },
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
      }},
      { $sort: { revenue: -1 } },
      { $limit: 10 }
    ]);

    const paymentMethods = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, orderStatus: 'delivered' } },
      { $group: {
        _id: '$payment.method',
        count: { $sum: 1 },
        total: { $sum: '$pricing.total' }
      }}
    ]);

    res.json({ dailyRevenue, categoryBreakdown, paymentMethods });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOrderAnalytics = async (req, res) => {
  try {
    const statusDistribution = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
    ]);

    const hourlyOrders = await Order.aggregate([
      { $group: {
        _id: { $hour: '$createdAt' },
        count: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);

    const weeklyTrend = await Order.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
        revenue: { $sum: '$pricing.total' }
      }},
      { $sort: { _id: 1 } }
    ]);

    res.json({ statusDistribution, hourlyOrders, weeklyTrend });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPopularItems = async (req, res) => {
  try {
    const popularItems = await Order.aggregate([
      { $match: { orderStatus: 'delivered' } },
      { $unwind: '$items' },
      { $group: {
        _id: '$items.menuItem',
        name: { $first: '$items.name' },
        image: { $first: '$items.image' },
        totalOrdered: { $sum: '$items.quantity' },
        totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
      }},
      { $sort: { totalOrdered: -1 } },
      { $limit: 20 }
    ]);

    const topRestaurants = await Order.aggregate([
      { $match: { orderStatus: 'delivered' } },
      { $group: {
        _id: '$restaurant',
        orderCount: { $sum: 1 },
        revenue: { $sum: '$pricing.total' }
      }},
      { $sort: { orderCount: -1 } },
      { $limit: 10 },
      { $lookup: {
        from: 'restaurants',
        localField: '_id',
        foreignField: '_id',
        as: 'restaurant'
      }},
      { $unwind: '$restaurant' },
      { $project: {
        name: '$restaurant.name',
        image: '$restaurant.image',
        orderCount: 1,
        revenue: 1
      }}
    ]);

    res.json({ popularItems, topRestaurants });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOrderHeatmap = async (req, res) => {
  try {
    const heatmapData = await Order.aggregate([
      { $group: {
        _id: {
          day: { $dayOfWeek: '$createdAt' },
          hour: { $hour: '$createdAt' }
        },
        count: { $sum: 1 }
      }},
      { $sort: { '_id.day': 1, '_id.hour': 1 } }
    ]);

    res.json({ heatmapData });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    let query = {};
    if (role) query.role = role;
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await User.countDocuments(query);
    res.json({ users, total, pages: Math.ceil(total / parseInt(limit)), currentPage: parseInt(page) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    let query = {};
    if (status && status !== 'all') query.orderStatus = status;

    const orders = await Order.find(query)
      .populate('user', 'name email avatar')
      .populate('restaurant', 'name image')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Order.countDocuments(query);
    res.json({ orders, total, pages: Math.ceil(total / parseInt(limit)), currentPage: parseInt(page) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      { role: req.body.role }, 
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.toggleUserBan = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isBanned = !user.isBanned;
    await user.save();
    res.json({ message: user.isBanned ? 'User banned' : 'User unbanned', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndDelete(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    await MenuItem.deleteMany({ restaurant: req.params.id });
    res.json({ message: 'Restaurant and its menu items deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAIInsights = async (req, res) => {
  try {
    // Predict trends based on historical data
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const prev30Days = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

    const [currentPeriod, previousPeriod] = await Promise.all([
      Order.aggregate([
        { $match: { createdAt: { $gte: last30Days }, orderStatus: 'delivered' } },
        { $group: { _id: null, revenue: { $sum: '$pricing.total' }, orders: { $sum: 1 } } }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: prev30Days, $lt: last30Days }, orderStatus: 'delivered' } },
        { $group: { _id: null, revenue: { $sum: '$pricing.total' }, orders: { $sum: 1 } } }
      ])
    ]);

    const current = currentPeriod[0] || { revenue: 0, orders: 0 };
    const previous = previousPeriod[0] || { revenue: 0, orders: 0 };

    const revenueGrowth = previous.revenue > 0 ? ((current.revenue - previous.revenue) / previous.revenue * 100).toFixed(1) : 0;
    const orderGrowth = previous.orders > 0 ? ((current.orders - previous.orders) / previous.orders * 100).toFixed(1) : 0;

    // Top growing items
    const growingItems = await Order.aggregate([
      { $match: { createdAt: { $gte: last30Days } } },
      { $unwind: '$items' },
      { $group: {
        _id: '$items.name',
        count: { $sum: '$items.quantity' },
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
      }},
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Peak hours
    const peakHours = await Order.aggregate([
      { $match: { createdAt: { $gte: last30Days } } },
      { $group: { _id: { $hour: '$createdAt' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 3 }
    ]);

    const insights = [];
    if (parseFloat(revenueGrowth) > 0) {
      insights.push({ type: 'positive', title: 'Revenue Growing', message: `Revenue is up ${revenueGrowth}% compared to last month`, icon: '📈' });
    } else {
      insights.push({ type: 'warning', title: 'Revenue Declining', message: `Revenue is down ${Math.abs(revenueGrowth)}% compared to last month`, icon: '📉' });
    }

    if (growingItems.length > 0) {
      insights.push({ type: 'info', title: 'Top Dish', message: `"${growingItems[0]._id}" is the most popular item with ${growingItems[0].count} orders`, icon: '🔥' });
    }

    if (peakHours.length > 0) {
      insights.push({ type: 'info', title: 'Peak Hour', message: `Most orders come in at ${peakHours[0]._id}:00 hours`, icon: '⏰' });
    }

    insights.push({ type: 'tip', title: 'Recommendation', message: 'Consider running a promotion during off-peak hours to boost sales', icon: '💡' });

    res.json({
      revenueGrowth: parseFloat(revenueGrowth),
      orderGrowth: parseFloat(orderGrowth),
      currentRevenue: current.revenue,
      currentOrders: current.orders,
      growingItems,
      peakHours,
      insights
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
