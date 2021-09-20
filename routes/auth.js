var express = require('express');
var router = express.Router();

const dotenv = require('dotenv');
dotenv.config();

const crypto = require('crypto');
var jwt = require('jsonwebtoken');
const secretKey = process.env.JWTKEY;

const mysql2 = require('mysql2');

const pool = mysql2.createPool({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASS,
    database: process.env.DATABASE,
    waitForConnections: true,
    connectionLimit: 15,
    queueLimit: 0
});

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log(process.env.HOST);
  res.render('index', { title: 'Express' });
});

router.post('/login', function(req, res, next) {    

    const hashPass = crypto.createHmac('sha256', process.env.JWTKEY).update(req.body.password).digest('hex');
    var stmt = "SELECT id, name, email FROM admins WHERE email = '"+req.body.email+"' AND password = '"+hashPass+"'";

    try {
        pool.query(stmt, (err, results) => {
            if(err){
                res.json({status:0, error:err})
            }else{
                if(results.length == 1){
                    const payload = {
                        check: true,
                        id: results.id,
                        name: results.name
                    }
                    const token = jwt.sign(payload, process.env.JWTKEY,{
                        expiresIn: '4h'
                    });
                    return res.json({status:1, auth: true, api_key: token, results: results});
                }else{
                    return res.json({status: 0, auth: false, msg:'Correo electronico o contraseña incorrectos'})
                }
            }
        })
    } catch (error) {
        
        return res.json({status:0, error: error})
    }

});

router.post('/createAdmin', function(req, res, next) {
    
    if(req.body.postPass == 'Lum5t0n!'){
        var hashPass = crypto.createHmac('sha256', process.env.JWTKEY).update(req.body.pass).digest('hex');

        var stmt = "INSERT INTO admins (name, email, password) VALUES ('"+req.body.name+"','"+req.body.email+"', '"+hashPass+"')";
        try {
            pool.query(stmt , (err, results ) => {
                if(err){
                    console.log(err)
                    return res.json({status:0, error:err.code, type:'sql', sqlMsg: err.sqlMessage})
                }else{
                    return res.status(200).json({status:1 ,results:results});
                }
            })
        } catch (error) {
            console.log(error)
            return res.json({status:0, error:error, type:'exception'})
         }
    }else{
        return res.json({status:0, msg:'Error: postPass incorrecto'})
    }

});

router.post('/validateToken', function(req, res){
    const token = req.headers['api-key'];
    if(token){
        jwt.verify(token, process.env.JWTKEY, (err,decoded) => {
            if(err){
                return res.json({msg:'Invalid token', error: err, status:0})
            }else{
                return res.json({msg: 'Valid token', decoded: decoded, status:1})
            }
        })
    }else{
        return res.json({auth:false, msg: 'token not provided', status:0})
    }
});


module.exports = router;
