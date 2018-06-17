<template>
  <div>
    <nav-header></nav-header>
    <div class="container">
      <div class="page-title-normal">
        <h2 class="page-title-h2"><span>谢谢惠顾！</span></h2>
      </div>
      <!-- 进度条 -->
      <div class="check-step">
        <ul>
          <li class="cur"><span>选择你的地址</span></li>
          <li class="cur"><span>确认你的订单</span></li>
          <li class="cur"><span>确认支付</span></li>
          <li class="cur"><span>完成订单</span></li>
        </ul>
      </div>

      <div class="order-create">
        <div class="order-create-pic"><img src="/static/ok-2.png" alt=""></div>
        <div class="order-create-main">
          <h3>谢谢惠顾! <br>您的订单已提交!</h3>
          <p>
            <span>订单编号：{{orderId}}</span>
            <span>订单总金额：{{orderTotal | currency('¥')}}</span>
          </p>
          <div class="order-create-btn-wrap">
            <div class="btn-l-wrap">
              <router-link class="btn btn--m" to="/cart">购物车</router-link>
            </div>
            <div class="btn-r-wrap">
              <router-link class="btn btn--m" to="/">商品列表</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
    <nav-footer></nav-footer>
  </div>
</template>
<script>
import NavHeader from "@/components/NavHeader.vue";
import NavFooter from "@/components/NavFooter.vue";
import NavBread from "@/components/NavBread.vue";
import Modal from "@/components/Modal.vue";
import axios from "axios";
export default {
  data () {
    return {
      orderId: '',
      orderTotal: 0
    }
  },
  components: {
    NavHeader,
    NavFooter,
    NavBread,
  },
  mounted () {
    var orderId = this.$route.query.orderId;
    if (!orderId) {
      return;
    }
    axios.get("/users/orderDetail",{
      params:{ // Get请求传参要加params
        orderId: orderId
      }
    }).then((response) => {
      let res = response.data;
      if (res.status == '0') {
        this.orderId = orderId;
        this.orderTotal = res.result.orderTotal;
      }
    });
  },
  methods: {

  }
}
</script>

