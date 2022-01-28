function generateRandomId() {

  let result = '';
  let chars = '0123456789';
  for (let i = 0; i < 6; i++) {

    result += chars[Math.floor(Math.random() * chars.length)];

  }

  // console.log(result)

  return result;

};

const findUserByEmail = (email, users) => {

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
  for (let i = 0; i < 6; i++) {

    result += chars[Math.floor(Math.random() * chars.length)];

  }

  // console.log(result)

  return result;

};

module.exports = {generateRandomString, generateRandomId, findUserByEmail};