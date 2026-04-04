const express = require('express');
const router = express.Router();

const authorizeRole = require('../middleware/rbac.middleware');
const validate = require('../middleware/validate.middleware');
const { createUserSchema } = require('../validators/user.validator');

const userController = require('../controllers/user.controller');

// 🔥 Create user (ADMIN only)
router.post(
  '/',
  authorizeRole('admin'), // ✅ fixed casing
  validate(createUserSchema),
  userController.createUser
);

// 🔥 Get users
router.get(
  '/',
  authorizeRole('admin', 'user'),
  userController.getUsers
);

module.exports = router;