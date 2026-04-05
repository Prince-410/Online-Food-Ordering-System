const Cart = require('../models/Cart');

// @desc  Get user cart
// @route GET /api/cart
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.menuItem', 'name price image isAvailable')
      .populate('restaurant', 'name image deliveryFee minOrder');
    if (!cart) return res.json({ items: [], restaurant: null });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Add or update item in cart
// @route POST /api/cart
exports.addToCart = async (req, res) => {
  try {
    const { menuItem, name, price, image, quantity, customizations, restaurantId } = req.body;
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({ user: req.user._id, restaurant: restaurantId, items: [] });
    }

    // Clear cart if switching restaurants
    if (cart.restaurant && cart.restaurant.toString() !== restaurantId) {
      cart.items = [];
      cart.restaurant = restaurantId;
    }

    const existingIdx = cart.items.findIndex(i => i.menuItem?.toString() === menuItem);
    if (existingIdx > -1) {
      cart.items[existingIdx].quantity += quantity || 1;
    } else {
      cart.items.push({ menuItem, name, price, image, quantity: quantity || 1, customizations: customizations || [] });
      if (!cart.restaurant) cart.restaurant = restaurantId;
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Update item quantity
// @route PUT /api/cart/:itemId
exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Item not found in cart' });

    if (quantity <= 0) {
      cart.items.pull({ _id: req.params.itemId });
    } else {
      item.quantity = quantity;
    }

    if (cart.items.length === 0) cart.restaurant = undefined;
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Remove item from cart
// @route DELETE /api/cart/:itemId
exports.removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    cart.items.pull({ _id: req.params.itemId });
    if (cart.items.length === 0) cart.restaurant = undefined;
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Apply coupon code
// @route POST /api/cart/coupon
exports.applyCoupon = async (req, res) => {
  try {
    const { couponCode } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    // Simple demo logic for coupons
    let discount = 0;
    const subtotal = cart.subtotal;

    if (couponCode === 'SAVE10') {
      discount = subtotal * 0.1;
    } else if (couponCode === 'SAVE20') {
      discount = subtotal * 0.2;
    } else if (couponCode === 'WELCOME50') {
      discount = Math.min(subtotal, 50);
    } else if (couponCode === '') {
      discount = 0;
    } else {
      return res.status(400).json({ message: 'Invalid coupon code' });
    }

    cart.discount = discount;
    cart.appliedCoupon = couponCode || null;
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Clear cart
// @route DELETE /api/cart
exports.clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate(
      { user: req.user._id }, 
      { items: [], restaurant: undefined, discount: 0, appliedCoupon: null }
    );
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
