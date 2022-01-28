const express = require("express");
const bcrypt = require('bcryptjs');
const methodOverride = require('method-override');
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const {generateRandomString, generateRandomId, findUserByEmail} = require('./helpers');
const users = require('./data/users.json');
const urlDatabase = require('./data/urlDatabase.json');
const PORT = 8080; // default port 8080

const visitorStats = {

  visitCount: 0,
  visitorCount: 0,
  visitorLog: [],
  
};

const app = express();

const salt = bcrypt.genSaltSync(10);

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

app.get("/urls", (req, res) => {

  res.render("urls_index", {urls: urlDatabase, users, cookies: req.session});

});

app.get("/urls/new", (req, res) => {

  res.render("urls_new",{urls: urlDatabase, users, cookies: req.session});

});

app.get("/urls/:shorturl", (req, res) => {

  const shortURL = req.params.shorturl;

  const templateVars = {urls: urlDatabase, users, cookies: req.session, shortURL, visitorStats};

  res.render("urls_show", templateVars);

});

app.get('/u/:shorturl', (req, res) => {

  const shortURL = req.params.shorturl;
  
  visitorStats.visitCount++;

  if(!req.session.visitor_id) {

    visitorStats.visitorCount++;
    req.session.visitor_id = generateRandomId();

  }

  visitorStats.visitorLog.push({

    visitor_id: req.session.visitor_id,
    time: `${new Date().toLocaleString()} (GMT)`

  });

  res.redirect(`https://${urlDatabase[shortURL]['longURL']}`);

});

app.get('/register', (req, res) => {

  res.render('register',{users, cookies: req.session});

});

app.get('/login', (req, res) => {

  res.render('login',{users, cookies: req.session});

});

app.delete('/urls/:shortURL', (req, res) => {

  const shortURL = req.params.shortURL;

  delete urlDatabase[shortURL];
  
  res.redirect('/urls');

});

app.put('/urls/:shortURL', (req, res) => {

  urlDatabase[req.params.shortURL]['longURL'] = req.body.longURL;
  
  res.redirect('/urls');

});

app.post("/urls", (req, res) => {

  let shortURL = generateRandomString();

  urlDatabase[shortURL] = {};
  urlDatabase[shortURL]['longURL'] = req.body.longURL;
  urlDatabase[shortURL]['userID'] = req.session.user_id;
  
  res.redirect(`/urls/${shortURL}`);
  
});


app.post('/login', (req, res) => {

  const user = findUserByEmail(req.body.email, users);

  if(!req.body.email || !req.body.password) {

    return res.status(400).send('Please enter your email and password.');

  } else if(!user) {

    return res.status(403).send("Email not found. Please create a new account.");
    
  } else if(!bcrypt.compareSync(req.body.password, user.password)) {

    return res.status(403).send('Your password does not match our record. Please try again.')

  }

  req.session.user_id = user.id;
  res.redirect('/urls');

});

app.post('/logout', (req, res) => {

  req.session['user_id'] = null;

  res.redirect('/urls');

});

app.post('/register', (req, res) => {

  let newEmail = req.body.email;

  if (!req.body.email || !req.body.password){

    return res.status(400).send("Please fill out both your email and password.");

  }

  for (let id in users) {

    if(users[id]['email'] === newEmail) {
      
      return res.status(403).send("The email is already registered, please login.");
      
    } 

  }
  
  if (newEmail) {

    let newId = generateRandomId();

    users[newId] = {

      "id" : newId,
      "email" : newEmail,
      "password" : bcrypt.hashSync(req.body.password, salt)

    }

  }

  res.redirect('login');

});


app.listen(PORT, () => {

  console.log(`Example app listening on port ${PORT}!`);

});

