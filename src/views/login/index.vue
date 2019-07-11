<template>
  <div>
    <van-nav-bar
      title="标题"
      left-arrow
    />
    <form>
      <van-cell-group>
        <van-field
          v-model="user.mobile"
          v-validate="'required'"
          name="mobile"
          :error-message="errors.first('mobile')"
          clearable
          left-icon="phone-o"
          placeholder="请输入手机号"
        />
        <van-field
          v-model="user.code"
          v-validate="'required'"
          name="code"
          :error-message="errors.first('code')"
          type="code"
          left-icon="scan"
          placeholder="请输入验证码"
        />
      </van-cell-group>
      <div class="login-btn">
        <van-button
        class="btn"
        type="info"
        @click.prevent="handleLogin"
        :loading="loginLoding"
        >登录</van-button>
      </div>
    </form>
  </div>
</template>

<script>
// import axios from 'axios'
import { login } from '@/api/user'

export default {
  name: 'LoginIndex',
  data () {
    return {
      user: {
        mobile: '15901508754',
        code: '246810'
      },
      // mobileMessage: ''
      loginLoding: false // 控制登录请求的Loding状态
    }
  },
  created () {
    this.comfigCustomMessages()
  },
  methods: {
    async handleLogin () {
      // if (this.user.mobile.trim().length) {
      //   this.mobileMessage = ''
      // } else {
      //   this.mobileMessage = '请输入手机号'
      //   return
      // }
      // 登录时为true
      this.loginLoding = true
      try {
        // 验证方法设计的不好，并没有在验证失败的时候抛出异常
        const valid = await this.$validator.validate()
        // console.log(valid)
        // 如果表单验证失败，则什么都不做
        if (!valid) {
          // do stuff if not valid.
          // 验证失败，代码不会往后执行了，所以这里应该也应该false
          this.loginLoding = false
          return
        }
        const data = await login(this.user)
        // console.log(data)
        // 提交mutation更新Vue 容器中的状态
        this.$store.commit('setUser', data)
        // 登录成功，跳转页面
        this.$router.push({
          name: 'home'
        })
        this.$toast.fail('登录成功！欢迎回来')
      } catch (err) {
        console.log(err)
        // console.log('登录失败')
        this.$toast.fail('登录失败！手机号或验证码错误')
      }
      this.loginLoding = false
    },
    comfigCustomMessages () {
      const dict = {
        custom: {
          mobile: {
            required: '手机号不能为空'
          },
          code: {
            required: () => '验证码不能为空'
          }
        }
      }
      this.$validator.localize('zh_CN', dict)
    }
  }
}
</script>

<style lang='less' scoped>
.login-btn {
  padding: 10px;
  .btn {
    width: 100%;
    background-color:#6db4fb;
    border-radius: 7px;
  }
}
</style>
