export const validateAdminForm = ({ email, password }) => {
  const errors = {};
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

  if (!email || !emailRegex.test(email)) {
    errors.email = 'email_invalid';
  }

  if (!password) {
    errors.password = 'password_required';
  }

  return errors;
};
