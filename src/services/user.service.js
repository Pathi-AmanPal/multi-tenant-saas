const bcrypt = require('bcrypt');
const userRepository = require('../repositories/user.repository');

const SALT_ROUNDS = 10;

async function createUser(tenantId, name, email, password, role = 'user') {
  if (!name || !email || !password) {
    const error = new Error('Name, email, and password are required');
    error.statusCode = 400;
    throw error;
  }

  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    return await userRepository.createUser(
      tenantId,
      name,
      email,
      hashedPassword,
      role
    );
  } catch (error) {
    if (error.code === '23505') {
      const err = new Error('Email already exists for this tenant');
      err.statusCode = 400;
      throw err;
    }
    throw error;
  }
}

async function getUsersByTenant(tenantId) {
  return await userRepository.getUsersByTenant(tenantId);
}

async function validateUser(tenantId, email, password) {
  const user = await userRepository.findByEmailAndTenant(tenantId, email);

  if (!user) return null;

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) return null;

  delete user.password; // 🔥 IMPORTANT

  return user;
}

module.exports = {
  createUser,
  getUsersByTenant,
  validateUser,
};