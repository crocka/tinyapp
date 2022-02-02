const express = require("express");
const bcrypt = require('bcryptjs');
const methodOverride = require('method-override');
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const { generateRandomString, generateRandomId, findUserByEmail } = require('./helpers');
const users = require('./data/users.json');
const urlDatabase = require('./data/urlDatabase.json');
const PORT = 8080; // default port 8080

const app = express();

const salt = bcrypt.genSaltSync(10);

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

//'/' endpoints
app.get('/', (req, res) => {

  //redirect to login page if not logged in or homepage when logged in
  if (req.session['user_id']) {

    res.redirect('/urls');

  } else {

    res.redirect('/login');

  }

});

//'/urls' endpoint
app.get("/urls", (req, res) => {

  res.render("urls_index", { urls: urlDatabase, users, cookies: req.session });

});

// /urls/new endpoint for creating new short urls
app.get("/urls/new", (req, res) => {

  //redirect to log in page if not logged in or go to urls/new page
  if (req.session['user_id']) {

    res.render("urls_new", { urls: urlDatabase, users, cookies: req.session });

  } else {

    res.redirect('/login');

  }




});

// endpoint to edit the long url and shows the usage stats of the short url
app.get("/urls/:shorturl", (req, res) => {

  const shortURL = req.params.shorturl;

  //if the short url is not found or the short url does not belong to the user, then send the corresponding error message.
  if (!urlDatabase[shortURL]) {

    return res.status(404).send('Shortened URL not found.');

  } else if (urlDatabase[shortURL].userID !== req.session.user_id) {

    return res.status(403).send('You have no access to this URL.');

  }

  const templateVars = { urls: urlDatabase, users, cookies: req.session, shortURL };

  res.render("urls_show", templateVars);

});

// endpoint to access the long url via the short url
app.get('/u/:shorturl', (req, res) => {

  const shortURL = req.params.shorturl;

  //return error if short url does not exist
  if (!urlDatabase[shortURL]) {

    return res.status(404).send('Shortened URL not found.');

  }

  //if no visitor id in the cookie session, make one
  if (!req.session.visitor_id) {

    req.session.visitor_id = generateRandomId();

  }

  //check is this visitor appears in previous visitorLog
  let newVisitor = true;

 //if the visitor is first time using the short url, generate a visitor id 
  for (let visitor of urlDatabase[shortURL].visitorStats.visitorLog) {

    if (visitor.visitor_id === req.session.visitor_id) {

      newVisitor = false;
      break;

    }

  }

  //if a new visitor is detected, add visitor count
  newVisitor ? urlDatabase[shortURL].visitorStats.visitorCount += 1 : '';

  urlDatabase[shortURL].visitorStats.visitCount++;

  //add time and visitor id to the visitor log
  urlDatabase[shortURL].visitorStats.visitorLog.push({

    visitor_id: req.session.visitor_id,
    time: `${new Date().toLocaleString()} (GMT)`

  });

  //redirect to the long url
  res.redirect(`https://${urlDatabase[shortURL]['longURL']}`);

});

//registration page
app.get('/register', (req, res) => {

  //if logged in, redirect to /urls
  if (req.session['user_id']) {

    res.redirect('/urls');

  } else {

    res.render('register', { users, cookies: req.session });

  }

});

//log in page
app.get('/login', (req, res) => {

  //if logged in, redirect to /urls
  if (req.session['user_id']) {

    res.redirect('/urls');

  } else {

    res.render('login', { users, cookies: req.session });

  }



});

//endpoint to delete short url, method override is used
app.delete('/urls/:shortURL', (req, res) => {

  const shortURL = req.params.shortURL;

  delete urlDatabase[shortURL];

  res.redirect('/urls');

});

//endpoint to edit the shorturl, method override is used
app.put('/urls/:shortURL', (req, res) => {

  urlDatabase[req.params.shortURL]['longURL'] = req.body.longURL;

  res.redirect('/urls');

});

//endpoint to create new short urls
app.post("/urls", (req, res) => {

  let shortURL = generateRandomString();

  //initialize the parameters within the urlDatabase
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL]['longURL'] = req.body.longURL;
  urlDatabase[shortURL]['userID'] = req.session.user_id;
  urlDatabase[shortURL]['date'] = `${new Date().toLocaleString()} (GMT)`;
  urlDatabase[shortURL].visitorStats = {

    visitCount: 0,
    visitorCount: 0,
    visitorLog: [],

  };

  res.redirect(`/urls/${shortURL}`);

});

// endpoint to log in
app.post('/login', (req, res) => {

  const user = findUserByEmail(req.body.email, users);

  //if email or password is not filled out 
  if (!req.body.email || !req.body.password) {

    return res.status(400).send('Please enter your email and password.');
    // if user is not found
  } else if (!user) {

    return res.status(403).send("Email not found. Please create a new account.");
    //if password is incorrect
  } else if (!bcrypt.compareSync(req.body.password, user.password)) {

    return res.status(403).send('Your password does not match our record. Please try again.')

  }

  //update user id in cookie session
  req.session.user_id = user.id;
  res.redirect('/urls');

});

//endpoint to logout
app.post('/logout', (req, res) => {

  //clear session cookie
  req.session = null;

  res.redirect('/urls');

});

//endpoint to register
app.post('/register', (req, res) => {

  let newEmail = req.body.email;

  //if password or email is not filled out
  if (!req.body.email || !req.body.password) {

    return res.status(400).send("Please fill out both your email and password.");

  }

  //loop through the user to see if the user email is registered
  for (let id in users) {

    if (users[id]['email'] === newEmail) {

      return res.status(403).send("The email is already registered, please login.");

    }

  }

  let newId = generateRandomId();

  //if the email entered is defined
  if (newEmail) {

    users[newId] = {

      "id": newId,
      "email": newEmail,
      "password": bcrypt.hashSync(req.body.password, salt)

    }

  }

  //update cookie session user id
  req.session.user_id = newId;
  res.redirect('/urls');

});


app.listen(PORT, () => {

  console.log(`Example app listening on port ${PORT}!`);

});

