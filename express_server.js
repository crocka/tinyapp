const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

app.get("/urls", (req, res) => {
  res.render("urls_index", {urls: urlDatabase});
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.get("/u/:shorturl", (req, res) => {
  console.log(urlDatabase)
  const templateVars = { shortURL: req.params.shorturl, longURL: urlDatabase[req.params.shorturl]};
  res.render("urls_show", templateVars);
  // res.redirect(longURL);
});

app.post("/urls", (req, res) => {

  let shortURL = generateRandomString();
  console.log(req.body);  // Log the POST request body to the console
  console.log(shortURL)
  urlDatabase[shortURL] = req.body.longURL;
  
  res.redirect(`/u/${shortURL}`);
  
});

app.post('/u/:shortURL/update', (req, res) => {

  // console.log(req);
  urlDatabase[req.params.shortURL] = req.body.longURL;
  
  res.redirect('/urls');

});

app.post('/urls/:shortURL/delete', (req, res) => {

  // console.log(req);
  const shortURL = req.params.shortURL;

  delete urlDatabase[shortURL];
  
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