const express = require('express')
var bodyParser = require('body-parser')
const http = require('http')

const app = express()
const server = http.createServer(app)
const PORT = process.env.PORT || 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const Pool = require('pg').Pool
const pool = new Pool({
  user: 'gbsibbylzvulqh',
  host: 'ec2-54-211-169-227.compute-1.amazonaws.com',
  database: 'd49d15lpo859qv',
  password: '5189d0ba2f97dbad20b722a25e88be74093c31ad4ad86ca5b90ee6d730770f0b',
  port: 5432,
  ssl: {
    rejectUnauthorized: false
  }
})


app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});


app.get('/api/turnos',(req, res) => {

    pool.query('SELECT * FROM turnos where finished=0 ORDER BY id ASC', (error, results) => {
        if (error) {
          throw error
        }
        res.status(200).json(results.rows)
      });
    
})

app.post('/api/turnos',(req, res) => {
    var today = new Date();
    var dd = today.getDate();

    var mm = today.getMonth()+1; 
    var yyyy = today.getFullYear();
    if(dd<10) 
    {
        dd='0'+dd;
    } 

    if(mm<10) 
    {
        mm='0'+mm;
    } 

    const {name, project} = req.body

    pool.query('INSERT INTO turnos (name, project, finished, date) VALUES ($1, $2, $3, $4)', [name, project, 0, dd+'-'+mm+'-'+yyyy], (error, results) => {
        if (error) {
          throw error
        }
        pool.query('SELECT * FROM turnos where finished=0 ORDER BY id ASC', (error, results) => {
            if (error) {
                throw error
            }
            res.status(200).json(results.rows)
        })
      });
    
})

app.post('/api/finish',(req, res) => {
    const {id, finished} = req.body
    pool.query(
        'UPDATE turnos SET finished = $1 WHERE id = $2',
        [finished, id],
        (error, results) => {
          if (error) {
            throw error
          }
          pool.query('SELECT * FROM turnos where finished=0 ORDER BY id ASC', (error, results) => {
                if (error) {
                    throw error
                }
                res.status(200).json(results.rows)
        })
        }
      );
})

server.listen(PORT, () => console.log(`server runnig in http://localhost:${PORT}`))