
const existingUser = (usersObj, email) => {
  for (const user in usersObj) {
    if (usersObj[user].email === email) {
      return true;
    }
  }
};

module.exports = { existingUser };
