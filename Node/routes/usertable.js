var express = require("express");
var router = express.Router();
const connector = require("../poolconnect");
router.get("/createtable", function (req, res) {
  const sql =
    "CREATE TABLE usertable(id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(25), password VARCHAR(100), date_of_creation DATE)";
  connector.query(sql, (err, results, fields) => {
    res.json({ err, results, fields });
  });
});
router.get("/", (req, res) => {
  const sql = "SELECT * FROM usertable";
  connector.query(sql, (err, results, fields) => {
    if (err) {
      res.json({ err });
    } else {
      res.json({ results });
    }
  });
});
router.post("/", (req, res) => {
  const date_of_creation = new Date();
  const { id, username, password } = req.body;
  const checkingsql = `SELECT * FROM usertable WHERE username =?`;
  connector.query(checkingsql, [username], (err, results, fields) => {
    if (err) {
      res.json(err);
    } else {
      if (results.length > 0) {
        res.json({ status: 0, data: "username already exists" });
      } else {
        const sql = "INSERT INTO usertable VALUES(?,?,?,?)";
        connector.query(
          sql,
          [id, username, password, date_of_creation],
          function (err, results, fields) {
            if (err) {
              res.json(err);
            } else {
              res.json({ status: 1, data: "user created" });
            }
          }
        );
      }
    }
  });
});
router.delete("/:id", (req, res) => {
  const sql = `DELETE FROM usertable WHERE id=?`;
  connector.query(sql, [req.params.id], (err, results, fields) => {
    res.json({ err, results, fields });
  });
});
router.put("/:id", (req, res) => {
  const date_of_creation = new Date();
  const { username, password } = req.body;
  const sql = `UPDATE usertable SET username=?, password=?, date_of_creation=? WHERE id=?`;
  connector.query(
    sql,
    [username, password, date_of_creation, req.params.id],
    (err, results, fields) => {
      res.json({ err, results, fields });
    }
  );
});
router.get("/deleteall", (req, res) => {
  const sql = "DELETE FROM usertable";
  connector.query(sql, (err, results, fields) => {
    res.json({ err, results, fields });
  });
});
router.get("/checklogin/:username/:password", (req, res) => {
  const { username, password } = req.params;
  const sql = `SELECT * FROM usertable WHERE username=? and password=?`;
  connector.query(sql, [username, password], (err, results) => {
    if (err) {
      res.json(err);
    } else {
      if (results.length === 0) {
        req.session.isLoggedIn = 0;
        res.json({ status: 0, data: "incorrect login details" });
      } else {
        req.session.username = req.params.username;
        req.session.isLoggedIn = 1;
        res.json({ status: 1, data: req.params.username });
      }
    }
  });
});
router.get("/loggeduser", (req, res) => {
  if (req.session.isLoggedIn === 1) {
    const sql = `SELECT * FROM usertable WHERE username=?`;
    connector.query(sql, [req.session.username], (err, results) => {
      if (err) {
        res.json(err);
      } else {
        res.json({ status: 1, data: results });
      }
    });
  } else {
    res.json({ status: 0, debug_data: "you are not logged in" });
  }
});
module.exports = router;
