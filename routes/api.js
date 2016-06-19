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

  login: "select passWord, salt from userinfo where userID = ?",
};

var failRet = {result: -1};
var succRet = {result: 0 };

var waitingList = {};
// Note:
// 1:{2:'name', 3:'gp2'}, 2:{3:'gp1'}}
// for userID = 1, No.2 wants to add him as group 'name'
// No.3 wants to add him as group 'gp2'.

var loginsession = {};
// key(id):value(randomString.32)


function randomString()
{
  var chars = 'abcdefghijklmnopqrstuvwxyz1234567890';
  var maxPos = chars.length;
  var pwd = '';
  for (var i = 0; i < 32; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return pwd;
}

function insertFriend(mainID, friendID, groupName)
{
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

function deleteFriend (mainID, friendID)
{
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

function setOnline(id)
{
  conn.getConnection(function (err, conn) {
    if (err) {
      console.log("POOL ==> " + err);
    }

    else {
      conn.query(sqlSet.setOnline, [id], function(err, rows){
        conn.release();
        if (err) {
          console.log(err);
        }
      });
    }
  });
}

function setOffline(id)
{
  conn.getConnection(function (err, conn) {
    if (err) {
      console.log("POOL ==> " + err);
    }

    else {
      conn.query(sqlSet.setOfffine, [id], function(err, rows){
        conn.release();
        if (err) {
          console.log(err);
        }
      });
    }
  });
}

function genpwdWithSalt(pwd, salt) {
  var md5_1 = crypto.createHash('md5');
  md5_1.update(pwd);

  var pwdInMD5 = md5_1.digest('hex');
  var withSalt = pwdInMD5 + salt;

  var md5_2 = crypto.createHash('md5');
  md5_2.update(withSalt);
  var pwdSalt = md5_2.digest('hex');

  return pwdSalt;
}

whiteList = ['/login', '/register', '/validation', '/test'];
router.use(function(req, res, next) {
  if (whiteList.indexOf(req.url.split('?')[0]) != -1) {
    next();
  }
  else if (req.body.sessionID && req.body.sessionSecret && loginsession[req.body.sessionID]==req.body.sessionSecret) {
    next();
  }
  else return res.sendStatus(400);
});

// user management
router.post('/getUserInfo', function (req, res, next) {
  conn.getConnection(function (err, conn) {
    if (err) {
      console.log("POOL ==> " + err);
    }

    else {
      conn.query(sqlSet.getUserInfo, [req.body.id], function(err,rows){
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
      conn.query(sqlSet.getFriendList, [req.body.id], function(err,rows){
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
      var salt = randomString();
      var pwdSalt = genpwdWithSalt(req.body.password, salt);

      var qSet = [req.body.userName, pwdSalt, salt, req.body.realName, req.body.email, req.body.phone];
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
      conn.query(sqlSet.validation, [req.body.userName, req.body.email], function(err,rows){
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
  if (waitingList[req.body.friendID] == undefined) {
    waitingList[req.body.friendID] = {};
  }
  waitingList[req.body.friendID][req.body.mainID] = req.body.groupName;

  return res.json(succRet);
});

router.post('/getAddFriendList', function (req, res, next) {
  if (waitingList[req.body.id] == undefined) {
    return res.json({});
  }
  else {
    return res.json(waitingList[req.body.id]);
  }
});

router.post('/confirmAddFriend', function (req, res, next) {
  var senderID = req.body.senderID;
  var recverID = req.body.recverID;

  if (waitingList[recverID]) {
    if (waitingList[recverID][senderID]) {
      insertFriend(senderID, recverID, waitingList[recverID][senderID]);
      insertFriend(recverID, senderID, req.body.groupName);
      return res.json(succRet);
    }
    delete waitingList[recverID][senderID];
  }
  return res.json(failRet);
});

router.post('/deleteFriend', function (req, res, next) {
  deleteFriend(req.body.mainID, req.body.friendID);
});

router.post('/sendMsg', function (req, res, next) {
  conn.getConnection(function (err, conn) {
    if (err) {
      console.log("POOL ==> " + err);
    }

    else {
      conn.query(sqlSet.sendMsg, [req.body.senderID, req.body.recverID, req.body.msgContent], function(err, rows){
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
      conn.query(sqlSet.sendMsg, [req.body.id], function(err, rows){
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
      conn.query(sqlSet.setGroupName, [req.body.groupName, req.body.mainID, req.body.friendID], function(err, rows){
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

router.post('/login', function (req, res, next) {
  var sessionSecrect = randomString();

  conn.getConnection(function (err, conn) {
    if (err) {
      console.log("POOL ==> " + err);
    }

    else {
      conn.query(sqlSet.login, [req.body.sessionID], function(err, rows){
        conn.release();
        if (err) {
          console.log(err);
          return res.json(failRet);
        }
        if (rows.length == 0) {
          return res.json(failRet);
        }
        var sessionpwdWithSalt = genpwdWithSalt(req.body.sessionPWD, rows[0].salt);
        if (sessionpwdWithSalt != rows[0].passWord) {
          console.log('wrong password!');
          return res.json(failRet);
        }
        setOnline(req.body.sessionID);
        loginsession[req.body.sessionID] = sessionSecrect;

        console.log(loginsession);
        return res.json({result:0, sessionSecret:sessionSecrect});
      });
    }
  });
});

router.post('/logout', function (req, res, next) {
  if (loginsession[req.body.sessionID] != undefined) {
    delete loginsession[req.body.sessionID];
    console.log('logout!');
    setOffline(req.body.sessionID);
    return res.json(succRet);
  }
  else {
    console.log('logout error!');
    return res.json(failRet);
  }
});

router.post('/test', function (req, res, next) {
  return res.json(succRet);
});

module.exports = router;
