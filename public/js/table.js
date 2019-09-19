/**
 * Author: Zonglin Peng
 */

let ID = 1;

const logout = function() {
  location.href = './index.html'
}
// GET
const createHeader = function() {
  database.innerHTML = ""
  const headerList = ["ID", "Model", "Year", "MPG", "Value($)"]
  var tr = document.createElement('tr');
  tr.style.width = '100%';
  tr.setAttribute('border', '1');
  for(let i = 0; i < headerList.length; i++) {
    let header = headerList[i];
    let th = document.createElement('th');
    th.innerHTML = header;
    tr.appendChild(th);
  }
  database.appendChild(tr);
}

const getCar = function () {
  fetch('/getAll', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  }).then(function (response) {
    console.log('response : ' + response)
    return response.json();
  }).then(function (data) {
    console.log('data : ' + data)
    createHeader()
    data.map(function (entry) {
      const headerList = [
        entry.id, entry.model, entry.year, 
        entry.mpg, entry.value
      ]
      let tr = document.createElement('tr');
      for(let i = 0; i < headerList.length; i++) {
        let key = headerList[i];
        let td = document.createElement('th');
        td.innerHTML = key;
        tr.appendChild(td);
      }
      database.appendChild(tr);
    })
  })      
  .catch(err => {
    console.log(err)
  })
}

// POST 
function postRequest(req) {
  // prevent default form action from being carried out
  const model = document.querySelector( '#model' ),
        year = document.querySelector( '#year' ),
        mpg = document.querySelector( '#mpg' ),
        idInput = document.querySelector( '#id' ).value,
        id = function() {
          if (req === "add"){
            return ID++;
          }
          else {
            if(idInput !== ""){
              return parseInt(idInput);
            }else{
              return ID++;
            }
          }
        }
        //id = (req !== "add" && idInput !== "") ? parseInt(idInput) : ID++,
        json = {
          id: id(),
          model: model.value,
          year: parseInt(year.value),
          mpg: parseInt(mpg.value),
          value: 0
        },
        body = JSON.stringify( json );

  fetch( `/${req}`, {
    headers: { 'Content-Type': 'application/json' },
    method:'POST',
    body: body 
  })
  .then( function( response ) {
    console.log( "Add to server: " + response )
    getCar() //get
  })
  .catch(err => {
    console.log(err)
  })
}

// POST - ADD
const addCar = function( e ) {
  console.log("Front: add")
  e.preventDefault()
  postRequest("add")
  return false
}

// POST - DELETE
const deleteCar = function( e ) {
  console.log("Front: del")
  e.preventDefault()
  postRequest("delete")
  return false
}

// POST - MODIFY
const modifyCar = function( e ) {
  console.log("Front: mod")
  e.preventDefault()
  postRequest("modify")
  return false
}

const infoAlert = function(){
  swal("How To Use", 
  ">Add: Select models and enter year and mpg.\n"+
  ">Delete: Select models and enter its ID. All models with same ID will be removed\n"+
  ">Modify: Select models enter its ID, year, and mpg. First model with the given ID will be removed")
}

const addButton = document.getElementById('add');
const deleteButton = document.getElementById('del');
const modifyButton = document.getElementById('mod');
const infoIcon = document.getElementById('info');                    
// const logoutButton = document.getElementById('logout');                      

addButton.onclick = addCar;
deleteButton.onclick = deleteCar;
modifyButton.onclick = modifyCar;
infoIcon.onclick = infoAlert;
// logoutButton.onclick = logout;

window.onload = function() {
  getCar()
}

