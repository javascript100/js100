var express = require('express');
var router = express.Router();
require('./../util/util.js');
var User = require('./../models/user');
/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});
router.get('/test', function (req, res, next) {
  res.send('test');
});


router.post("/login", function (req, res, next) {
  var param = {
    userName: req.body.userName,
    userPwd: req.body.userPwd
  }
  User.findOne(param, function (err, doc) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message
      });
    } else {
      if (doc) {
        res.cookie("userId", doc.userId, {
          path: '/',
          maxAge: 1000 * 60 * 60
        });
        res.cookie("userName", doc.userName, {
          path: '/',
          maxAge: 1000 * 60 * 60
        })
        // req.session.user = doc;
        res.json({
          status: '0',
          msg: '',
          result: {
            userName: doc.userName
          }
        });
      }
    }
  })
});

// 登出接口
router.post("/logout", function (req, res, next) {
  res.cookie("userId", "", {
    path: "/",
    maxAge: -1
  });
  res.json({
    status: "0",
    msg: '',
    result: ''
  })
})


router.get("/checkLogin", function (req, res, next) {
  if (req.cookies.userId) {
    res.json({
      status: '0',
      msg: '',
      result: req.cookies.userName || ''
    });
  } else {
    res.json({
      status: '1',
      msg: '您还未登录',
      result: ''
    });
  }
})

// 查询购物车数量
router.get("/getCartCount", function (req, res, next) {
  if (req.cookies && req.cookies.userId) {
    var userId = req.cookies.userId;
    User.findOne({
      userId: userId
    }, function (err, doc) {
      if (err) {
        res.json({
          status: '1',
          msg: err.message,
          result: ''
        });
      } else {
        var cartList = doc.cartList;
        let cartCount = 0;
        cartList.map((item) => {
          cartCount += parseInt(item.productNum);
        });
        res.json({
          status: '0',
          msg: '',
          result: cartCount
        });
      }
    })
  }

})


// 查询当前用户的购物车数据
router.get("/cartList", function (req, res, next) {
  var userId = req.cookies.userId;
  User.findOne({
    userId: userId
  }, function (err, doc) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      });
    } else {
      if (doc) {
        res.json({
          status: '0',
          msg: '',
          result: doc.cartList
        });
      }
    }
  })
});

// 删除购物车
router.post("/cartDel", function (req, res, next) {
  var userId = req.cookies.userId,
    productId = req.body.productId;
  User.update({
    userId: userId
  }, {
    $pull: {
      'cartList': {
        'productId': productId
      }
    }
  }, function (err, doc) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      });
    } else {
      res.json({
        status: '0',
        msg: '',
        result: 'suc'
      });
    }
  })

});

// 修改商品数量
router.post("/cartEdit", function (req, res, next) {
  var userId = req.cookies.userId,
    productId = req.body.productId,
    productNum = req.body.productNum,
    checked = req.body.checked;
  User.update({
    "userId": userId,
    "cartList.productId": productId
  }, {
    "cartList.$.productNum": productNum,
    "cartList.$.checked": checked,
  }, function (err, doc) {
    console.log("err: " + err)
    console.log("doc: " + doc)
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      });
    } else {
      res.json({
        status: '0',
        msg: '',
        result: 'suc'
      });
    }
  });
});

// 购物车全选
router.post("/editCheckAll", function (req, res, next) {
  var userId = req.cookies.userId,
    checkAll = req.body.checkAll ? '1' : '0';
  User.findOne({
    userId: userId
  }, function (err, user) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      });
    } else {
      if (user) {
        // 查到用户数据后遍历购物车将购物车的每一项改为选中状态
        user.cartList.forEach((item) => {
          item.checked = checkAll;
        });
        user.save(function (err1, doc) {
          if (err1) {
            res.json({
              status: '1',
              msg: err.message,
              result: ''
            });
          } else {
            res.json({
              status: '0',
              msg: '',
              result: 'suc'
            });
          }
        });
      }
    }
  });
})

// 查询用户地址接口
router.get("/addressList", function (req, res, next) {
  var userId = req.cookies.userId;
  User.findOne({
    userId: userId
  }, function (err, doc) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      });
    } else {
      res.json({
        status: '0',
        msg: '',
        result: doc.addressList
      });
    }
  });
});

