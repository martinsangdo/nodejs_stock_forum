/**
 * author: Sang Do
 * define scheme for collection Movie using in this project
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var Constant = require("../common/constant.js");

const movieSchema = new Schema({
	cast: {type: Array},
	poster: String,
    title: String,
    fullplot: String,
    year: Number,
    imdb: Object,
    tomatoes: Object,
    type: String,
	awards: Object
});

const Movie = mongoose.model("movies",  //"movies" is the collection name
    movieSchema);


 //
 Movie.prototype.search_by_condition = function (
    condition,
    paging,
    fields,
    sort,
    resp_func   //callback function
  ) {
    Movie.find(condition)
      .limit(paging.limit)
      .skip(paging.skip)
      .select(fields)
      .sort(sort)
      .exec(function (err, res) {
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

  //create new document
  Movie.prototype.create = function (data, resp_func) {
    var document = new Movie(data);
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
Movie.prototype.update = function(existed_condition, update_data, resp_func){
    var options = { upsert: false };
    Movie.updateOne(existed_condition, update_data, options, function(err, numAffected){
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
module.exports = Movie;
