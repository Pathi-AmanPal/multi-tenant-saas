const express = require('express');
const router = express.Router();

router.get('/whoami', (req, res) => {
  res.json({
    success: true,
    tenant: req.tenant
  });
});

module.exports = router;
