const validator = require("validator");

const validatePasswordReset = (password, confirmPassword) => {
  if (!password || !confirmPassword) {
    return "Password and confirmation password are required.";
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  }

  if (password !== confirmPassword) {
    return "Passwords do not match.";
  }

  // You can add more validation rules here
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (!(hasUppercase && hasLowercase && hasNumber && hasSpecialChar)) {
    return "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.";
  }

  return null;
};
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const REQUIRED_ORDERS_KEYS = [
  "ship_from",
  "ship_to",
  "category",
  "quantity",
  "markup",
  "price",
];

const validateRegistration = (username, email, password, role, vat) => {
  if (role === "Company") {
    if (!username || !email || !password || !role || !vat) {
      return "All fields are required.";
    }
  } else if (!username || !email || !password || !role) {
    return "All fields are required.";
  }

  if (!emailRegex.test(email)) {
    return "Invalid email format.";
  }

  if (password.length < 6) {
    return "Password must be at least 6 characters.";
  }

  return null;
};

const validateLogin = (email, password) => {
  if (!email || !password) {
    return "Email and password are required.";
  }

  if (!emailRegex.test(email)) {
    return "Invalid email format.";
  }

  return null;
};

const validateOrderItems = (orders) => {
  const errors = {};

  // Iterate over orders and check for missing keys
  for (let i = 0; i < orders.length; i++) {
    const order = orders[i];
    for (const key of REQUIRED_ORDERS_KEYS) {
      if (!order[key]) {
        // If the key is missing, track it in the errors object
        if (!errors[key]) {
          errors[key] = 0;
        }
        errors[key]++;
      }
    }
  }

  // If errors exist, return a string with all the missing keys
  if (Object.keys(errors).length > 0) {
    const missingFields = Object.keys(errors).join(", ");
    return `Validation error: The ${missingFields} fields are required.`;
  }

  return null;
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateOrderItems,
  validatePasswordReset,
};
