/**
 * Author: Zonglin Peng
 */

// - - - - - - MACROS - - - - - - 
const dir  = '/public/',
      port = 3000;
//Server
const express = require('express')
const app = express()
//Database
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter)
const bodyParser = require('body-parser')
//Strategy
const passport = require('passport');
const Local = require('passport-local').Strategy;
const session = require('express-session');
//Favicon
const favicon = require('serve-favicon'),
app.use(favicon(__dirname + '/public/img/favicon.png'));

//Static
app.use(express.static('public'))
app.use(bodyParser.json())
//Passport
const sampleCar = {'id': 0, 'model': 'sample', 'year': 2019, 'mpg': 23, 'value': 20000 };
let dataAll;
let auth = {}; //my user name

// - - - - - - PASSPORT - - - - - - 
const myLocalStrategy = function( username, password, done ) {
  console.log('posts: ' + db.get('posts').value())
  user = dataAll.find( __user => __user.username === username )
  // user =  db.get('posts').find( __user => __user.username === username )
  if( user === undefined ) {
    console.log('user not found')
    return done( null, false, { message:'user not found' })
  }else if( user.password === password ) {
    console.log('login success')
    return done( null, { username, password })
  }else{
    console.log('incorrect password : ' + user.username + " & " + user.password)
    return done( null, false, { message: 'incorrect password' })
  }
}

passport.use( new Local( myLocalStrategy ) )
passport.initialize()

passport.serializeUser( ( user, done ) => done( null, user.username ) )
passport.deserializeUser( ( username, done ) => {
  const user = dataAll.find( u => u.username === username )
  if( user !== undefined ) {
    done( null, user )
  }else{
    done( null, false, { message:'user not found; session not restored' })
  }
})

app.use( session({ secret:'cats cats cats', resave:false, saveUninitialized:false }) )
app.use( passport.initialize() )
app.use( passport.session() )

//Passport: POST
app.post('/test', function( req, res ) {
  console.log( 'authenticate with cookie?', req.user )
  res.json({ status:'success' })
})

app.post( 
  '/login',
  passport.authenticate( 'local' ),
  function( req, res ) {
    console.log( 'user: ', req.user )
    auth = dataAll.find(__user => __user.username === req.user.username)
    console.log( 'auth: ', auth.username )
    res.json({ status: true })
  }
)

// - - - - - - DB INITIATE - - - - - - 

// {
//   "posts": [
//     {
//       "username": "aaron", 
//       "password": "aaronn",
//       "cars": [
//         {
//           "id": 0, 
//           "model": "sample", 
//           "year": 2019, 
//           "mpg": 23, 
//           "value": 20000
//         }      
//       ]
//     }
//   ]
// }

db.defaults( { posts : [
    {
      "username": "aaron", 
      "password": "aaronn",
      "cars": [
        {
          "id": 0, 
          "model": "sample", 
          "year": 2019, 
          "mpg": 23, 
          "value": 20000
        }      
      ]
    }
] }).write()

const getAllData = function() { //TODO: dup
  dataAll =  [];
  let i = 0;
  while (true) {
      // let row = db.get(`posts[${i}]`).get('cars').value();
      let row = db
        .get(`posts[${i}]`)
        // .find({ username: auth.username })
        // .get('cars')
        .value();
      // console.log(db
      //   .get(`posts[${i}]`)
      //   .find({ username: auth.username })
      //   .get('cars')
      //   .value())
      if (row) {
        console.log('db cars: ' + row)
        dataAll.push(row);
      }
      else {
        console.log('db alldata: ' + dataAll);
        break;
      }
      i++;
  }
};
getAllData();


// - - - - - - DB HANDLERS - - - - - - 
const addCar = function (body) {
  let year = body.year;
  let mpg = body.mpg;
  let weight = (year*1 === 0 || mpg*1 === 0) ? 0 : 1;
  body.value = (mpg*1000 - (2019-year)*100) * weight;
  db.get('posts')
    .find({ username: auth.username })
    .get('cars')
    .push(body)
    .write();
  console.log('add: ' + body.model);
}

const deleteCar = function (body) {
  db.get('posts')
    .find({ username: auth.username })
    .get('cars')
    .remove({ id: body.id })
    .write();
  console.log('del: ' + body.model);
}

const modifyCar = function (body) {
  let year = body.year;
  let mpg = body.mpg;
  let weight = (year*1 === 0 || mpg*1 === 0) ? 0 : 1;
  body.value = (mpg*1000 - (2019-year)*100) * weight;
  db.get('posts')
    .find({ username: auth.username })
    .get('cars')
    .find({ id: body.id})
    .assign({
      id: body.id,
      name: body.name,
      model: body.model,
      year: body.year,
      mpg: body.mpg,
      value: body.value
  }).write()
  console.log('mod: ' + body.model);
}

const removeDuplicate = function () {
  const newList = db.get('post')
    .get('posts')
    .find({ username: auth.username })
    .get('cars')
    .uniqBy('id')
    .value()

  db.set('posts', newList)
    .write()
}


// - - - - - - TABLE PAGE - - - - - - 
// GET
app.get('/', (request, response) => {
  response.sendFile(__dirname + dir + '/index.html');
});

app.get('/getAll', (request, response) => {
  console.log('get getall: ' + dataAll);
  response.send(db.get('posts').find({ username: auth.username }).get('cars'));
});


// POST
app.post('/add', (request, response) => {
  let data = request.body
  console.log("BODY: " + JSON.stringify(data))
  // console.log("BODY: " + data.mpg)
  // console.log("BODY: " + data.model)

  addCar(request.body);
  getAllData();
  response.writeHead( 200, "OK", {'Content-Type': 'text/plain' });
  response.end();
});

app.post('/modify', (request, response) => {
  modifyCar(request.body);
  getAllData();
  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.end();
});

app.post('/delete', (request, response) => {
  deleteCar(request.body);
  getAllData()
  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.end();
});


// - - - - - - SERVER START - - - - - - 
app.listen(process.env.PORT || port, () => console.log('Car app listening on port 3000!'));
