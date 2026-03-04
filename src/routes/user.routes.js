const express = require('express');
const router = express.Router();

const authorizeRole = require('../middleware/rbac.middleware');
const validate = require('../middleware/validate.middleware');
const { createUserSchema } = require('../validators/user.validator');
const authMiddleware = require('../middleware/auth.middleware');

const userController = require('../controllers/user.controller');

router.post(
  '/',
  authMiddleware,
  authorizeRole('ADMIN'),
  validate(createUserSchema),
  userController.createUser
);

router.get(
  '/',
  authMiddleware,
  authorizeRole('ADMIN', 'USER'),
  userController.getUsers
);

module.exports = router;