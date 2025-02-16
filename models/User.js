/**
 * author: Sang Do
 * define scheme for collection using in this project
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var Constant = require("../common/constant.js");

const mySchema = new Schema({
	name: String,
  usr: String  //username
});

const User = mongoose.model("tbl_user",  mySchema, "tbl_user");

 //
 User.prototype.search_by_condition = function (
    condition,
    paging,
    fields,
    sort,
    resp_func   //callback function
  ) {
    User.find(condition)
      .limit(paging.limit)
      .skip(paging.skip)
      .select(fields)
      .sort(sort)
      .exec(function (err, res) {
        // console.log(err);
        // console.log(res);
        if (err) {
          var resp = {
            result: Constant.FAILED_CODE,
            message: Constant.SERVER_ERR,
            name: err.name,
            kind: err.kind,
          };
          resp_func(resp);
        } else {
          var resp = {
            result: Constant.OK_CODE,
            data: res,
            skip: paging.skip,
          };
          resp_func(resp);
        }
      });
  };

	//
  User.prototype.get_all = function (
     resp_func   //callback function
   ) {
     User.find().select('name usr')
       .exec(function (err, res) {
         // console.log(err);
         // console.log(res);
         if (err) {
           var resp = {
             result: Constant.FAILED_CODE,
             message: Constant.SERVER_ERR,
             name: err.name,
             kind: err.kind
           };
           resp_func(resp);
         } else {
           var resp = {
             result: Constant.OK_CODE,
             data: res
           };
           resp_func(resp);
         }
       });
   };
  //

	  //create new document
	  User.prototype.create = function (data, resp_func) {
	    var document = new User(data);
	    document.save(function (err, result) {
	      if (err) {
	        var resp = {
	          result: Constant.FAILED_CODE,
	          message: Constant.SERVER_ERR,
	          err: err,
	        };
	        resp_func(resp);
	      } else {
	        var resp = { result: Constant.OK_CODE, _id: result["_id"] };
	        resp_func(resp);
	      }
	    });
	  };

	    //
	User.prototype.update = function(existed_condition, update_data, resp_func){
	    var options = { upsert: false };
	    User.updateOne(existed_condition, update_data, options, function(err, numAffected){
	        // numAffected is the number of updated documents
	        if(err) {
	            var resp = {
	                result : Constant.FAILED_CODE,
	                message: Constant.SERVER_ERR,
	                err: err
	            };
	            resp_func(resp);
	        }else{
	            var resp = {
	                result : Constant.OK_CODE
	            };
	            resp_func(resp);
	        }
	    });
	};

// make this available to our users in our Node applications
module.exports = User;
