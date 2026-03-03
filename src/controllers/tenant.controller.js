const tenantService = require('../services/tenant.service');

async function createTenant(req, res, next) {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Tenant name is required'
      });
    }

    const tenant = await tenantService.createTenant(name);

    res.status(201).json({
      success: true,
      data: tenant
    });

  } catch (error) {
    next(error);
  }
}

async function getAllTenants(req, res, next) {
  try {
    const tenants = await tenantService.getAllTenants();

    res.json({
      success: true,
      data: tenants
    });

  } catch (error) {
    next(error);
  }
}



module.exports = {
  createTenant,
  getAllTenants  
};