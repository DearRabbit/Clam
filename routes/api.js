var express = require('express');
var conn = require('../db/connect');
var crypto = require('crypto');

var router = express.Router();

sqlSet = {
  getUserInfo: "select userID, userName, userState, registerDate, realName, email, phone from userinfo where userID = ?",
  getFriendInfo: "",
  getFriendList: "select * from friendList where mainID = ?",
  setGroupName: "update friendList set groupName = ? where mainID = ? and friendID = ?",

  validation: "select count(userID) as result from userinfo where userName = ? or email = ?",
  register: "insert into userinfo(userName, passWord, salt, userState, realName, email, phone) values (?, ?, ?, 0, ?, ?, ?)",

  sendMsg: "insert into msgLog(senderID, recverID, msgState, msgContent) values (?, ?, 0, ?)",
  recvMsg: "select * from msgLog where msgState = 0 and recverID = ?",

  insertFriend: "insert into friendList values (?, ?, ?)",
  deleteFriend: "delete from friendList where mainID = ? and friendID = ?",

  setOnline: "update userinfo set userState = 1 where userID = ?",
  setOfffine: "update userinfo set userState = 0 where userID = ?",
};

var failRet = {result: -1};
var succRet = {result: 0 };

var waitingList = {};
// Note:
// 1:{2:'name', 3:'gp2'}, 2:{3:'gp1'}}
// for userID = 1, No.2 wants to add him as group 'name'
// No.3 wants to add him as group 'gp2'.

function insertFriend(mainID, friendID, groupName) {
  conn.getConnection(function (err, conn) {
    if (err) {
      console.log("POOL ==> " + err);
    }

    else {
      conn.query(sqlSet.insertFriend, [mainID, friendID, groupName], function(err, rows){
        if (err) {
          console.log(err);
        }
        conn.release();
      });
    }
  });
}

function deleteFriend (mainID, friendID) {
  conn.getConnection(function (err, conn) {
    if (err) {
      console.log("POOL ==> " + err);
    }

    else {
      conn.query(sqlSet.deleteFriend, [mainID, friendID], function(err, rows){
        if (err) {
          console.log(err);
        }
          conn.release();
      });
    }
  });
}

// user management
router.post('/getUserInfo', function (req, res, next) {
  conn.getConnection(function (err, conn) {
    if (err) {
      console.log("POOL ==> " + err);
    }

    else {
      conn.query(sqlSet.getUserInfo, [req.query.id], function(err,rows){
        if (err) {
          console.log(err);
          conn.release();
          return res.json({});
        }
        else {
          conn.release();
          if (rows.length == 0) {
            return res.json({});
          }
          return res.json(rows[0]);
        }
      });
    }
  });
});

router.post('/getFriendList', function (req, res, next) {
  conn.getConnection(function (err, conn) {
    if (err) {
      console.log("POOL ==> " + err);
    }

    else {
      conn.query(sqlSet.getFriendList, [req.query.id], function(err,rows){
        conn.release();
        if (err) {
          console.log(err);
          return res.json({});
        }
        return res.json(rows);
      });
    }
  });
});

router.post('/register', function (req, res, next) {
  conn.getConnection(function (err, conn) {
    if (err) {
      console.log("POOL ==> " + err);
    }

    else {
      var md5_1 = crypto.createHash('md5');
      md5_1.update(req.query.password);

      var pwdInMD5 = md5_1.digest('hex');
      var salt = 'fe9d26c3e620eeb69bd166c8be89fb8f';
      var withSalt = pwdInMD5 + salt;

      var md5_2 = crypto.createHash('md5');
      md5_2.update(withSalt);
      var pwdSalt = md5_2.digest('hex');

      var qSet = [req.query.userName, pwdSalt, salt, req.query.realName, req.query.email, req.query.phone];
      conn.query(sqlSet.register, qSet, function(err,rows){
        conn.release();
        if (err) {
          console.log(err);
          return res.json(failRet);
        }
        return res.json(succRet);
      });
    }
  });
});

router.post('/validation', function (req, res, next) {
  conn.getConnection(function (err, conn) {
    if (err) {
      console.log("POOL ==> " + err);
    }

    else {
      conn.query(sqlSet.validation, [req.query.userName, req.query.email], function(err,rows){
        conn.release();
        if (err) {
          console.log(err);
          return res.json(failRet);
        }
        return res.json(rows[0]);//{result:0}
      });
    }
  });
});

router.post('/askAddFriend', function (req, res, next) {
  if (waitingList[req.query.friendID] == undefined) {
    waitingList[req.query.friendID] = {};
  }
  waitingList[req.query.friendID][req.query.mainID] = req.query.groupName;

  return res.json(succRet);
});

router.post('/getAddFriendList', function (req, res, next) {
  if (waitingList[req.query.id] == undefined) {
    return res.json({});
  }
  else {
    return res.json(waitingList[req.query.id]);
  }
});

router.post('/confirmAddFriend', function (req, res, next) {
  var senderID = req.query.senderID;
  var recverID = req.query.recverID;

  if (waitingList[recverID]) {
    if (waitingList[recverID][senderID]) {
      insertFriend(senderID, recverID, waitingList[recverID][senderID]);
      insertFriend(recverID, senderID, req.query.groupName);
      return res.json(succRet);
    }
    delete waitingList[recverID][senderID];
  }
  return res.json(failRet);
});

router.post('/deleteFriend', function (req, res, next) {
  deleteFriend(req.query.mainID, req.query.friendID);
});

router.post('/sendMsg', function (req, res, next) {
  conn.getConnection(function (err, conn) {
    if (err) {
      console.log("POOL ==> " + err);
    }

    else {
      conn.query(sqlSet.sendMsg, [req.query.senderID, req.query.recverID, req.query.msgContent], function(err, rows){
        conn.release();
        if (err) {
          console.log(err);
          return res.json(failRet);
        }
        return res.json(succRet);
      });
    }
  });
});

router.post('/recvMsg', function (req, res, next) {
  conn.getConnection(function (err, conn) {
    if (err) {
      console.log("POOL ==> " + err);
    }

    else {
      conn.query(sqlSet.sendMsg, [req.query.id], function(err, rows){
        conn.release();
        if (err) {
          console.log(err);
          return res.json({});
        }
        return res.json(rows);
      });
    }
  });
});

router.post('/setGroupName', function (req, res, next) {
  conn.getConnection(function (err, conn) {
    if (err) {
      console.log("POOL ==> " + err);
    }

    else {
      conn.query(sqlSet.setGroupName, [req.query.groupName, req.query.mainID, req.query.friendID], function(err, rows){
        conn.release();
        if (err) {
          console.log(err);
          return res.json(failRet);
        }
        return res.json(succRet);
      });
    }
  });
});

router.post('/setOnline', function (req, res, next) {
  conn.getConnection(function (err, conn) {
    if (err) {
      console.log("POOL ==> " + err);
    }

    else {
      conn.query(sqlSet.setOnline, [req.query.id], function(err, rows){
        conn.release();
        if (err) {
          console.log(err);
          return res.json(failRet);
        }
        return res.json(succRet);
      });
    }
  });
});

router.post('/setOffline', function (req, res, next) {
  conn.getConnection(function (err, conn) {
    if (err) {
      console.log("POOL ==> " + err);
    }

    else {
      conn.query(sqlSet.setOfffine, [req.query.id], function(err, rows){
        conn.release();
        if (err) {
          console.log(err);
          return res.json(failRet);
        }
        return res.json(succRet);
      });
    }
  });
});

module.exports = router;
