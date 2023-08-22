const Role = require('../models/role.model');
const User = require('../models/user.model');

const isValidRole = async (role = '') => {
  const existRole = await Role.findOne({ role });
  if (!existRole) {
    throw new Error(`Role ${role} not register in the database`);
  }
};

const isEmailDatabase = async (email = '') => {
  const existEmail = await User.findOne({ email });
  if (existEmail) {
    throw new Error(`Email: ${email} already exist`);
  }
};

module.exports = {
  isValidRole,
  isEmailDatabase,
};
