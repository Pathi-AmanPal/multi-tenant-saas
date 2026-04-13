const tenantRepository = require('../repositories/tenant.repository');

async function createTenant(name) {
  try {
    const existingTenant = await tenantRepository.findByName(name);

    if (existingTenant) {
      const error = new Error('Tenant already exists');
      error.statusCode = 400;
      throw error;
    }

    return await tenantRepository.createTenant(name);

  } catch (error) {
    if (error.code === '23505') {
      const err = new Error('Tenant already exists');
      err.statusCode = 400;
      throw err;
    }

    throw error;
  }
}

async function getAllTenants() {
  return await tenantRepository.getAllTenants();
}

module.exports = {
  createTenant,
  getAllTenants  
};