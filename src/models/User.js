const users = [];

const generateId = () => Math.random().toString(36).substring(2, 10);

module.exports = {
  findOne: ({ email }) => {
    return users.find(user => user.email === email);
  },

  create: ({ email, phone }) => {
    const newUser = {
      id: generateId(),
      email,
      phone,
      isVerified: false
    };
    users.push(newUser);
    return newUser;
  },

  updateVerification: (email) => {
    const user = users.find(u => u.email === email);
    if (user) {
      user.isVerified = true;
    }
    return user;
  },

  getAll: () => users
};
