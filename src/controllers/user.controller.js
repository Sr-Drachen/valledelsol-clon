const bcryptjs = require('bcryptjs');

const User = require('../models/user.model');

const postUsers = async (req, res) => {
  const { name, email, password, role } = req.body;
  const user = new User({ name, email, password, role });

  const salt = bcryptjs.genSaltSync();
  user.password = bcryptjs.hashSync(password, salt);

  await user.save();

  res.status(201).json(user);
};

const putUsers = async (req, res) => {
  const { _id, password, email, secret_key, ...rest } = req.body;

  if (password) {
    const salt = bcryptjs.genSaltSync();
    rest.password = bcryptjs.hashSync(password, salt);
  }
  const user = await User.findOneAndUpdate(email, rest);

  if (!user) {
    res.status(404).json({
      message: 'User not found',
    });
  }

  res.status(200).json(user);
};

module.exports = {
  postUsers,
  putUsers,
};
