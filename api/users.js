var express = require('express');
var router = express.Router();
const request = require('request');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('user', { name: 'hi' });
});
//get and show website data
router.get('/list', function(req, res, next) {
  const showName = req.query.title; // Encode spaces for URL

  const url = `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(showName)}`;

  request(url, (error, response, body) => {
    if (error) {
      console.error('Error:', error);
      res.render('list', { error: error });
    } else {
      // Parse the JSON response
      res.render('list', { list: JSON.parse(body) });
    }
  });

});
//vue
router.get('/vue', function(req, res, next) {
  res.render('test1');
});

module.exports = router;
