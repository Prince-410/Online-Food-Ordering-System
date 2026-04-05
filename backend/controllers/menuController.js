const MenuItem = require('../models/MenuItem');

// @desc  Get menu for a restaurant
// @route GET /api/menu/:restaurantId
exports.getMenu = async (req, res) => {
  try {
    const { category } = req.query;
    let query = { restaurant: req.params.restaurantId };
    if (category) query.category = category;
    const items = await MenuItem.find(query).sort({ category: 1, name: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get single menu item
// @route GET /api/menu/item/:id
exports.getMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id).populate('restaurant', 'name');
    if (!item) return res.status(404).json({ message: 'Menu item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Create menu item
// @route POST /api/menu
exports.createMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Update menu item
// @route PUT /api/menu/:id
exports.updateMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: 'Menu item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Delete menu item
// @route DELETE /api/menu/:id
exports.deleteMenuItem = async (req, res) => {
  try {
    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Menu item deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get featured items across all restaurants
// @route GET /api/menu/featured
exports.getFeaturedItems = async (req, res) => {
  try {
    const items = await MenuItem.find({ isFeatured: true, isAvailable: true })
      .populate('restaurant', 'name image')
      .limit(12);
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
