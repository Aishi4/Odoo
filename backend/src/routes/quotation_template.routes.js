const express = require('express');
const router = express.Router();
const controller = require('../controllers/quotation_template.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');

router.use(authenticateToken);
router.use(authorizeRoles('ADMIN', 'VENDOR'));

router.get('/', controller.getAllTemplates);
router.get('/:id', controller.getTemplateById);
router.post('/', controller.createTemplate);
router.put('/:id', controller.updateTemplate);
router.delete('/:id', controller.deleteTemplate);

module.exports = router;
