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
          placeholder="请输入密码"
        />
      </van-cell-group>
      <div class="login-btn">
        <van-button class="btn" @click.prevent="handleLogin">登录</van-button>
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
        mobile: '',
        code: ''
      },
      mobileMessage: ''
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
      try {
        this.$validator.validate().then(async valid => {
          // 如果表单验证失败，则什么都不做
          if (!valid) {
          // do stuff if not valid.
            return
          }
          const data = await login(this.user)
          // console.log(data)
          this.$store.commit('setUser', data)
        })
      } catch (err) {
        console.log(err)
        console.log('登录失败')
      }
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
