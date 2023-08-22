const { Router } = require('express');
const { updateLot, getLots } = require('../controllers/admin.controller');
const {
  authenticateJWT,
  authorizeAdmin,
} = require('../middlewares/jwtValidator');

const router = Router();

router.use('/', authenticateJWT, authorizeAdmin);
router.put('/', updateLot);
router.get('/', getLots);

module.exports = router;
