/**
 * author: Sang Do
 * define scheme for collection Reply using in this project
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var Constant = require("../common/constant.js");

const mySchema = new Schema({
	cmt_uuid: String,
	uuid: String,
  usr: String,  //username
  text: String, //comment
  like: Number,
  time: Number,
	is_real: Boolean	//indicate this comment was created by real person or not
});

const Reply = mongoose.model("tbl_reply",  mySchema, "tbl_reply");


 //
 Reply.prototype.search_by_condition = function (
    condition,
    paging,
    fields,
    sort,
    resp_func   //callback function
  ) {
    Reply.find(condition)
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
  Reply.prototype.count_by_symbol = function (
  symbols,
  resp_func   //callback function
) {
  Reply.aggregate([
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
Reply.prototype.create = function (data, resp_func) {
	var document = new Reply(data);
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
Reply.prototype.update = function(existed_condition, update_data, resp_func){
	var options = { upsert: false };
	Reply.updateOne(existed_condition, update_data, options, function(err, numAffected){
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
Reply.prototype.delete = function(existed_condition, resp_func){
	Reply.deleteMany(existed_condition, function(err, numAffected){
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
module.exports = Reply;
