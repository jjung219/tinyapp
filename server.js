const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cookieParser = require('cookie-parser');
const port = 8080;

const { existingUser, validateUser, fetchUser } = require('./helper');


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "1": {
    id: "1", 
    email: "a@aa.com", 
    password: "123"
  },
}


const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 8);
};

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});

app.get("/", (req, res) => {
  res.send("Welcome!");
})

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//URL page
app.get("/urls", (req,res) => {
  const userId = req.cookies["user_id"];
  const templateVars = {user: users[userId], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//create new shortURL page
app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"];
  const templateVars = {user: users[userId]};

  if (!userId) {
    return res.redirect("/login");
  }

  res.render("urls_new", templateVars);
});

//When the form is submitted, it redirects to urls_show page with the new longURL and shortURL
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  
  res.redirect(`/urls/${shortURL}`);
});

//url redirect to longUrl page
app.get("/u/:shortURL", (req,res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//show url page
app.get("/urls/:shortURL", (req, res) => {
  const userId = req.cookies["user_id"];
  const templateVars = {user: users[userId], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};

  if (urlDatabase[req.params.shortURL]) {
    res.render("urls_show", templateVars);
  } else {
    res.send("URL not found.");
  }
});

//delete URL 
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

//edit URL
app.post("/urls/:shortURL/edit", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.newURL;
  res.redirect(`/urls/${req.params.shortURL}`);
});

//LOG IN
app.get('/login', (req, res) => {
  const userId = req.cookies.user_id
  const templateVars = {user: users[userId]};
  res.render('login', templateVars);
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const validated =  validateUser(users, email, password);
  if (validated.error) {
    res.status(403);
    res.send(`Invalid ${validated.error}.`);
  }

  res.cookie('user_id', fetchUser(users, email));
  res.redirect('/urls');
});



//LOG OUT
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

//REGISTER
app.get('/register', (req, res) => {
  const userId = req.cookies.user_id
  const templateVars = {user: users[userId]};
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  const {email, password } = req.body;

  if (email === '') {
    res.status(400);
    res.send("Please enter email");
  } else if (password =='') {
    res.status(400);
    res.send("Please enter password");
  };

  //if existingUser(obj) is true, the user already exists
  if (existingUser(users, email)) {
    res.status(400);
    res.send("User already exists");
  };
  
  const id = generateRandomString()
  users[id] = {};
  users[id].id = id;
  users[id].email = email;
  users[id].password = password;
  console.log(req.body)
  res.cookie('user_id', id);
  res.redirect('/urls');
});

