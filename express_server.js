const express = require("express");
const app = express();
const PORT = 3000; // default port 8080

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

let username = undefined;

app.get("/urls", (req, res) => {
  res.render("urls_index", {urls: urlDatabase, username: username});
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new",{username:username});
});

app.get("/u/:shorturl", (req, res) => {
  console.log(urlDatabase)
  const templateVars = { username: username, shortURL: req.params.shorturl, longURL: urlDatabase[req.params.shorturl]};
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {

  let shortURL = generateRandomString();
  console.log(req.body); 
  console.log(shortURL)
  urlDatabase[shortURL] = req.body.longURL;
  
  res.redirect(`/u/${shortURL}`);
  
});

app.post('/u/:shortURL/update', (req, res) => {

  urlDatabase[req.params.shortURL] = req.body.longURL;
  
  res.redirect('/urls');

});

app.post('/urls/:shortURL/delete', (req, res) => {

  const shortURL = req.params.shortURL;

  delete urlDatabase[shortURL];
  
  res.redirect('/urls');
});

app.post('/login', (req, res) => {

  res.cookie('username', req.body.username);

  username = req.cookies["username"];

  const templateVars = {
    username,
    urls: urlDatabase
  };

  res.render("urls_index", templateVars);

});

app.post('/logout', (req, res) => {

  username = undefined;

  res.clearCookie('username');

  res.redirect('/urls');

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {

  let result = '';
  let chars = '0123456789abcdefghijklmnopqrstuvwxyz';
  for (let i = 0; i < 7; i++) {

    result += chars[Math.floor(Math.random() * chars.length)];

  }

  console.log(result)

  return result;

}