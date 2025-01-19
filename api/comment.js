/*
author: Sang Do
*/
var express = require('express');
var router = express.Router();
const request = require('request');
const Constant = require('../common/constant');
var Stock = require('../models/Stock');
var Comment = require('../models/Comment');

/* GET list of comments
input:
- skip, limit
- symbol

return:
- text
- total comments
- total likes
*/
router.get('/list_pagination', function(req, res, next) {
    var myInstance = new Comment();
    //
    var condition = {};
    if (req.query['symbol_list'] != null){
        //remember to change skip & limit
        condition = {'symbol' : {'$in': req.query['symbol_list'].split(',')}};
    }
    //console.log(condition);
    //
    myInstance.search_by_condition(
        condition,
        {skip: req.query['skip'], limit: req.query['limit']},
        'symbol uuid usr like time text',
        {time:-1},
        function(results){
            res.json(results);
    });
});

module.exports = router;
