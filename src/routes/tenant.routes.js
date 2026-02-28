const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenant.controller');

router.post('/tenants', tenantController.createTenant);
router.get('/tenants', tenantController.getAllTenants);

module.exports = router;
