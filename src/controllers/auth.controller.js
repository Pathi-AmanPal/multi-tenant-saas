const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const userService = require("../services/user.service");
const userRepository = require("../repositories/user.repository");
const refreshTokenRepository = require("../repositories/refreshToken.repository");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

async function login(req, res, next) {
  try {
    const tenantId = req.tenant.id;
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await userService.validateUser(tenantId, email, password);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate access token
    const accessToken = jwt.sign(
      {
        userId: user.id,
        tenantId: user.tenant_id,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Generate refresh token
    const refreshToken = crypto.randomBytes(40).toString("hex");

    // Hash refresh token
    const tokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    // Expiry (7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Store refresh token
    await refreshTokenRepository.createRefreshToken(
      user.id,
      user.tenant_id,
      tokenHash,
      expiresAt
    );

    res.json({
      success: true,
      accessToken,
      refreshToken,
    });

  } catch (error) {
    next(error);
  }
}

async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token required",
      });
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const storedToken = await refreshTokenRepository.findByTokenHash(tokenHash);

    if (!storedToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    if (new Date(storedToken.expires_at) < new Date()) {
      return res.status(401).json({
        success: false,
        message: "Refresh token expired",
      });
    }

    // Fetch user to restore role
    const user = await userRepository.findById(storedToken.user_id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists",
      });
    }

    const accessToken = jwt.sign(
      {
        userId: user.id,
        tenantId: user.tenant_id,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({
      success: true,
      accessToken,
    });

  } catch (error) {
    next(error);
  }
}

async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token required",
      });
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    await refreshTokenRepository.revokeToken(tokenHash);

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
  refresh,
  logout,
};