// middleware/validateEggSize.js

// Middleware function to validate eggSize
const validateEggSize = (req, res, next) => {
  // Check if eggSize is provided in the request body
  if (!req.body.eggSize) {
    return res.status(400).json({ error: 'Egg size is required' });
  }

  // Check if eggSize is a number
  const eggSize = parseInt(req.body.eggSize);
  if (isNaN(eggSize)) {
    return res.status(400).json({ error: 'Egg size must be a number' });
  }

  // Check if eggSize is between 1 and 6
  if (eggSize < 1 || eggSize > 6) {
    return res.status(400).json({ error: 'Egg size must be between 1 and 6' });
  }

  // If all validations pass, call next to proceed to the next middleware or route handler
  next();
};

module.exports = validateEggSize;
