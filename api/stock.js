var express = require('express');
var router = express.Router();

//http://localhost:3000/stock/chart
//https://nodejs-stock-forum.onrender.com/stock/chart
router.get('/chart', function(req, res, next) {
    res.render('chart');
});

module.exports = router;
