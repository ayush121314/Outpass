const express = require('express');
const { loginAdmin,getadmindata,updateOutpassStatus,getoutpass } = require('../controllers/adminController');
const authadmin = require('../middlewares/authadmin');

const router = express.Router();

// POST /api/admin/login
router.post('/login', loginAdmin);
router.get('/get-admin-data', authadmin,getadmindata );
router.get('/outpass-requests',getoutpass);
router.put('/outpass-requested/:_id', updateOutpassStatus);

module.exports = router;
