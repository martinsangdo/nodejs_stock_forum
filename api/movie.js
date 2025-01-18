var express = require('express');
var router = express.Router();
const request = require('request');
var Movie = require('../models/Movie');


/* GET movies listing. */
router.get('/list', function(req, res, next) {
    var movie = new Movie();
    movie.search_by_condition(
        {},
        {limit:10},
        '',
        {},
        function(results){
            // console.log(results);
            res.render('movie', { list: results['data'] });
    });
});
//Exercise
router.get('/list_test', function(req, res, next) {
    var movie = new Movie();
    movie.search_by_condition(
        {year: req.query.year},
        {limit:10},
        '',
        {},
        function(results){
            // console.log(results);
            res.json(results);
        });
});
//POST request
router.post('/create_new', function(req, res, next) {
    var movie = new Movie();
    movie.create(
        {
            "title": req.body['title'],
            "year": req.body['year']
        },
        function(results){
            // console.log(results);
            res.json(results);
        });
});
//PUT request
router.put('/update_me', function(req, res, next) {
    var movie = new Movie();
    movie.update(
        {_id: req.body['_id']},
        {year: req.body['year']},
        function(results){
            // console.log(results);
            res.json(results);
        });
});
//todo DELETE request
router.delete('/delete_it', function(req, res, next) {
    //you do it
});

module.exports = router;
