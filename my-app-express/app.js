const express = require("express");
const app = express();
const port = 8080;
const cors = require("cors");

app.use(cors());
// 같은 컴퓨터 로컬 환경에서 포트는 다르지만 호스트가 같은 환경이라 발생한 이슈다
//같은 도메인주소에서 요청이 들어오면 발생하는 이슈를 미들웨어 cors를 express에 실행시켜서 해결

//
app.get("/", (req, res) => {
  res.send("Hello this is db connecting node server!");
});

app.listen(port, () => {
  console.log("Now node server loaded");
});

const mysql = require("mysql");
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "rhkreodid",
  database: "iphone",
});

connection.connect();

let data1;

connection.query("SELECT * from product_Info", (error, rows, fields) => {
  if (error) throw error;
  data1 = rows;
});
app.get("/sayhelo", (req, res) => {
  res.send("hellllllo");
});
app.get("/db", (req, res) => {
  res.send(data1);

  connection.end();
});