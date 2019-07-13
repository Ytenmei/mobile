import Vue from 'vue'
import Vuex from 'vuex'
import * as auth from '@/utils/auth'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // 初始化的时候从本地存储获取数据，防止刷新丢失token
    user: auth.getUser()
  },
  mutations: {
    /*
    登录成功，调用mutation 更新容器中的user 的状态
     */
    setUser (state, data) {
      // 先更新数据到state上
      state.user = data
      // 再将数据放到本地存储
      auth.saveUser(state.user)
    }
  },
  actions: {
  }
})
