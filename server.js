const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const app = express();
const cookieSession = require('cookie-session');
const port = 8080;

const { existingUser, validateUser, getUserByEmail, urlsForUser, addNewUser, generateRandomString } = require('./helper');


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

//Two Below users are for test purposes
const users = {
  "aJ48lW": {
    id: "aJ48lW",
    email: "a@aa.com",
    password: "123"
  },
  "1": {
    id: "1",
    email: "b@bb.com",
    password: "123"
  }
};

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});

app.get("/", (req, res) => {
  const userId = req.session["user_id"];
  if (userId) {
    return res.redirect("/urls");
  } else {
    return res.redirect("/login");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//URL INDEX
app.get("/urls", (req,res) => {
  const userId = req.session["user_id"];
  const userUrlDatabase = urlsForUser(userId, urlDatabase);
  const templateVars = {user: users[userId], urls: userUrlDatabase };

  //If user is not logged in, redirect to login page
  if (!userId) {
    return res.redirect("/login");
  }

  res.render("urls_index", templateVars);
});

//CREATE NEW URL GET
app.get("/urls/new", (req, res) => {
  const userId = req.session["user_id"];
  const templateVars = {user: users[userId]};

  if (!userId) {
    return res.redirect("/login");
  }

  res.render("urls_new", templateVars);
});

//CREATE NEW URL POST
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  const userID = req.session["user_id"];

  urlDatabase[shortURL] = { longURL, userID };

  res.redirect(`/urls/${shortURL}`);
});


//REDIRECTION to longURL 
app.get("/u/:shortURL", (req,res) => {
  const urlObj = urlDatabase[req.params.shortURL];
  let longURL;

  if (urlObj === undefined) {
    return res.send("Sorry, could not find URL for the corresponding id");
  } else {
    longURL = urlObj.longURL;
  }
  res.redirect(longURL);
});

//SHOW SHORTURL DETAIL GET
app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session["user_id"];
  const shortURL = req.params.shortURL;
  const templateVars = {user: users[userId], shortURL, longURL: urlDatabase[req.params.shortURL].longURL};
  
  if (!userId) {
    return res.send("Please log in to access the URLs");
  }

  if (urlDatabase[shortURL]) {
    if (urlDatabase[shortURL].userID === userId) {
      res.render("urls_show", templateVars);
    } else {
      res.send("Sorry, access denied");
    }
  }

});

//DELETE URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.session["user_id"];
  const shortURL = req.params.shortURL;

  if (urlDatabase[shortURL].userID === userId) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

//EDIT URL
app.post("/urls/:shortURL/edit", (req, res) => {
  const userId = req.session["user_id"];
  const shortURL = req.params.shortURL;

  if (urlDatabase[shortURL].userID === userId) {
    urlDatabase[shortURL].longURL = req.body.newURL;
    return res.redirect(`/urls`);
  } else {
    res.redirect("/login");
  }
});

//LOG IN GET
app.get('/login', (req, res) => {
  const userId = req.session.user_id;
  const templateVars = {user: users[userId]};

  if (userId) {
    return res.redirect("/urls");
  }
  res.render('login', templateVars);
});

//LOG IN POST
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const validated =  validateUser(users, email, password);
  if (validated.error) {
    return res.status(403).send(`Invalid ${validated.error}.`);
  }

  req.session['user_id'] = getUserByEmail(users, email);
  res.redirect('/urls');
});

//LOG OUT
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//REGISTER GET
app.get('/register', (req, res) => {
  const userId = req.session["user_id"];
  const templateVars = { error: null }

  if (userId) {
    return res.redirect("/urls");
  }

  res.render('register', templateVars);
});

//REGISTER POST
app.post('/register', (req, res) => {
  const {email, password } = req.body;
  const templateVars = { error: null };

  if (email === '') {
    templateVars.error = "Error: Please enter email";
    return res.render('register', templateVars);
  } else if (password === '') {
    templateVars.error = "Error: Please enter password";
    return res.render('register', templateVars);
  }

  if (existingUser(users, email)) { //If true, the user already exists
    return res.status(400).send("User already exists");
  }
  const userId = addNewUser(email, password, users);
  req.session['user_id'] = userId;
  res.redirect('/urls');
});
