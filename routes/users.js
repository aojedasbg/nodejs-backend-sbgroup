var express = require('express');
var router = express.Router();

const dotenv = require('dotenv');
dotenv.config();

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

/* GET users listing. */
router.get('/', function(req, res, next) {
  var stmt = "SELECT u.id, u.name, u.phone, u.position, u.email, s.name AS segment_name FROM users u INNER JOIN segments s ON s.id = u.segment_id WHERE u.deleted = 0 ORDER BY u.id ASC";
  try {
    pool.query(stmt, (err, results) => {
      if(err){
        console.log(err);
        return res.json({status:0, error:err.code, type: 'sql' })
      }else{
        return res.json({status:1, results:results, msg:'registros encontrados'})
      }
    });
  } catch (error) {
    console.log(error)
    return res.json({status:0, error:error, type:'exception'});
  }
});

router.post('/create-user', function(req, res, next) {
  var stmt = "INSERT INTO users (name, phone, position, email, url,image, segment_id) VALUES ('"+req.body.userInfo.name+"', '"+req.body.userInfo.phone+"','"+req.body.userInfo.position+"','"+req.body.userInfo.email+"','"+req.body.userInfo.url+"','"+req.body.userInfo.image+"',"+req.body.userInfo.segment_id+")";
    try {
        pool.query(stmt , (err, results ) => {
          if(err){
              console.log(err)
            return res.json({status:0, error:err.code, type:'sql'});
          }else{
           var stmt2 = "INSERT INTO whatsapp_msg (phone, message, user_id) values ('"+req.body.whatsappInfo.phone+"','"+req.body.whatsappInfo.msg+"', "+results.insertId+" )";
           pool.query(stmt2, (err,results) =>{
             if(err){
               return res.json({status:0, error:err.code, type:'sql'});
             }else{
               return res.json({status:1,results:results, msg:'registro agregado'});
             }
           })
          }
      })
      } catch (error) {
        console.log(error);
        return res.json({status:0, error:error, type:'exception'})
      }
});

router.get('/segments', function(req, res, next) {
  var stmt = "SELECT * FROM segments";
  try {
    pool.query(stmt, (err, results) => {
      if(err){
        console.log(err);
        return res.json({status:0, error:err.code, type: 'sql' })
      }else{
        return res.json({status:1, results:results, msg:'registros encontrados'})
      }
    });
  } catch (error) {
    console.log(error)
    return res.json({status:0, error:error, type:'exception'});
  }
});

router.get('/user-detail', function(req, res, next) {
  var segmentObj = {};
  var stmt = "SELECT u.id, u.name, u.phone, u.position, u.url, u.email, u.segment_id, u.image,  wa.phone as whatsappPhone, wa.message as whatsappMessage, s.name AS segment_name FROM users u INNER JOIN whatsapp_msg wa ON wa.user_id = u.id INNER JOIN segments s ON s.id = u.segment_id WHERE u.id = "+req.query.user_id;
  try {
    pool.query(stmt, (err, results) => {
      if(err){
        console.log(err);
        return res.json({status:0, error:err.code, type: 'sql' })
      }else{
        segmentObj = {
          id: results[0].segment_id,
          name: results[0].segment_name
        }
        results.push(segmentObj);
        return res.json({status:1, results:results, msg:'registros encontrados'})
      }
    });
  } catch (error) {
    console.log(error)
    return res.json({status:0, error:error, type:'exception'});
  }
});

router.patch('/delete-user', function(req, res){

  var stmt = "UPDATE users SET deleted = 1 WHERE id = "+req.body.user_id;
  try {
    pool.query(stmt , (err, results ) => {
      if(err){
        return res.json({status:0, error:err.code})
      }else{
        return res.json({status:1 ,results:results});
      }
  })
  } catch (error) {
    return res.json({status:0, error:error})
  }
});

router.patch('/update-user', function(req, res){

  var stmt = "UPDATE users SET name = '"+req.body.userInfo.name+"', phone = '"+req.body.userInfo.phone+"', position = '"+req.body.userInfo.position+"', email = '"+req.body.userInfo.email+"', url= '"+req.body.userInfo.url+"', image = '"+req.body.userInfo.image+"', segment_id = "+req.body.userInfo.segment_id+" WHERE id = "+req.body.userInfo.user_id;
  try {
    pool.query(stmt , (err, results ) => {
      if(err){
        return res.json({status:0, error:err})
      }else{
        var stmt2 = "UPDATE whatsapp_msg SET phone = '"+req.body.whatsappInfo.phone+"', message = '"+req.body.whatsappInfo.msg+"' WHERE user_id = "+req.body.userInfo.user_id;
        pool.query(stmt2, (err, results) => {
          if(err){
            return res.json({status:0, error: err.code})
          }else{
            return res.json({status:1, results:results, msg:'registro actualizado'});
          }
        })
      }
  })
  } catch (error) {
    return res.json({status:0, error:error})
  }
});


module.exports = router;
