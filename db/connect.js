var mysql = require('mysql');
var settings = require('./settings');

var conn = mysql.createPool(settings);

module.exports = conn;