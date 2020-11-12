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
      if (bcrypt.compareSync(usersObj[user].password, password)) {
        return { error: null, user };
      } else {
        return { error: 'password', user: null};
      }
    } 
  }
  return { error: 'email', user: null};
};

const fetchUser = (usersObj, email) => {
  for (const user in usersObj) {
    if (usersObj[user].email === email) {
      return user;
    }
  }
};


module.exports = { existingUser, validateUser, fetchUser };
