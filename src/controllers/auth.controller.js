const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const userService = require("../services/user.service");
const userRepository = require("../repositories/user.repository");
const refreshTokenRepository = require("../repositories/refreshToken.repository");

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is required");
}

const JWT_SECRET = process.env.JWT_SECRET;

// 🔐 LOGIN
async function login(req, res, next) {
  try {
    const tenantId = req.tenant.id;
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // ✅ normalize email
    email = email.toLowerCase().trim();

    const user = await userService.validateUser(tenantId, email, password);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
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

    const refreshToken = crypto.randomBytes(40).toString("hex");

    const tokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

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

// 🔁 REFRESH (ROTATION IMPLEMENTED)
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

    if (!storedToken || storedToken.revoked) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    if (new Date(storedToken.expires_at) < new Date()) {
      await refreshTokenRepository.revokeToken(tokenHash);
      return res.status(401).json({
        success: false,
        message: "Refresh token expired",
      });
    }

    const user = await userRepository.findById(
      storedToken.user_id,
      storedToken.tenant_id
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists",
      });
    }

    // 🔥 ROTATION START
    await refreshTokenRepository.revokeToken(tokenHash);

    const newRefreshToken = crypto.randomBytes(40).toString("hex");

    const newHash = crypto
      .createHash("sha256")
      .update(newRefreshToken)
      .digest("hex");

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await refreshTokenRepository.createRefreshToken(
      user.id,
      user.tenant_id,
      newHash,
      expiresAt
    );

    // 🔥 ROTATION END

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
      refreshToken: newRefreshToken,
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