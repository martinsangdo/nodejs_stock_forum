/**
 * author: Sang Do
 * define scheme for collection Comment using in this project
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var Constant = require("../common/constant.js");

const commentSchema = new Schema({
	symbol: String,
	uuid: String,
  usr: String,  //username
  text: String, //comment content
  like: Number,
  time: Number,
	is_real: Boolean	//indicate this comment was created by real person or not
});

const Comment = mongoose.model("tbl_comment",  commentSchema, "tbl_comment");


 //
 Comment.prototype.search_by_condition = function (
    condition,
    paging,
    fields,
    sort,
    resp_func   //callback function
  ) {
    Comment.find(condition)
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
 Comment.prototype.count_by_symbol = function (
  symbols,
  resp_func   //callback function
) {
  Comment.aggregate([
      {
      "$match": { // Apply the condition here
              "symbol": { "$in": symbols }
          }
      },
      {
          "$group": {
              "_id": { "symbol": "$symbol" },
              "count": { "$sum": 1 }
          }
      }
    ])
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
          data: res
        };
        resp_func(resp);
      }
    });
};

//create new document
Comment.prototype.create = function (data, resp_func) {
	var document = new Comment(data);
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
Comment.prototype.update = function(existed_condition, update_data, resp_func){
	var options = { upsert: false };
	Comment.updateOne(existed_condition, update_data, options, function(err, numAffected){
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

//
Comment.prototype.deleteOne = function(existed_condition, resp_func){
	Comment.deleteOne(existed_condition, function(err, numAffected){
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
module.exports = Comment;
