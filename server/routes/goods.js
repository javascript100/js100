var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Goods = require('../models/goods');

// 连接数据库
mongoose.connect('mongodb://127.0.0.1:27017/mall');

mongoose.connection.on('connected', function () {
  console.log('success');
});
mongoose.connection.on('error', function () {
  console.log('failed')
});
mongoose.connection.on('disconnected', function () {
  console.log('disconnected')
});

// 查询商品列表数据
router.get("/list", function (req, res, next) {
  let page = parseInt(req.param("page"));
  let pageSize = parseInt(req.param("pageSize"));
  let priceLevel = req.param("priceLevel");
  let sort = req.param("sort");
  let skip = (page - 1) * pageSize;
  var priceGt = '',
    priceLte = '';
  let params = {};
  if (priceLevel != 'all') {
    switch (priceLevel) {
      case '0':
        priceGt = 0;
        priceLte = 500;
        break;
      case '1':
        priceGt = 500;
        priceLte = 2000;
        break;
      case '2':
        priceGt = 2000;
        priceLte = 5000;
        break;
      case '3':
        priceGt = 5000;
        priceLte = 10000;
        break;
    }
    params = {
      salePrice: {
        $gt: priceGt,
        $lte: priceLte
      }
    }
  }

  let goodsModel = Goods.find(params).skip(skip).limit(pageSize);
  goodsModel.sort({
    'salePrice': sort
  });

  goodsModel.exec(function (err, doc) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message
      });
    } else {
      res.json({
        status: '0',
        msg: '',
        result: {
          count: doc.length,
          list: doc
        }
      })
    }
  })
});

// 加入到购物车
router.post("/addCart", function (req, res, next) {
  var userId = '10001',
    productId = req.body.productId;

  var User = require('../models/user');

  User.findOne({
    userId: userId
  }, function (err, userDoc) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message
      })
    } else {
      console.log("userDoc: " + userDoc);
      if (userDoc) {
        let goodsItem = '';
        userDoc.cartList.forEach(function (item) {
          console.log("before:" + item)
          if (item.productId == productId) { // 表示数据库中已有这条数据
            goodsItem = item;
            item.productNum++;
            console.log("after:" + item)
          }
        });
        if (goodsItem) { // 数据库里已有这一项
          userDoc.save(function (err2, userDoc2) {    
            if (err2) {
              res.json({
                status: '1',
                msg: err2.message
              })
            } else {
              res.json({
                status: '0',
                msg: '',
                result: 'suc'
              })
            }
          })
        } else {
          Goods.findOne({
            productId: productId
          }, function (goodErr, goodDoc) {
            if (goodErr) {
              res.json({
                status: '1',
                msg: goodErr.message
              })
            } else {
              if (goodDoc) {
                console.log("goodDoc:before:" + goodDoc)
                var newDoc = {
                  "productId": goodDoc.productId,
                  "productName": goodDoc.productName,
                  "salePrice": goodDoc.salePrice,
                  "productImage": goodDoc.productImage,
                  "checked": '1',
                  "productNum": '1'
                }
                console.log("goodDoc:after:" + JSON.stringify(newDoc))
                userDoc.cartList.push(newDoc);
                console.log("notice:" + userDoc)
                userDoc.save(function (err2, userDoc2) {
                  if (err2) {
                    res.json({
                      status: '1',
                      msg: err2.message
                    })
                  } else {
                    res.json({
                      status: '0',
                      msg: '',
                      result: 'suc'
                    })
                  }
                })
              }
            }
          })
        }
      }
    }
  })

  // User.findOne({
  //   userId: userId
  // }, function (err, userDoc) {
  //   if (err) {
  //     res.json({
  //       status: '1', // '1'表示报错
  //       msg: err.message
  //     })
  //   } else {
  //     console.log("userDoc:" + userDoc);
  //     if (userDoc) {
  //       let goodsItem = '';
  //       userDoc.cartList.forEach(function (item) {
  //         if (item.productId == productId) {
  //           goodsItem = item;
  //           item.productNum++;
  //         }
  //       });
  //       if (goodsItem) {
  //         userDoc.save(function (err2, doc2) {
  //           if (err2) {
  //             res.json({
  //               status: '1',
  //               msg: err2.message
  //             })
  //           } else {
  //             res.json({
  //               status: '0',
  //               msg: '',
  //               result: 'suc'
  //             })
  //           }
  //         })
  //       } else {

  //         Goods.findOne({
  //           productId: productId
  //         }, function (err3, doc3) {
  //           if (err3) {
  //             res.json({
  //               status: '1',
  //               msg: err1.message
  //             })
  //           } else {
  //             if (doc3) {
  //               // 插入数据
  //               doc3.productNum = '1';
  //               doc3.checked = '1';
  //               userDoc.cartList.push(doc3);
  //               userDoc.save(function (err4, doc4) {
  //                 if (err4) {
  //                   res.json({
  //                     status: '1',
  //                     msg: err4.message
  //                   })
  //                 } else {
  //                   res.json({
  //                     status: '0',
  //                     msg: '',
  //                     result: 'suc'
  //                   })
  //                 }
  //               })
  //             }
  //           }
  //         })
  //       }
  //     }
  //   }


});
module.exports = router;
