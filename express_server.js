const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
app.use(cookieParser());

const users = require('./data/users.json');
const urlDatabase = require('./data/urlDatabase.json');

let username = undefined;

app.get("/urls", (req, res) => {
  res.render("urls_index", {urls: urlDatabase, users});
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new",{username:username});
});

app.get("/u/:shorturl", (req, res) => {
  console.log(urlDatabase)
  const templateVars = { username: username, shortURL: req.params.shorturl, longURL: urlDatabase[req.params.shorturl]};
  res.render("urls_show", templateVars);
});

app.get('/register', (req, res) => {

  res.render('register',{username});

});

app.get('/login', (req, res) => {

  res.render('login');

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

  const user = findUserByEmail(email);

  if(!req.body.email || !req.body.password) {

    return res.status(400).send('Please enter your email and password.');

  } else if(!user) {

    return res.status(400).send("Email not found. Please create a new account.");
    
  } else if(req.body.password !== user.password) {

    return res.status(400).send('Your password does not match our record. Please try again.')
  }


  res.cookie('user_id', user.id);
  res.render("urls_index", {users, urls : urlDatabase});

});

app.post('/logout', (req, res) => {

  res.clearCookie('user_id');

  res.redirect('/urls');

});

app.post('/register', (req, res) => {

  //loop through the users object to see if the email exist

  let newEmail = req.body.email;

  for (let id in users) {

    if(users[id]['email'] === newEmail) {
      
      return res.status(400).send("The email is already registered, please login.");
      
    } 

  }
  
  if (newEmail) {

    let newId = generateRandomId();
    users[newId] = {

      "id" : newId,
      "email" : newEmail,
      "password" : req.body.password

    }

  } else if (!req.body.email || !req.body.password){

    return res.status(400).send("Please fill out both your email and password.")

  }

  console.log(users);

  res.redirect('/urls');

});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {

  let result = '';
  let chars = '0123456789abcdefghijklmnopqrstuvwxyz';
  for (let i = 0; i < 6; i++) {

    result += chars[Math.floor(Math.random() * chars.length)];

  }

  console.log(result)

  return result;

}

function generateRandomId() {

  let result = '';
  let chars = '0123456789';
  for (let i = 0; i < 6; i++) {

    result += chars[Math.floor(Math.random() * chars.length)];

  }

  console.log(result)

  return result;

}

const findUserByEmail = (email) => {

  for(const userId in users) {

    const user = users[userId];

    if(user.email === email) {

      return user;

    }
  }
  return null;
}