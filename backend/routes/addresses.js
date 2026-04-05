const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const {
  getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress,
} = require('../controllers/addressController');

router.get('/',                          protect, getAddresses);
router.post('/',                         protect, addAddress);
router.put('/:addressId',               protect, updateAddress);
router.delete('/:addressId',            protect, deleteAddress);
router.patch('/:addressId/default',     protect, setDefaultAddress);

module.exports = router;
