export const validateEmail = (email: string): void => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    throw new Error('Email is required');
  }
  if (!emailRegex.test(email)) {
    throw new Error('Please enter a valid email address');
  }
};