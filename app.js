const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");
let jwt = require("jsonwebtoken");
const { verifyToken } = require("./middleware");
const numberGenerator = require("./numberGenerator");
const dbinfo = require("./dbSetting");
const dayg = require("./dayG");

let secretObj = "blipsblops";

app.use(cors());
app.use(express.json());

process.on("uncaughtException", function (err) {
  console.error(new Date().toUTCString() + " uncaughtException:", err);
  console.error(err);
  console.log(err);
  process.exit(1);
});
//전체 에러 핸들링

// 같은 컴퓨터 로컬 환경에서 포트는 다르지만 호스트가 같은 환경이라 발생한 이슈다
//같은 도메인주소에서 요청이 들어오면 발생하는 이슈를 미들웨어 cors를 express에 실행시켜서 해결
// http 컨텐츠 타입 알아보기
app.get("/", (req, res) => {
  res.send("asdfasdf" + (message = "Hello this is db connecting node server!"));
});

app.listen(port, () => {
  console.log("Now node server loaded");
});
const mysql = require("mysql");
const dayG = require("./dayG");
const connection = mysql.createConnection(dbinfo);

connection.connect();

let data1;
let sqltemp;

app.get("/sayhelo", (req, res) => {
  res.send("hellllllo");
});

app.get("/db", (req, res) => {
  res.send(data1);
});
let image_numbering;
app.get("/image/:numbering", (req, res) => {
  image_numbering = req.params.numbering;
  connection.query(
    `SELECT * FROM iphone.images WHERE numbering =${image_numbering}`,
    (error, rows, fields) => {
      if (error) throw error;
      sqltemp = rows;
      res.send(sqltemp);
      console.log(res);
    }
  );
});

// function findImageName(numbering) {
//   console.log(
//     "SELECT * FROM iphone.images WHERE numbering =" + { numbering } + ";"
//   );

//   return sqltemp;
// }
//// 이하jwt

function handleEr(res) {
  return res.send("nodata");
}

app.post("/login", async (req, res) => {
  let loginInfo;
  let userIdnum;
  let yourId;
  let yourUID;

  if (req) {
    loginInfo = {
      usersID: req.body.usersid,
      usersPW: req.body.userspw,
    };
  } else {
    return res.send(400);
  }

  try {
    connection.query(
      `SELECT*FROM iphone.user_info WHERE user_ID='${loginInfo.usersID}' AND user_PW='${loginInfo.usersPW}'`,

      (error, rows, fields) => {
        console.log("sql출력");
        console.log(rows[0]);

        if (rows[0] === undefined) {
          error = "nodata";
          console.log("nodata");
          throw error;
        }
        if (rows[0].UID) {
          console.log("not error");
          console.log("rows" + rows[0].UID);

          const temp = rows[0].UID;
          userIdnum = temp;
          yourId = loginInfo.usersID;
          console.log("this is uid[0].UID  " + userIdnum);
        }

        console.log("db실행끝");
        const jwtToken = jwt.sign(
          {
            UID: userIdnum.toString(),
            userId: yourId,
            exp: Math.floor(Date.now() / 1000) + 60 * 120,
          },
          secretObj
        );
        console.log(jwtToken);
        console.log(userIdnum);

        let asdfsdaf = jwt.verify(jwtToken, secretObj);
        console.log("asdfsadf" + asdfsdaf.UID);
        return res.json({
          code: 200,
          message: "false",
          jwtToken,
          uid: userIdnum,
          username: yourId,
        });
      }
    );
  } catch (error) {
    console.log("에러문실행");
    console.log(error);
    res.json({
      code: 200,
      message: "true",
    });
    return app.js;
  }
});

app.get("/verify", verifyToken, (req, res) => {
  console.log("인증완료");
});

let pageNum = 0;
let startNum = 0;
let category = "";
let addTagsql = "";

