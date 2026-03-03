const bcrypt = require('bcrypt');
const userRepository = require('../repositories/user.repository');

const SALT_ROUNDS = 10;

async function createUser(tenantId, name, email, password, role) {
  if (!name || !email || !password) {
    const error = new Error('Name, email, and password are required');
    error.statusCode = 400;
    throw error;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  return await userRepository.createUser(
    tenantId,
    name,
    email,
    hashedPassword,
    role
  );
}

async function getUsersByTenant(tenantId) {
  return await userRepository.getUsersByTenant(tenantId);
}

async function validateUser(tenantId, email, password) {
  const user = await userRepository.findByEmailAndTenant(tenantId, email);

  if (!user) return null;

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) return null;

  return user;
}

module.exports = {
  createUser,
  getUsersByTenant,
  validateUser
};