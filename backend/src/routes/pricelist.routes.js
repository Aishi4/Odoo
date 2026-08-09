const express = require('express');
const router = express.Router();
const controller = require('../controllers/pricelist.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');

router.use(authenticateToken);
router.use(authorizeRoles('ADMIN', 'VENDOR'));

router.get('/', controller.getAllPricelists);
router.get('/:id', controller.getPricelistById);
router.post('/', controller.createPricelist);
router.put('/:id', controller.updatePricelist);
router.delete('/:id', controller.deletePricelist);

router.post('/:id/rules', controller.addRule);
router.delete('/:id/rules/:ruleId', controller.deleteRule);
router.post('/calculate-price', controller.calculatePrice);

module.exports = router;
