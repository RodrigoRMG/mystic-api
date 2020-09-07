const express = require('express')
var bodyParser = require('body-parser')
const http = require('http')
const low = require('lowdb')
const lodashId = require('lodash-id')
const FileSync = require('lowdb/adapters/FileSync')

const app = express()
const server = http.createServer(app)
const PORT = process.env.PORT || 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const adapter = new FileSync('db.json')
const db = low(adapter);
db._.mixin(lodashId);

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});


app.get('/api/turnos',(req, res) => {

    const turnos = db.get('turnos').filter({finished: false})
    .sortBy('number')
    .take(5)
    .value()
    
    res.status(200).send(turnos)
    
})

app.post('/api/turnos',(req, res) => {

    const {name, project} = req.body
    const turnos = db.get('turnos')
    turnos.insert({ finished: false,name, project, number: turnos.size().value()+1}).write()
    res.status(200).send(turnos)
    
})

app.post('/api/finish',(req, res) => {

    const {id, finished} = req.body
    
    db.get('turnos')
    .find({ id })
    .assign({ finished})
    .write()

    const turnos = db.get('turnos')

    res.status(200).send(turnos)
    
})

server.listen(PORT, () => console.log(`server runnig in http://localhost:${PORT}`))