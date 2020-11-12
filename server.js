const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const app = express();
const cookieParser = require('cookie-parser');
const port = 8080;

const { existingUser, validateUser, fetchUser } = require('./helper');


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

//for test purposes
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



// Function to return an object with the user's urls
// Used in INDEX page
const urlsForUser = id => {
  let userUrls = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      userUrls[url] = urlDatabase[url];
    }
  }
  return userUrls;
};


//URL INDEX page
app.get("/urls", (req,res) => {
  const userId = req.cookies["user_id"];
  const userUrlDatabase = urlsForUser(userId);
  const templateVars = {user: users[userId], urls: userUrlDatabase };

  res.render("urls_index", templateVars);
});


//CREATE NEW URL page
app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"];
  const templateVars = {user: users[userId]};

  if (!userId) {
    return res.redirect("/login");
  }

  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  const userID = req.cookies["user_id"];

  urlDatabase[shortURL] = { longURL, userID };

  res.redirect(`/urls/${shortURL}`);
});


//url redirect to longUrl page
app.get("/u/:shortURL", (req,res) => {
  const urlObj = urlDatabase[req.params.shortURL]
  const longURL = urlObj.longURL;
  res.redirect(longURL);
});

//SHOW page
app.get("/urls/:shortURL", (req, res) => {
  const userId = req.cookies["user_id"];
  const shortURL = req.params.shortURL
  const templateVars = {user: users[userId], shortURL, longURL: urlDatabase[req.params.shortURL].longURL};


  if (urlDatabase[shortURL]) {
    if (urlDatabase[shortURL].userID === userId) {
      res.render("urls_show", templateVars);
    } else {
      res.redirect("/login");
    }
  }

});

//DELETE URL 
app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.cookies["user_id"];
  const shortURL = req.params.shortURL

  if (urlDatabase[shortURL].userID === userId) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.redirect("/login")
  }
});

//EDIT URL
app.post("/urls/:shortURL/edit", (req, res) => {
  const userId = req.cookies["user_id"];
  const shortURL = req.params.shortURL

  if (urlDatabase[shortURL].userID === userId) {
    urlDatabase[shortURL].longURL = req.body.newURL;
    return res.redirect(`/urls/${req.params.shortURL}`);
  } else {
    res.redirect("/login")
  }
});

//LOG IN
app.get('/login', (req, res) => {
  const userId = req.cookies.user_id
  const templateVars = {user: users[userId]};
  res.render('login', templateVars);
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  const validated =  validateUser(users, email, hashedPassword);
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
  const hashedPassword = bcrypt.hashSync(password, 10);

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
  users[id].password = hashedPassword;
  res.cookie('user_id', id);
  res.redirect('/urls');
});
