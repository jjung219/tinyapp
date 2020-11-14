const bcrypt = require('bcrypt');

//generates random string containing 6 characters, used to generate id
const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 8);
};

//checks whether the user exists by checking if the user's email exists in the user databse
const existingUser = (usersObj, email) => {
  for (const user in usersObj) {
    if (usersObj[user].email === email) {
      return true;
    }
  }
};

//validates the user by checking whether the email exists in the user database and whether the passwords matches
//returns an object with an error when they don't match
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

// returns the user obj by looking in the user database with the email provided
const getUserByEmail = (usersObj, email) => {
  for (const user in usersObj) {
    if (usersObj[user].email === email) {
      return user;
    }
  }
};

// Function to return an object with the user's urls
// Used in INDEX
const urlsForUser = (id, urlDb) => {
  let userUrls = {};
  for (const url in urlDb) {
    if (urlDb[url].userID === id) {
      userUrls[url] = urlDb[url];
    }
  }
  return userUrls;
};

//Function that adds a new user
//Used in the REGISTER POST
const addNewUser = (email, password, userDb) => {
  const userId = generateRandomString();
  
  const newUserObj = {
    id: userId,
    email,
    password: bcrypt.hashSync(password, 10)
  };
  userDb[userId] = newUserObj;
  return userId;
};

module.exports = { existingUser, validateUser, getUserByEmail, urlsForUser, addNewUser, generateRandomString };
