/**
 * Author: Zonglin Peng
 */

const username = document.querySelector('#usr')
const password = document.querySelector('#pwd')
const loginButton = document.getElementById('login');
loginButton.onclick = function (e) {
  const json = { username: username.value, password: password.value };
  const str = JSON.stringify(json);
  console.log('login json: ' + json)
  fetch('/login', {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: str 
  })
  .then(res => res.json())
  .then(res => {
      console.log(res)
      location.href = './table.html'
  })
  .catch(err => {
    console.log(err)
  })
  e.preventDefault();
  return false;
};

