/**
 * Author: Zonglin Peng
 */

const username = document.querySelector('#usr')
const password = document.querySelector('#pwd')
const registerButton = document.getElementById('register');
registerButton.onclick = function (e) {
  e.preventDefault();
  console.log(username.value, username.value)
  if( username.value === undefined || password.value === undefined){
    alert("username or password should not be empty.");
    return false;
  }
  const json = { 
    username: username.value, 
    password: password.value,
    cars: []
   };
  const str = JSON.stringify(json);
  console.log('register json: ' + json)
  fetch('/register', {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: str 
  })
  .then(res => {
      console.log(res)
      if (res.status == 200){
        alert("New account has been created.");
        location.href = './index.html'
      } else if (res.status == 405){
        alert("Username has been used.")
      }else{
        alert("New account cannot be created.")
      }
  })
  return false;
};

