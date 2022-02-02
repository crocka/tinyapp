function generateRandomId() {

  let result = '';
  let chars = '0123456789';

  //create a 6 digit random number sequence
  for (let i = 0; i < 6; i++) {

    result += chars[Math.floor(Math.random() * chars.length)];

  }

  return result;

};

const findUserByEmail = (email, users) => {

  //loop through the list of users and if email match, return the entire user object
  for(const userId in users) {

    const user = users[userId];

    if(user.email === email) {

      return user;

    }
  }
  return null;
};

function generateRandomString() {

  let result = '';
  let chars = '0123456789abcdefghijklmnopqrstuvwxyz';

  //create a 6 digit random alphanumeric sequence
  for (let i = 0; i < 6; i++) {

    result += chars[Math.floor(Math.random() * chars.length)];

  }

  return result;

};

module.exports = {generateRandomString, generateRandomId, findUserByEmail};