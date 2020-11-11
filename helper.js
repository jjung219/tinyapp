
const existingUser = (usersObj, email) => {
  for (const user in usersObj) {
    if (usersObj[user].email === email) {
      return true;
    }
  }
};

const validateUser = (usersObj, email, password) => {
  for (const user in usersObj) {
    if (usersObj[user].email === email) {
      if (usersObj[user].password === password) {
        return { error: null, user };
      } else {
        return { error: 'password', user: null};
      }
    } 
  }
  return { error: 'email', user: null};
};

module.exports = { existingUser, validateUser };