// 设置默认地址接口
router.post("/setDefault", function (req, res, next) {
  var userId = req.cookies.userId,
    addressId = req.body.addressId;
  if (!addressId) {
    res.json({
      status: '1003',
      msg: 'addressId is null',
      result: ''
    });
  } else {
    User.findOne({
      userId: userId
    }, function (err, doc) {
      if (err) {
        res.json({
          status: '1',
          msg: err.message,
          result: ''
        });
      } else {
        var addressList = doc.addressList;
        addressList.forEach((item) => {
          if (item.addressId == addressId) {
            item.isDefault = true;
          } else {
            item.isDefault = false;
          }
        });
        doc.save(function (err1, doc1) {
          if (err1) {
            res.json({
              status: '1',
              msg: err1.message,
              result: ''
            });
          } else {
            res.json({
              status: '0',
              msg: '',
              result: ''
            });
          }
        })
      }
    });
  }
});
//添加地址接口
router.post("/addAddress", function (req, res, next) {
  var userId = req.cookies.userId,
    userName = req.body.userName,
    streetName = req.body.streetName,
    postCode = req.body.postCode,
    tel = req.body.tel;
    // 创建地址编号
    platform = 'Ad6',
    ran1 = Math.floor(Math.random() * 10),
    ran2 = Math.floor(Math.random() * 10),
    sysDate = new Date().Format('yyyyMMddhhmmss'),
    createDate = new Date().Format('yyyy-MM-dd hh:mm:ss'),
    addressId = platform + ran1 + sysDate + ran2;

  User.findOne({
    userId: userId
  }, function (err, userdoc) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message
      })
    } else {
      console.log("userDoc: " + userdoc);
      if (userdoc) {

        var newAddress = {
          "addressId": addressId,
          "userName": userName,
          "streetName": streetName,
          "postCode": postCode,
          "tel": tel,
          "isDefault": false
        }
        userdoc.addressList.push(newAddress)
        userdoc.save(function (err, userdoc2) {
          if (err) {
            res.json({
              status: '1',
              msg: err.message
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
  });
})
// 删除地址接口
router.post("/delAddress", function (req, res, next) {
  var userId = req.cookies.userId,
    addressId = req.body.addressId;
  User.update({
    userId: userId
  }, {
    $pull: {
      'addressList': {
        'addressId': addressId
      }
    }
  }, function (err, doc) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      });
    } else {
      res.json({
        status: '0',
        msg: '',
        result: ''
      });
    }
  })
});
// 提交订单接口
router.post("/payMent", function (req, res, next) {
  var userId = req.cookies.userId,
    addressId = req.body.addressId,
    orderTotal = req.body.orderTotal;
  User.findOne({
    userId: userId
  }, function (err, doc) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      });
    } else {
      var address = '',
        goodsList = [];
      // 获取当前用户地址信息
      doc.addressList.forEach((item) => {
        if (item.addressId == addressId) {
          address = item;
        }
      });
      // 获取用户购物车的购买商品
      doc.cartList.filter((item) => {
        if (item.checked == '1') {
          goodsList.push(item);
        }
      });
      var platform = '479';
      // 创建两个随机数
      var ran1 = Math.floor(Math.random() * 10);
      var ran2 = Math.floor(Math.random() * 10);
      var sysDate = new Date().Format('yyyyMMddhhmmss');
      var createDate = new Date().Format('yyyy-MM-dd hh:mm:ss');
      var orderId = platform + ran1 + sysDate + ran2;
      var order = {
        orderId: orderId,
        orderTotal: orderTotal,
        addressInfo: address,
        goodsList: goodsList,
        orderStatus: '1',
        createDate: createDate
      };

      doc.orderList.push(order);
      doc.save(function (err1, doc1) {
        if (err1) {
          res.json({
            status: '1',
            msg: err1.message,
            result: ''
          });
        } else {
          res.json({
            status: '0',
            msg: '',
            result: {
              orderId: order.orderId,
              orderTotal: order.orderTotal
            }
          });
        }
      });
    }
  });
  // 清空购物车中选中的商品
  User.update({
    userId: userId
  }, {
    $pull: {
      'cartList': {
        'checked': '1'
      }
    }
  }, function (err, doc) {
    if (err) {
      console.log("清空购物车失败！");
    } else {
      console.log("清空购物车成功！");
    }
  });
});

// 根据orderId查询订单信息
router.get("/orderDetail", function (req, res, next) {
  var userId = req.cookies.userId,
    orderId = req.param("orderId");
  User.findOne({
    userId: userId
  }, function (err, userInfo) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      });
    } else {
      var orderList = userInfo.orderList;
      if (orderList.length > 0) {
        var orderTotal = 0;
        orderList.forEach((item) => {
          if (item.orderId == orderId) {
            orderTotal = item.orderTotal;
          }
        });
        if (orderTotal > 0) {
          res.json({
            status: '0',
            msg: '',
            result: {
              orderId: orderId,
              orderTotal: orderTotal
            }
          });
        } else {
          res.json({
            status: '120002',
            msg: '没有该订单!',
            result: ''
          });
        }
      } else {
        res.json({
          status: '120001',
          msg: '当前用户未创建订单!',
          result: ''
        });
      }
    }
  });
})

module.exports = router;
