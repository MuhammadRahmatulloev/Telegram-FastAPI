export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validateUsername = (username) => {
  return username.length >= 3 && username.length <= 30;
};

export const validateVerificationCode = (code) => {
  return /^\d{5}$/.test(code);
};

export const getFormErrors = (formData) => {
  const errors = {};

  if (formData.email && !validateEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (formData.password && !validatePassword(formData.password)) {
    errors.password = 'Password must be at least 6 characters';
  }

  if (formData.username && !validateUsername(formData.username)) {
    errors.username = 'Username must be between 3 and 30 characters';
  }

  if (formData.code && !validateVerificationCode(formData.code)) {
    errors.code = 'Please enter a valid 5-digit code';
  }

  return errors;
};
