/**
 * Author: Zonglin Peng
 */
// - - - - - - MACROS - - - - - - 
const dir  = '/public/';
const port = 3000;
const sampleCar = {'id': 0, 'model': 'sample', 'year': 2019, 'mpg': 23, 'value': 20000 };
let dataAll;
let auth = {}; //my user name

// - - - - - - REQUIRES - - - - - - 

//Server
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
var express = require('express')
var timeout = require('connect-timeout')
var app = express()
app.use(timeout('5s'))
app.use(bodyParser())
app.use(haltOnTimedout)
app.use(cookieParser())
app.use(haltOnTimedout)
//Timeout
function haltOnTimedout (req, res, next) {
  if (!req.timedout) next()
}
//Database
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter)
//Passport
const passport = require('passport');
const Local = require('passport-local').Strategy;
const session = require('express-session');
//Favicon
const favicon = require('serve-favicon');
var path = require('path')
app.use(favicon(path.join(__dirname, 'public' , 'images', 'icon.png'))); //TODO
//Cookie
app.use(cookieParser());
//Morgan
const morgan = require('morgan');
app.use(morgan('combined')); // Simple app that will log all request in the Apache combined format to STDOUT
//Static
app.use(express.static('public'))
app.use(bodyParser.json())
//ResponseTime
const StatsD = require('node-statsd')
const responseTime = require('response-time')
const stats = new StatsD()
stats.socket.on('error', function (error) {
  console.error(error.stack)
})
app.use(responseTime(function (req, res, time) {
  var stat = (req.method + req.url).toLowerCase()
    .replace(/[:.]/g, '')
    .replace(/\//g, '_')
  stats.timing(stat, time)
}))


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
        .value();
      if (row) {
        console.log('db cars: ' + row)
        dataAll.push(row);
      }
      else {
        break;
      }
      i++;
  }
};
getAllData();


// - - - - - - DB HANDLERS - - - - - - 
const addUsr = function (body) {
  console.log('register: ' + body.username);
  let check = dataAll.find( __user => __user.username === body.username )
  if(check === undefined){
    db.get('posts')
    .push(body)
    .write();
    return true
  }
  return false
}

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

// - - - - - - REGISTER PAGE - - - - - - 
// POST
app.post('/register', (request, response) => {
  console.log("BODY: " + JSON.stringify(request.body))
  console.log('Cookies: ', request.cookies)
  if(addUsr(request.body)){
    getAllData();
    response.writeHead( 200, "OK", {'Content-Type': 'text/plain' });
    response.end();
  }else{
    response.writeHead( 405, "Dup User", {'Content-Type': 'text/plain' });
    response.end();
  }
});

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
  console.log("BODY: " + JSON.stringify(request.body))
  console.log('Cookies: ', request.cookies)
  addCar(request.body);
  getAllData();
  response.writeHead( 200, "OK", {'Content-Type': 'text/plain' });
  response.end();
});

app.post('/modify', (request, response) => {
  console.log("BODY: " + JSON.stringify(request.body))
  console.log('Cookies: ', request.cookies)
  modifyCar(request.body);
  getAllData();
  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.end();
});

app.post('/delete', (request, response) => {
  console.log("BODY: " + JSON.stringify(request.body))
  console.log('Cookies: ', request.cookies)
  deleteCar(request.body);
  getAllData()
  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.end();
});


// - - - - - - SERVER START - - - - - - 
app.listen(process.env.PORT || port, () => console.log('Car app listening on port 3000!'));
