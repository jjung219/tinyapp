const express = require('express');
const app = express();
const port = 8080;
const bodyParser = require('body-parser');


app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


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
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//create new shortURL page
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});


//When the form is submitted, it redirects to urls_show page with the new longURL and shortURL
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:shortURL", (req,res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};

  if (urlDatabase[req.params.shortURL]) {
    res.render("urls_show", templateVars);
  } else {
    res.send("URL not found.");
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});






