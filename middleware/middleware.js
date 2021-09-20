jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

function Auth(req, res, next){

    const token = req.headers['api-key'];

    if (token) {
        jwt.verify(token, process.env.JWTKEY, (err, decoded) => {      
            if (err) {
            return res.json({ mensaje: 'Token inválida', err: err });    
            } else {
            req.decoded = decoded;    
            next();
            }
        });
    } else {
        res.send({ 
            mensaje: 'Token no proveída.' 
        });
    }

}

module.exports = {
    Auth
}