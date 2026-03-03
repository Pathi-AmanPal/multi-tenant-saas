const userRepository = require('../repositories/user.repository');

async function createUser(tenantId, name, email, role) {
  if (!name || !email) {
    const error = new Error('Name and email are required');
    error.statusCode = 400;
    throw error;
  }

  return await userRepository.createUser(
    tenantId,
    name,
    email,
    role
  );
}

async function getUsersByTenant(tenantId) {
  return await userRepository.getUsersByTenant(tenantId);
}

module.exports = {
  createUser,
  getUsersByTenant
};