app.post("/productInfo/:category/:startNum", (req, res) => {
  startNum = req.params.startNum;
  category = req.params.category;

  console.log("페이지 쿼리값" + JSON.stringify(req.query));
  pageNum = startNum;

  if (pageNum === (undefined || NaN)) {
    pageNum = 1;
    console.log("pageNuma is undefined");
    res.render("error", {
      message: { reconnect: true },
    });
    return app.js;
  }
  pageNum = Number(pageNum);
  let lengthss = 0;
  let startPage = 0;

  if (pageNum <= 0) {
    pageNum = 1;
  }
  startPage = (pageNum - 1) * 20;

  if (req.body.tags.length > 0) {
    let arr = Object.values(req.body.tags);
    addTagsql += " AND (";
    for (let i = 0; i < arr.length; i++) {
      if (i === 0) {
        addTagsql += `productTag LIKE '%${arr[i]}%'`;
      }
      if (i != 0) {
        addTagsql += `AND productTag LIKE '%${arr[i]}%'`;
        console.log("ff");
      }
    }
    addTagsql += ") ";
  }

  try {
    connection.query(
      "SELECT * FROM iphone.productinfo_shop WHERE productCategory='" +
        category +
        "'" +
        addTagsql,
      (error, rows, fields) => {
        if (rows != undefined) {
          lengthss = rows.length;
          lengthss = lengthss.toString();
        } else {
          lengthss = 1;
        }
      }
    );
    connection.query(
      "SELECT * FROM iphone.productinfo_shop WHERE productCategory='" +
        category +
        "'" +
        addTagsql +
        "LIMIT " +
        startPage.toString() +
        ",20",
      (error, rows, fields) => {
        if (error) throw error;
        sqltemp = JSON.stringify(rows);
        addTagsql = "";
        return res.json({
          code: 200,
          total: lengthss,
          sqltemp,
        });
      }
    );
  } catch (error) {
    console.log(error);
    addTagsql = "";

    res.send("overflow limit");
    return app.js;
  } //원래 returnapp.js 되있는대 내가 쓰고도 왜 저기가 app.js인지 모르겠음.
});

app.post("/putIncart", (req, res) => {
  // req.params= { oid: oids, uids:uid, cart: sendCart, totalPrice: price }
  let oderInfo = req.body;
  const oderProduct = JSON.parse(JSON.parse(req.body.cart));
  if (oderProduct[0].productId === "") {
    return res.send("nodata");
  }
  const temp = oderInfo.uid;
  oderInfo.uid = Number(temp);
  const orderNumber = numberGenerator();
  const Oid = {
    oid: orderNumber,
  };
  let today = new Date();
  let endDay = new Date(today);

  endDay.setDate(today.getDate() + 3);
  const shippingDays = {
    orderSday: dayG(today, "yyyy-MM-dd"),
    oderEnday: dayG(endDay, "yyyy-MM-dd"),
  };

  const sql1 =
    "INSERT INTO iphone.order_info " +
    "(oid, orderSday, daytoEnd, orderCondition,uid) " +
    "VALUES (?,?,?,?,?);";
  var values1 = [
    orderNumber,
    shippingDays.orderSday,
    shippingDays.oderEnday,
    "ready",
    oderInfo.uid,
  ];
  let sql1s = mysql.format(sql1, values1);
  try {
    connection.query(sql1s, (error, rows, fields) => {
      if (error) throw error;
    });
  } catch (error) {
    console.log(error);
    addTagsql = "";
    res.send("FAIL");
    return app.js;
  }
  console.log("values1");
  console.log(values1);
  const sql2 =
    "INSERT INTO iphone.order_product " +
    "(productId,amount,price, oid) " +
    "VALUES (?,?,?,?);";

  let values2 = [];

  for (let k = 0; k < oderProduct.length; k++) {
    let temp1 = {
      productId: oderProduct[k].productId,
      amount: oderProduct[k].amount,
      price: oderProduct[k].price,
      ...Oid,
    };
    values2.push(Object.values(temp1));
  }
  console.log("values2");
  console.log(values2);
  for (let i = 0; i < values2.length; i++) {
    let sql2s = mysql.format(sql2, values2[i]);
    try {
      connection.query(sql2s, (error, rows, fields) => {
        if (error) throw error;
        res.send("saved");
        return app.js;
      });
    } catch (error) {
      console.log(error);
      addTagsql = "";
      res.send("FAIL");
      return app.js;
    }
  }
});

app.post("/getOderinfo", (req, res) => {
  console.log("oid조회");
  const uid = req.body.uid;
  let result2;
  let result3;

  try {
    let sql =
      "SELECT *FROM iphone.order_info JOIN iphone.order_product ON iphone.order_info.oid = iphone.order_product.oid WHERE iphone.order_info.uid = ? AND ( iphone.order_info.orderCondition = 'ready' OR iphone.order_info.orderCondition = 'moveon')";
    let sqls1 = mysql.format(sql, uid);
    connection.query(sqls1, (error, rows, fields) => {
      console.log(rows);

      res.json({
        code: 200,
        yourData: rows,
      });
      return app.js;
    });
  } catch (error) {
    console.log(error);
    addTagsql = "";
    res.send("FAIL");
    return app.js;
  }
});

app.post("/registeUser", (req, res) => {
  let overlaps = false;
  const users = {
    inputId: req.params.input_id,
    inputPw: req.params.input_pw,
  };
  try {
    connection.query(
      "SELECT * FROM iphone.user_info WHERE user_ID='" + inputId + "'",
      (error, rows, fields) => {
        if (rows != null || rows != undefined) {
          overlaps = true;
          res.json({ code: 200, result: "overlap" });
          return app.js;
        } else {
          try {
            //string보낼수있게만 하면 완성
            connection.query(
              "INSERT INTO user_info values" + "'" + UID,
              input_id + "'" + ",'" + input_pw + "'," + NULL,
              (error) => {
                res.json({ code: 200, result: "complete" });
                return app.js;
              }
            );
          } catch (error) {
            res.json({ code: 200, result: "error" });
            return app.js;
          }
        }
      }
    );
  } catch (error) {
    res.json({ code: 200, result: "error" });
    return app.js;
  }
});

