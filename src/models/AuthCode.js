const codes = [];

module.exports = {
  create: ({ userId, code }) => {
    // Elimina código anterior del mismo usuario
    const index = codes.findIndex(c => c.userId === userId);
    if (index !== -1) codes.splice(index, 1);

    codes.push({
      userId,
      code,
      createdAt: new Date()
    });
  },

  findOne: ({ userId, code }) => {
    return codes.find(c => c.userId === userId && c.code === code);
  },

  deleteOne: ({ userId }) => {
    const index = codes.findIndex(c => c.userId === userId);
    if (index !== -1) {
      codes.splice(index, 1);
    }
  },

  getAll: () => codes
};
