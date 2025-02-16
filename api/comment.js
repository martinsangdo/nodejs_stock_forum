/*
author: Sang Do
*/
var express = require('express');
var router = express.Router();
const request = require('request');
const Constant = require('../common/constant');
var Stock = require('../models/Stock');
var Comment = require('../models/Comment');
var User = require('../models/User');
var Reply = require('../models/Reply');

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
    //
    myInstance.search_by_condition(
        condition,
        {skip: req.query['skip'], limit: req.query['limit']},
        'symbol uuid usr like time text',
        {time:-1},
        function(results){
            if (results['result'] == Constant.OK_CODE){
                //1. get user names of comments
                var comment_uuids = [];
                for (var cmt of results['data']){
                    comment_uuids.push(cmt['uuid']);
                }
                //2.get reply details of each comment
                get_replies(comment_uuids, function(res_replies){
                    if (res_replies['result'] == Constant.OK_CODE){
                        //2.1 create map of reply and comment uuid
                        var cmt_uuid_replies_map = {};  //key: comment uuid, value: list of replies
                        for (var reply_obj of res_replies['data']){
                            var reply_list = [];
                            if (cmt_uuid_replies_map[reply_obj['cmt_uuid']] != null){
                                reply_list = cmt_uuid_replies_map[reply_obj['cmt_uuid']];
                            }
                            reply_list.push({
                                "uuid" : reply_obj['uuid'],
                                "usr" : reply_obj['usr'],
                                "like" : reply_obj['like'],
                                "time" : reply_obj['time'],
                                "text" : reply_obj['text']
                            });
                            cmt_uuid_replies_map[reply_obj['cmt_uuid']] = reply_list;
                        }
                        var final_response = {result: Constant.OK_CODE};
                        var comment_details = [];
                        for (var comment of results['data']){
                            comment_details.push({
                                "symbol" : comment['symbol'],
                                "uuid" : comment['uuid'],
                                "usr" : comment['usr'],
                                "like" : comment['like'],
                                "time" : comment['time'],
                                "text" : comment['text'],
                                'replies': cmt_uuid_replies_map[comment['uuid']]
                            });
                        }
                        final_response['data'] = comment_details;
                        res.json(final_response);
                    } else {
                        //cannot get users
                        res.json(results);
                    }
                });
            } else {
                //failed to get comments
                res.json(results);
            }
    });
});
//
function removeDuplicates(arr) {
    return arr.filter((item, index) => arr.indexOf(item) === index);
  }
//
function get_user_details(user_ids, func_callback){
    var user = new User();
    user.search_by_condition(
        {'usr' : {'$in': user_ids}},
        {skip: 0, limit: user_ids.length},
        'usr name',
        {usr: 1},
        function(res_users){
            func_callback(res_users);
        }
    );
}
//
function get_replies(comment_uuids, func_callback){
    var reply = new Reply();
    reply.search_by_condition(
        {'cmt_uuid' : {'$in': comment_uuids}},
        {skip: 0, limit: comment_uuids.length},
        'cmt_uuid uuid usr like time text',
        {time: -1},
        function(res_replies){
            func_callback(res_replies);
        }
    );
}
//This is called from app
router.post('/create_new_comment', function(req, res, next) {
  //check if user existed or not
  var user = new User();
  user.search_by_condition(
      {'usr' : req.body['usr']},
      {skip: 0, limit: 1},
      'usr name',
      {usr: 1},
      function(res_users){
          if (res_users.data == null || res_users.data == 0){
            //user not existed, need to create new one
            user.create({usr: req.body['usr'], name: req.body['name']}, function(usr_created){
              if (usr_created.result == Constant.OK_CODE){
                //user created successfully, now create new comment
                create_new_comment(req, function(resp_new_cmt){
                  res.json(resp_new_cmt);
                });
              } else {
                //created user failed
                res.json({result: Constant.FAILED_CODE, message:'Failed to create new user'});
              }
            });
          } else {
            //user existed
            create_new_comment(req, function(resp_new_cmt){
              res.json(resp_new_cmt);
            });
          }
      }
  );
});

function create_new_comment(req, _callback){
  var comment = new Comment();
  comment.create(
      {
        symbol: req.body['symbol'],
        uuid: req.body['uuid'],
        usr: req.body['usr'],  //username
        text: req.body['text'], //comment content
        like: 0,
        time: req.body['time'],
        is_real: true
      }, _callback);
}

//This is called from app
router.delete('/delete_comment', function(req, res, next) {
  var comment = new Comment();
  comment.deleteOne(
      {
        uuid: req.query['uuid']
      }, function(resp_del_comment){
        // console.log(resp_del_comment);
        if (resp_del_comment.result == Constant.OK_CODE){
          //delete comments successfully
          //delete replies of comments
          var reply = new Reply();
          reply.delete({cmt_uuid: req.body['uuid']}, function(resp_del_reply){
            res.json(resp_del_reply);
          });
        } else {
          res.json(resp_del_comment);
        }
      });
});

//PUT request
router.put('/like_comment', function(req, res, next) {
  var comment = new Comment();
  comment.search_by_condition(
      {'uuid' : req.body['uuid']},
      {skip: 0, limit: 1},
      'like', {},
      function(resp){
        var new_like = 1;
        if (resp['data'] != null && resp['data'].length > 0 && resp['data'][0]['like'] != null){
          new_like += resp['data'][0]['like'];
        }
        comment.update(
            {uuid: req.body['uuid']},
            {like: new_like},
            function(results){
                // console.log(results);
                res.json(results);
            });
      }
  );
});

//This is called from app
router.post('/create_new_reply', function(req, res, next) {
  var reply = new Reply();
  reply.create(
      {
        cmt_uuid: req.body['cmt_uuid'],
        uuid: req.body['uuid'],
        usr: req.body['usr'],  //username
        text: req.body['text'], //comment content
        like: 0,
        time: req.body['time'],
        is_real: true
      },
      function(results){
          res.json(results);
      });
});

//PUT request
router.put('/like_reply', function(req, res, next) {
  var reply = new Reply();
  reply.search_by_condition(
      {'uuid' : req.body['uuid']},
      {skip: 0, limit: 1},
      'like', {},
      function(resp){
        var new_like = 1;
        if (resp['data'] != null && resp['data'].length > 0 && resp['data'][0]['like'] != null){
          new_like += resp['data'][0]['like'];
        }
        reply.update(
            {uuid: req.body['uuid']},
            {like: new_like},
            function(results){
                // console.log(results);
                res.json(results);
            });
      }
  );
});
//
module.exports = router;
