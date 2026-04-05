const User = require('../models/User');

// ─── GET /api/addresses ───────────────────────────────────────────────────────
const getAddresses = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('addresses');
        res.status(200).json({ success: true, addresses: user.addresses });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch addresses', error: err.message });
    }
};

// ─── POST /api/addresses ──────────────────────────────────────────────────────
const addAddress = async (req, res) => {
    try {
        const { label, fullName, phone, street, city, state, zip, isDefault } = req.body;

        if (!street || !city || !state || !zip) {
            return res.status(400).json({ message: 'street, city, state and zip are required' });
        }

        const user = await User.findById(req.user._id);

        // If new address is default, unset previous default
        if (isDefault) {
            user.addresses.forEach((a) => (a.isDefault = false));
        }

        // If first address, make it default automatically
        const makeDefault = isDefault || user.addresses.length === 0;

        user.addresses.push({ label: label || 'Home', fullName, phone, street, city, state, zip, isDefault: makeDefault });
        await user.save();

        res.status(201).json({ success: true, addresses: user.addresses });
    } catch (err) {
        res.status(500).json({ message: 'Failed to add address', error: err.message });
    }
};

// ─── PUT /api/addresses/:addressId ───────────────────────────────────────────
const updateAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const addr = user.addresses.id(req.params.addressId);
        if (!addr) return res.status(404).json({ message: 'Address not found' });

        const { label, fullName, phone, street, city, state, zip, isDefault } = req.body;

        if (isDefault) user.addresses.forEach((a) => (a.isDefault = false));

        if (label) addr.label = label;
        if (fullName) addr.fullName = fullName;
        if (phone) addr.phone = phone;
        if (street) addr.street = street;
        if (city) addr.city = city;
        if (state) addr.state = state;
        if (zip) addr.zip = zip;
        if (isDefault !== undefined) addr.isDefault = isDefault;

        await user.save();
        res.status(200).json({ success: true, addresses: user.addresses });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update address', error: err.message });
    }
};

// ─── DELETE /api/addresses/:addressId ────────────────────────────────────────
const deleteAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const addr = user.addresses.id(req.params.addressId);
        if (!addr) return res.status(404).json({ message: 'Address not found' });

        addr.deleteOne();

        // If deleted address was default, make first remaining address default
        if (addr.isDefault && user.addresses.length > 0) {
            user.addresses[0].isDefault = true;
        }

        await user.save();
        res.status(200).json({ success: true, addresses: user.addresses });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete address', error: err.message });
    }
};

// ─── PATCH /api/addresses/:addressId/default ─────────────────────────────────
const setDefaultAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.addresses.forEach((a) => (a.isDefault = a._id.toString() === req.params.addressId));
        await user.save();
        res.status(200).json({ success: true, addresses: user.addresses });
    } catch (err) {
        res.status(500).json({ message: 'Failed to set default address', error: err.message });
    }
};

module.exports = { getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress };
