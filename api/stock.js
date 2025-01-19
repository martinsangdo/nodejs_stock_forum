var express = require('express');
var router = express.Router();
const request = require('request');
const Constant = require('../common/constant');
var Stock = require('../models/Stock');
var Comment = require('../models/Comment');

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
    //console.log(condition);
    //
    myInstance.search_by_condition(
        condition,
        {skip: req.query['skip'], limit: req.query['limit']},
        'symbol name',
        {},
        function(results){
            if (results['result'] == Constant.OK_CODE){
                var symbol_list = [];
                for (var stock of results['data']){
                    symbol_list.push(stock['symbol']);
                }
                if (symbol_list.length > 0){
                    //get total of comments of each stock
                    var myComment = new Comment();
                    myComment.count_by_symbol(symbol_list, function(res_total){
                        if (res_total['result'] == Constant.OK_CODE){
                            //create a map between symbol and count
                            var symbol_comment_count_map = {};  //key: symbol, value: count
                            for (var count_obj of res_total['data']){
                                var symbol = count_obj['_id']['symbol'];
                                symbol_comment_count_map[symbol] = count_obj['count'];
                            }
                            // console.log(symbol_comment_count_map);
                            //compose response data
                            var final_response = {result: Constant.OK_CODE};
                            var stock_details = [];
                            for (var stock of results['data']){
                                stock_details.push({
                                    symbol: stock['symbol'],
                                    name: stock['name'],
                                    comment_count: symbol_comment_count_map[stock['symbol']] != null?symbol_comment_count_map[stock['symbol']]:0
                                });
                            }
                            final_response['data'] = stock_details;
                            res.json(final_response);
                        } else {
                            //failed to count no. of comments
                            res.json(results);
                        }
                    });
                    //
                } else {
                    //symbol list not found
                    res.json(results);
                }
            } else {
                //failed to query stocks
                res.json(results);
            }
    });
});

module.exports = router;
