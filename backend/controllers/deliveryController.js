const DeliveryPartner = require('../models/DeliveryPartner');
const Order = require('../models/Order');

// ─── GET /api/delivery/profile ───────────────────────────────────────────────
exports.getProfile = async (req, res) => {
  try {
    let partner = await DeliveryPartner.findOne({ user: req.user._id }).populate('activeOrder');
    if (!partner) {
      partner = await DeliveryPartner.create({ user: req.user._id });
    }
    res.json(partner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── PUT /api/delivery/availability ──────────────────────────────────────────
exports.toggleAvailability = async (req, res) => {
  try {
    const partner = await DeliveryPartner.findOne({ user: req.user._id });
    if (!partner) return res.status(404).json({ message: 'Profile not found' });
    partner.isAvailable = !partner.isAvailable;
    await partner.save();
    res.json({ isAvailable: partner.isAvailable });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── PUT /api/delivery/location ──────────────────────────────────────────────
exports.updateLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    await DeliveryPartner.findOneAndUpdate(
      { user: req.user._id },
      { currentLocation: { lat, lng, updatedAt: new Date() } }
    );

    // Broadcast location to order tracking
    const partner = await DeliveryPartner.findOne({ user: req.user._id });
    if (partner?.activeOrder) {
      const io = req.app.get('io');
      if (io) {
        io.to(partner.activeOrder.toString()).emit('deliveryLocation', { lat, lng });
      }
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── GET /api/delivery/pending-orders ────────────────────────────────────────
exports.getPendingOrders = async (req, res) => {
  try {
    const orders = await Order.find({ 
      orderStatus: 'preparing',
      deliveryPartner: { $exists: false }
    })
      .populate('user', 'name phone')
      .populate('restaurant', 'name address image')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── POST /api/delivery/accept/:orderId ──────────────────────────────────────
exports.acceptOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const partner = await DeliveryPartner.findOne({ user: req.user._id });
    if (!partner) return res.status(404).json({ message: 'Profile not found' });
    if (partner.isOnDelivery) return res.status(400).json({ message: 'Already on a delivery' });

    partner.isOnDelivery = true;
    partner.activeOrder = order._id;
    await partner.save();

    order.orderStatus = 'out_for_delivery';
    await order.save();

    const io = req.app.get('io');
    if (io) {
      io.to(order._id.toString()).emit('orderStatusUpdate', { orderId: order._id, status: 'out_for_delivery' });
      io.to(`user_${order.user.toString()}`).emit('orderStatusUpdate', { orderId: order._id, status: 'out_for_delivery' });
    }

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── POST /api/delivery/complete/:orderId ────────────────────────────────────
exports.completeDelivery = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const partner = await DeliveryPartner.findOne({ user: req.user._id });
    if (!partner) return res.status(404).json({ message: 'Profile not found' });

    order.orderStatus = 'delivered';
    order.payment.status = 'paid';
    order.payment.paidAt = new Date();
    await order.save();

    // Update partner stats
    const deliveryEarning = 40; // Base delivery earning
    partner.isOnDelivery = false;
    partner.activeOrder = null;
    partner.stats.totalDeliveries += 1;
    partner.stats.totalEarnings += deliveryEarning;
    partner.earnings.push({ orderId: order._id, amount: deliveryEarning });
    await partner.save();

    const io = req.app.get('io');
    if (io) {
      io.to(order._id.toString()).emit('orderStatusUpdate', { orderId: order._id, status: 'delivered' });
      io.to(`user_${order.user.toString()}`).emit('orderStatusUpdate', { orderId: order._id, status: 'delivered' });
    }

    res.json({ success: true, order, earnings: deliveryEarning });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── GET /api/delivery/earnings ──────────────────────────────────────────────
exports.getEarnings = async (req, res) => {
  try {
    const partner = await DeliveryPartner.findOne({ user: req.user._id });
    if (!partner) return res.status(404).json({ message: 'Profile not found' });

    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayEarnings = partner.earnings
      .filter(e => e.date >= todayStart)
      .reduce((sum, e) => sum + e.amount + (e.tip || 0), 0);

    const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - 7);
    const weekEarnings = partner.earnings
      .filter(e => e.date >= weekStart)
      .reduce((sum, e) => sum + e.amount + (e.tip || 0), 0);

    res.json({
      todayEarnings,
      weekEarnings,
      totalEarnings: partner.stats.totalEarnings,
      totalDeliveries: partner.stats.totalDeliveries,
      averageRating: partner.stats.averageRating,
      recentEarnings: partner.earnings.slice(-20).reverse()
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
