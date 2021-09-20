var express = require('express');
var router = express.Router();
const path = require('path');
var moment = require('moment');
const nodemailer = require("nodemailer");

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

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'sb group' });
});

router.get('/client-side/user-detail', function(req, res, next) {
  console.log(process.env.DATABASE);
  var stmt;

  if(req.query.user_id){
    stmt = "SELECT u.id, u.name, u.phone, u.position, u.url, u.email, u.segment_id, u.image,  wa.phone as whatsappPhone, wa.message as whatsappMessage, s.name AS segment_name FROM users u INNER JOIN whatsapp_msg wa ON wa.user_id = u.id INNER JOIN segments s ON s.id = u.segment_id WHERE u.id = "+req.query.user_id;
  } else if( req.query.url){
    stmt = "SELECT u.id, u.name, u.phone, u.position, u.url, u.email, u.segment_id, u.image,  wa.phone as whatsappPhone, wa.message as whatsappMessage, s.name AS segment_name FROM users u INNER JOIN whatsapp_msg wa ON wa.user_id = u.id INNER JOIN segments s ON s.id = u.segment_id WHERE u.url = '"+req.query.url+"'"; 
  }
  
  try {
    pool.query(stmt, (err, results) => {
      if(err){
        console.log(err);
        return res.json({status:0, error:err.code, type: 'sql' });
      }else{
        return res.json({status:1, results:results, msg:'registros encontrados'});
      }
    });
  } catch (error) {
    console.log(error)
    return res.json({status:0, error:error, type:'exception'});
  }
});

router.get('/client-side/users', function(req, res, next) {
  var stmt = "SELECT u.id, u.name, u.phone, u.position, u.email, s.name AS segment_name FROM users u INNER JOIN segments s ON s.id = u.segment_id WHERE u.deleted = 0 ORDER BY u.id ASC";
  try {
    pool.query(stmt, (err, results) => {
      if(err){
        console.log(err);
        return res.json({status:0, error:err.code, type: 'sql' })
      }else{
        return res.json({status:1, data:results, msg:'registros encontrados'})
      }
    });
  } catch (error) {
    console.log(error)
    return res.json({status:0, error:error, type:'exception'});
  }
});

router.post('/mailer/info',async function(req,res,next){
  const name = req.body.name;
  const email = req.body.email;
  const service = req.body.service;
  const message = req.body.message;
  const date = moment().format('YYYY/MM/DD');
  var lang = req.body.lang;
  var subject;
  var html;
  var supportMail;

  if(lang === 'esp'){
    subject = 'SB Group | Contacto';
    html = "----------\n<br/> Fecha: "+date+" \n<br/> Enviado desde: "+subject+" \n<br/> Nombre: "+name+" \n<br/> Email: "+email+" \n<br/> Segmento de interes: "+service+" \n<br/> Mensaje: "+message+" \n<br/> \n\n";
    supportMail = 'sales@sbgroup.com.mx';
  }else if(lang === 'eng'){
    subject = 'SB Group | Contact';
    html = "----------\n<br/> Date: "+date+" \n<br/> Sent from: "+subject+"\n<br/> Name: "+name+" \n<br/> Email: "+email+" \n<br/> What is your segment of interest: "+service+" \n<br/> Message: "+message+" \n<br/> \n\n";
    supportMail = 'salesusa@sbgroup.com.mx';
  }

  let transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.MAILER, // generated ethereal user
        pass: process.env.MAILERPASS, // generated ethereal password
    },
  });
  try {
    emailData = {
        from: process.env.MAILER, // sender address
        to: supportMail, // list of receivers
        subject: subject, // Subject line
        html: html, // html body
    };
    let info = await transporter.sendMail(emailData);
    res.json({status:1, msg:info.messageId})
    
  } catch (error) {
      res.json({status: 0, error:error});
  }
});




module.exports = router;
