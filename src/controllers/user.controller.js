const userService = require('../services/user.service');

async function createUser(req, res, next) {
  try {
    const tenantId = req.tenant.id;   // injected by tenant middleware
    const { name, email, role } = req.body;

    const user = await userService.createUser(
      tenantId,
      name,
      email,
      role
    );

    res.status(201).json({
      success: true,
      data: user
    });

  } catch (error) {
    next(error);
  }
}

async function getUsers(req, res, next) {
  try {
    const tenantId = req.tenant.id;

    const users = await userService.getUsersByTenant(tenantId);

    res.json({
      success: true,
      data: users
    });

  } catch (error) {
    next(error);
  }
}

module.exports = {
  createUser,
  getUsers
};
