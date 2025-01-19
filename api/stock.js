var express = require('express');
var router = express.Router();
const request = require('request');

var Stock = require('../models/Stock');

//http://localhost:3000/stock/chart
//https://nodejs-stock-forum.onrender.com/stock/chart
router.get('/chart', function(req, res, next) {
    res.render('chart');
});

/* GET list of stocks */
router.get('/list', function(req, res, next) {
    var myInstance = new Stock();
    myInstance.search_by_condition(
        {},
        {skip:0, limit:10},
        'symbol name',
        {},
        function(results){
            res.json(results);
    });
});

module.exports = router;
