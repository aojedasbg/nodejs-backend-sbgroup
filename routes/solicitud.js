var express = require('express');
var router = express.Router();
var request = require('request');

// var baseUrl = 'https://api.sandbox.sat.ws';
// var apiKey = 'c1eab53e9c09474763203a6162d6982a';
var baseUrl = 'https://api.sat.ws';
var apiKey = '855658ff385539c1f568d9b63fa5bb2c';

router.get('/', ((req, res, next) => {
    res.json({ response: 'Ok' });
}));

router.post('/', ((req, res, next) => {
    request.post({
        url: baseUrl + '/credentials',
        headers: {
            'content-type': 'application/json',
            'X-API-Key': apiKey,
        },
        body: req.body,
        timeout: 1000 * 60 * 10,
        json: true
    }, (err, result, body) => {
        if (err) {
            console.log(err);
            res.json({ status: 0, response: body });
        } else {
            res.json({ status: 1, response: body });
        }
    });
}));

router.get('/:id', ((req, res, next) => {
    console.log(baseUrl + '/credentials/' + req.params.id)
    request.get({
        url: baseUrl + '/credentials/' + req.params.id,
        headers: {
            'content-type': 'application/json',
            'X-API-Key': apiKey,
        },
        timeout: 1000 * 60 * 10,
        json: true
    }, (err, result, body) => {
        if (err) {
            console.log(err);
            res.json({ status: 0, response: body });
        } else {
            res.json({ status: 1, response: body });
        }
    });
}));

module.exports = router;