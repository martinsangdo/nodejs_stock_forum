var express = require('express');
var router = express.Router();
const request = require('request');
const Constant = require('../common/constant');
var User = require('../models/User');

router.get('/get_all', function(req, res, next) {
    var myInstance = new User();
    //
    myInstance.get_all(
        function(results){
            res.json(results);
    });
});

//POST request
router.post('/create_new', function(req, res, next) {
  var user = new User();

  user.search_by_condition(
      {'usr' : req.body['usr']},
      {skip: 0, limit: 1},
      'usr', {},
      function(res_users){
          if (res_users['data'].length == 0){
            //user NOT existed
            user.create(
                {
                    "name": req.body['name'],
                    "usr": req.body['usr']
                },
                function(results){
                    res.json(results);
                });
          } else {
            res.json(res_users);
          }
      }
  );
});
//PUT request
router.put('/update_me', function(req, res, next) {
  var user = new User();
    user.update(
        {usr: req.body['usr']},
        {name: req.body['name']},
        function(results){
            // console.log(results);
            res.json(results);
        });
});


module.exports = router;
