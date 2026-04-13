const userService = require('../services/user.service');

// 🔥 Create user
async function createUser(req, res, next) {
  try {
    const tenantId = req.tenant.id; // ✅ FIXED

    const { name, email, password, role } = req.body;

    const user = await userService.createUser(
      tenantId,
      name,
      email,
      password,
      role
    );

    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

// 🔥 Get users
async function getUsers(req, res, next) {
  try {
    const tenantId = req.tenant.id; // ✅ FIXED

    const users = await userService.getUsersByTenant(tenantId);

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createUser,
  getUsers,
};