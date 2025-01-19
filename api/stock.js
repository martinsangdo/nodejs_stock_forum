var express = require('express');
var router = express.Router();
const request = require('request');

var Stock = require('../models/Stock');

//http://localhost:3000/stock/chart
//https://nodejs-stock-forum.onrender.com/stock/chart
router.get('/chart', function(req, res, next) {
    res.render('chart');
});

/* GET list of stocks
input:
- skip, limit
- symbol list

return:
- symbol
- name
- total comments
- total likes
*/
router.get('/list_pagination', function(req, res, next) {
    var myInstance = new Stock();
    //
    var condition = {};
    if (req.query['symbol_list'] != null){
        //remember to change skip & limit
        condition = {'symbol' : {'$in': req.query['symbol_list'].split(',')}};
    }
    console.log(condition);
    //
    myInstance.search_by_condition(
        condition,
        {skip: req.query['skip'], limit: req.query['limit']},
        'symbol name',
        {},
        function(results){
            res.json(results);
    });
});

module.exports = router;
