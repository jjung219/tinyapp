const bcrypt = require('bcrypt');

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
      if (user && bcrypt.compareSync(password, usersObj[user].password)) {
        return { error: null, user };
      } else {
        return { error: 'password', user: null};
      }
    } 
  }
  return { error: 'email', user: null};
};

const getUserByEmail = (usersObj, email) => {
  for (const user in usersObj) {
    if (usersObj[user].email === email) {
      return user;
    }
  }
};

module.exports = { existingUser, validateUser, getUserByEmail };
