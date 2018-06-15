// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import VueLazyLoad from 'vue-lazyload'
import infiniteScroll from 'vue-infinite-scroll'
import {currency} from './util/currency'
// import * as util from './util'


Vue.config.productionTip = false

Vue.use(infiniteScroll)
// 图片懒加载插件
Vue.use(VueLazyLoad, {
  loading: "/static/loading-svg/loading-bars.svg"
})
// 全局定义过滤器
Vue.filter("currency", currency);
// console.log(`sum: ${util.sum(1, 6)}`);
// console.log(`minus: ${util.minus(10, 6)}`);
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