async function getFindDepth(sqls2) {
  return new Promise((resolve, reject) => {
    connection.query(sqls2, (error, rows, fields) => {
      console.log("depth:");

      console.log(rows[0]);

      if (error) {
        resolve("error");
      }

      if (typeof rows[0] === "undefined" || rows[0] === null) {
        console.log(" depth 0임");
        return resolve(0);
      }
      if (Number(rows[0].depth) === 0) {
        console.log(" depth 1임");
        return resolve(0);
      }
      // else {
      //   console.log(" depth +1임");
      //   return resolve(rows[0].depth + 1);
      // }
    });
  });
}

async function getFindPlace(sqls1) {
  return new Promise((resolve, reject) => {
    connection.query(sqls1, (error, rows, fields) => {
      console.log("places:");
      console.log(rows[0]);
      if (error) {
        return resolve("error");
      }
      if (rows[0] === undefined || rows[0] === null) {
        console.log("알수없어서 place 0임");
        return resolve(0);
      }
      if (rows[0].place === 0) {
        console.log("place 1임");

        return resolve(1);
      } else {
        console.log(" place +1임");

        return resolve(rows[0].place + 1);
      }
    });
  });
}

/*
 * 게시글번호 pid:int
 * 유저아이디 uid:int
 * 댓글내용 comment:string
 * 셀렉트 한마디 line:string
 * 게시글 평점 rating:int
 * 댓글의 깊이 depth:int   db에 조회 후 결정
 * 댓글등록 순서 place:int  db에 조회 후 결정
 * 작성시간 timeTowrite:string 여기서 생성
 * 유저이름 userName:string
 */
app.post("/inputComment", async (req, res) => {
  console.log(req.body);
  const CommentInfo = req.body;

  for (let key in CommentInfo) {
    if (CommentInfo[key] === undefined || CommentInfo[key] === null) {
      throw error;
    }
  }

  try {
    const sql1 = `SELECT depth FROM iphone.comment_table WHERE pid=? ORDER BY depth DESC`;
    // 깊이와 순서 조회
    let values = [CommentInfo.pid];
    let sqls1 = mysql.format(sql1, values);

    const sql2 = `SELECT place FROM iphone.comment_table WHERE pid=? ORDER BY place DESC`;
    let sqls2 = mysql.format(sql2, values);
    console.log("res");
    console.log(CommentInfo);
    const pfuntion = Promise.all([
      getFindDepth(sqls1),
      getFindPlace(sqls2),
    ]).then((res) => {
      let findDepth = res[0];
      let findPlace = res[1];
      if (res[0] === "error" || res[1] === "error") {
        throw error;
      }

      let date1 = new Date();
      date1 = dayG(date1, "yyyy-MM-dd");
      let ComentObj = [
        CommentInfo.pid,
        CommentInfo.uid,
        CommentInfo.comment,
        CommentInfo.line,
        CommentInfo.rating,
        findDepth,
        findPlace,
        date1,
        CommentInfo.userName,
      ];

      const sql3 =
        "INSERT INTO iphone.comment_table " +
        "(pid,uid,comment,line,rating,depth,place,timeTowrite,userName) " +
        "VALUES (?,?,?,?,?,?,?,?,?);";

      let sqls3 = mysql.format(sql3, ComentObj);

      connection.query(sqls3, (error, rows, fields) => {
        if (error) throw error;
      });
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: 400,
      message: "fail",
    });
    return app.js;
  }
  res.send({ code: 200, result: "complete" });
});

app.get(`/product/review/:productId`, (req, res) => {
  const searchId = req.params.productId;
  const sql1 = `SELECT*FROM iphone.comment_table WHERE pid = ? ORDER BY timeTowrite`;
  const values = [searchId];
  let sqls1 = mysql.format(sql1, values);
  console.log("start review comment ");
  connection.query(sqls1, (error, rows, fields) => {
    if (!rows.length) {
      console.log("nodata" + rows);
      res.json("nodata");
    } else {
      res.json(rows);
      console.log(rows);
      return app.js;
    }
  });
});

app.get(`/convert/:from/:to`, async (req, res) => {
  let result;
  const fromObj = {
    fromCurrency: req.params.from,
    toCurrency: req.params.to,
  };
  const request = require("request");
  const urls = `https://api.exchangerate.host/convert?from=${fromObj.fromCurrency}&to=${fromObj.toCurrency}`;
  try {
    request.get(urls, (error, response) => {
      res.send(response.body);
    });
  } catch (error) {
    console.log(error);
  }
});
