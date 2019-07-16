import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Vant, { Lazyload } from 'vant'
import 'vant/lib/index.css'
import 'amfe-flexible'
import './styles/index.less'
import zhCN from 'vee-validate/dist/locale/zh_CN'
import VeeValidate, { Validator } from 'vee-validate'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn' // 加载语言包
import relativeTime from 'dayjs/plugin/relativeTime' // dayjs 的相对时间插件
dayjs.extend(relativeTime) // 把插件注册到 dayjs中

dayjs.locale('zh-cn') // 全局使用中文语言包

// 注册一个全局过滤器来处理日期格式的展示
// 过滤器就是一个函数，我们可以再末班中通过{{ 数据 | 过滤器}}来调用这个过滤器
// 过滤器函数接收的参数就是你的数据，返回值就会绑定输出到使用的位置
Vue.filter('relativeTime', value => {
  return dayjs().from(value)
})

Vue.use(VeeValidate, {
  // 配置改变的时候去触发校验，默认是input
  events: ''
})
Validator.localize('zh_CN', zhCN)

Vue.use(Vant)
Vue.use(Lazyload)
Vue.config.productionTip = false

Vue.prototype.$sleep = time => {
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      resolve()
    }, time)
  })
}

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
