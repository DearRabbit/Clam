var express = require('express');
var conn = require('../db/connect');
var router = express.Router();

sqlSet = {
  getUserInfo: "select userID, userName, userState, registerDate, realName, email, phone from userinfo where userID = ?",

  getFriendInfo: "",
  register: "insert into userinfo(userName, passWord, salt, userState, realName, email, phone) values (?, ?, ?, ?, ?, ?, ?)",
};

router.post('/getUserInfo', function (req, res, next) {
  conn.getConnection(function (err, conn) {
    if (err) {
      console.log("POOL ==> " + err);
    }

    else {
      conn.query(sqlSet.getUserInfo, [req.query.id], function(err,rows){
        if (err) {
          console.log(err);
        }
        conn.release();

        if (rows.length == 1) {
          console.log(rows[0].registerDate);
          return res.json(rows[0]);
        }
        else {
          return res.json({});
        }
      });
    }
  });
});

router.post('/getFriendInfo', function (req, res, next) {
  conn.getConnection(function (err, conn) {
    if (err) {
      console.log("POOL ==> " + err);
    }

    else {
      conn.query(sqlSet.getFriendInfo, [req.query.id], function(err,rows){
        if (err) {
          console.log(err);
        }
        conn.release();

        return res.json(rows);
      });
    }
  });
});


module.exports = router;
