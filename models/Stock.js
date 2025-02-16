/**
 * author: Sang Do
 * define scheme for collection Stock using in this project
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var Constant = require("../common/constant.js");

const stockSchema = new Schema({
	symbol: String,
	name: String,
	is_otc: Boolean
});

const Stock = mongoose.model("tbl_stock",  stockSchema, "tbl_stock");


 //
 Stock.prototype.search_by_condition = function (
    condition,
    paging,
    fields,
    sort,
    resp_func   //callback function
  ) {
    Stock.find(condition)
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

// make this available to our users in our Node applications
module.exports = Stock;
