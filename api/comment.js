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
                var user_ids = [];
                var comment_uuids = [];
                for (var cmt of results['data']){
                    user_ids.push(cmt['usr']);
                    comment_uuids.push(cmt['uuid']);
                }
                if (user_ids.length == 0){
                    //no comment
                    res.json(results);
                } else {
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
                                user_ids.push(reply_obj['usr']);
                            }
                            //2.2 Get user name
                            user_ids = removeDuplicates(user_ids);
                            get_user_details(user_ids, function(res_users){
                                if (res_users['result'] == Constant.OK_CODE){
                                    //1.1 create map of usr and name
                                    var usr_name_map = {};  //key: usr, value: name
                                    for (var user_obj of res_users['data']){
                                        usr_name_map[user_obj['usr']] = user_obj['name'];
                                    }
                                    //3. compose all into comment details
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
                                    final_response['users'] = usr_name_map;
                                    final_response['data'] = comment_details;
                                    res.json(final_response);
                                } else {
                                    //cannot get users
                                    res.json(results);
                                }
                            });
                        } else {
                            //cannot get users
                            res.json(results);
                        }
                    });
                }
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
//
module.exports = router;
