var express = require('express');
var router = express.Router();
const request = require('request');
const Constant = require('../common/constant');
var Stock = require('../models/Stock');
var Comment = require('../models/Comment');
const https = require('https'); // For HTTPS requests (recommended)

//return iframe of chart
router.get('/chart', function(req, res, next) {
    res.render('chart', {symbol: req.query['symbol']});
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
        //todo remember to change skip & limit from the app
        condition = {'symbol' : {'$in': req.query['symbol_list'].split(',')}};
    }
    //for search by keyword
    if (req.query['keyword'] != null){
        //todo remember to change skip & limit from the app
        condition = {
          "$or": [
            {"symbol": {"$regex": req.query['keyword'], "$options": "i"}},
            {"name": {"$regex": req.query['keyword'], "$options": "i"}}
          ]
        };
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
                  if (stock['name'] != null && stock['name'] != ''){
                    symbol_list.push(stock['symbol']);
                  }
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
                              if (stock['name'] != null && stock['name'] != ''){
                                stock_details.push({
                                    'symbol': stock['symbol'],
                                    'name': stock['name'],
                                    'comment_count': symbol_comment_count_map[stock['symbol']] != null?symbol_comment_count_map[stock['symbol']]:0
                                });
                              }
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
/*
  This API is called in homepage
  1. Get info of random stocks
  2. Get info of favorited stocks (optional)
  Input: list of symbols (requied)
  Output: [uuid, name, description, comment count, is_otc]
*/
router.get('/list_by_symbols', function(req, res, next) {
    var myInstance = new Stock();
    //
    symbol_list = req.query['symbol_list'].split(',');
    var condition = {};
    //
    myInstance.search_by_condition(
        {'symbol' : {'$in': symbol_list}},
        {skip: 0, limit: symbol_list.length},
        'symbol name is_otc',
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
                                    'symbol': stock['symbol'],
                                    'name': stock['name'],
                                    'is_otc': stock['is_otc'] != null ? stock['is_otc'] : false,
                                    'comment_count': symbol_comment_count_map[stock['symbol']] != null?symbol_comment_count_map[stock['symbol']]:0
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
//generate text for chatbox
router.post('/chatbot', function(req, res, next) {
  if (req.body['text'] == null || req.body['text'] == ''){
    res.json({result: Constant.FAILED_CODE, message: 'Please input text'});
  } else {
    //todo generate new session, if not
    //console.log(req.body['session_id']);
    //console.log(req.body['text']);
    //call API to generate text
    getGeminiText(req.body['text'].trim(), function(str_response){
      //parse response from Gemini
      var objGeminiResponse = JSON.parse(str_response);
      //console.log(objGeminiResponse);
      if (objGeminiResponse['candidates'] != null){
        res.json({result: Constant.OK_CODE, text: objGeminiResponse['candidates'][0]['content']['parts'][0]['text']});
      } else {
        console.log('Failed Gemini', objGeminiResponse);
        //something wrong
        res.json({result: Constant.FAILED_CODE, message: 'Cannot get data from AI service'});
      }
    });
  }
});
//
function getGeminiText(str_text, _callback){
  //Perhaps add initial string like this will cause API exhausted?
  //var final_prompt = "You are an AI assistant specialized in providing information about Over-the-counter (OTC) stocks. A user will ask you questions. Provide helpful, informative, and accurate responses. Be cautious and avoid giving financial advice. Clearly state that you are an AI and cannot give financial advice.";
  //str_text = final_prompt + 'User: ' + str_text.trim();
  var gemini_url = process.env.GEMINI_URL;
  var header = {'Content-Type': 'application/json'};
  var body = {
    "contents": {
        "parts": [
            {
                "text": str_text
            }
        ]
    }
  }
  //send the request
    const url = new URL(gemini_url); // Use URL class for easier parsing
    const options = {
      hostname: url.hostname,
      path: gemini_url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json' // Or appropriate content type
      },
    };
    //console.log(options);

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData); // Attempt to parse JSON
          _callback(parsedData); // Resolve with parsed data
        } catch (error) {
          _callback(responseData); // Resolve with raw response if not JSON
        }
      });
    });
    req.on('error', function (e) {
      console.log("Error : " + e.message);
      _callback(e.message);
    });

    // write data to request body
    req.write(JSON.stringify(body));
    req.end();
}

module.exports = router;
