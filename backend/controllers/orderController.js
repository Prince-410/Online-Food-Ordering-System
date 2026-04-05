const Order = require('../models/Order');
const Cart = require('../models/Cart');

// ─── POST /api/orders/place ───────────────────────────────────────────────────
const placeOrder = async (req, res) => {
  try {
    const { deliveryAddress, paymentMethod, notes, razorpayOrderId } = req.body;

    // Validate required address fields
    const { fullName, phone, street, city, state, zip } = deliveryAddress || {};
    if (!fullName || !phone || !street || !city || !state || !zip) {
      return res.status(400).json({ message: 'Incomplete delivery address' });
    }

    // Fetch and populate cart
    const cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.menuItem',
      select: 'name price image restaurant',
    });

    if (!cart || !cart.items.length) {
      return res.status(400).json({ message: 'Your cart is empty' });
    }

    // Build order items from cart
    const items = cart.items.map((ci) => ({
      menuItem: ci.menuItem._id,
      name: ci.name || ci.menuItem.name,
      price: ci.price || ci.menuItem.price,
      image: ci.image || ci.menuItem.image || '',
      quantity: ci.quantity,
      customizations: ci.customizations || [],
    }));

    // Pricing (mirrors CartContext calculations)
    const subtotal = cart.subtotal ?? items.reduce((s, i) => s + i.price * i.quantity, 0);
    const discount = cart.discount || 0;
    const deliveryFee = 40;
    const tax = Math.round((subtotal - discount) * 0.05); // 5% GST
    const total = subtotal - discount + deliveryFee + tax;

    const restaurantId = cart.restaurant || cart.items[0].menuItem.restaurant;

    const order = await Order.create({
      user: req.user._id,
      restaurant: restaurantId,
      items,
      deliveryAddress: {
        label: deliveryAddress.label || 'Home',
        fullName: deliveryAddress.fullName,
        phone: deliveryAddress.phone,
        street: deliveryAddress.street,
        city: deliveryAddress.city,
        state: deliveryAddress.state,
        zip: deliveryAddress.zip,
      },
      pricing: { subtotal, discount, deliveryFee, tax, total },
      payment: {
        method: paymentMethod || 'razorpay',
        status: paymentMethod === 'cod' ? 'pending' : 'pending',
        razorpayOrderId: razorpayOrderId || null,
      },
      appliedCoupon: cart.appliedCoupon || null,
      estimatedDelivery: new Date(Date.now() + 45 * 60 * 1000), // +45 min
      notes: notes || '',
    });

    // Clear cart
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { items: [], discount: 0, appliedCoupon: null, restaurant: null }
    );

    res.status(201).json({ success: true, order });
  } catch (err) {
    console.error('Place order error:', err);
    res.status(500).json({ message: 'Failed to place order', error: err.message });
  }
};

// ─── GET /api/orders/my ────────────────────────────────────────────────────────
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('restaurant', 'name image');

    res.status(200).json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders', error: err.message });
  }
};

// ─── GET /api/orders/:id ──────────────────────────────────────────────────────
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
      .populate('restaurant', 'name image address');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    res.status(200).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch order', error: err.message });
  }
};

// ─── PATCH /api/orders/:id/cancel ─────────────────────────────────────────────
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (!['placed', 'confirmed'].includes(order.orderStatus)) {
      return res.status(400).json({ message: 'Order cannot be cancelled at this stage' });
    }

    order.orderStatus = 'cancelled';
    await order.save();

    res.status(200).json({ success: true, message: 'Order cancelled', order });
  } catch (err) {
    res.status(500).json({ message: 'Failed to cancel order', error: err.message });
  }
};

// ─── PATCH /api/orders/:id/status (Admin) ───────────────────────────────────
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    order.orderStatus = status;
    await order.save();
    
    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(order._id.toString()).emit('orderStatusUpdate', { orderId: order._id, status });
    }
    
    res.status(200).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update order status', error: err.message });
  }
};

module.exports = { placeOrder, getUserOrders, getOrderById, cancelOrder, updateOrderStatus };
