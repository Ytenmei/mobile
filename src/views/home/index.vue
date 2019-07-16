<template>
  <div class="home">
    <van-nav-bar title="首页" fixed/>
    <!--activeChannelIndex 绑定当前激活的标签页，使用索引
      -->
    <van-tabs class="channel-tabs" v-model="activeChannelIndex">
      <div slot="nav-right" class="wap-nav" @click="isChannelShow = true">
        <van-icon name="wap-nav"></van-icon>
      </div>
      <!-- 获取频道 -->
      <van-tab
      :title="channelItem.name"
      v-for="channelItem in channels"
      :key="channelItem.id"
      >
        <!--下拉刷新
        isLoading 用来控制下拉刷新的loading状态
        下拉刷新的时候，它会自动将loading设置为true
        @refresh 当下拉刷新的时候会触发
          -->
        <van-pull-refresh
        v-model="channelItem.downPullLoading"
        @refresh="onRefresh"
        :success-text="channelItem.downPullSuccessText"
        :success-duration="1000">
          <!--
          列表组件：主要提供上拉加载更多功能
          loading：控制加载中的效果
          finished 从用来控制会否加载完毕
          @load 加载更多的时候触发的一个事件，它自动会调用onLoad函数拿数据
          以填充页面
          它每次调用onLoad 中自动将loading设置为true
          我们需要在onLoad中拿到本次加载的数据以后，将loading设置为false
          -->
          <van-list
          v-model="channelItem.upPullLoading"
          :finished="channelItem.upPullFinished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <van-cell
          v-for="articleItem in channelItem.articles"
          :key="articleItem.art_id"
          :title="articleItem.title"
          />
          </van-list>
        </van-pull-refresh>
      </van-tab>
    </van-tabs>
    <!-- 频道管理组件 -->
    <!--
      v-model 实际上是：
      v-bind：value="数据"
      v-on:input="数据 = $event"
      :action-index.sync="activeChannelIndex" 等价于两句代码的简写
      :action-index="activeChannelIndex"
      @update:active-index="activeChannelIndex = $event"
      当你给一个属性加上 .sync 修饰符的时候，它hi自动监听
      @update：绑定的字段="绑定的字段 = $event"
      其中的事件名称中的 update： 是固定的语法
      所以你在你的子组件中发布自定义事件的时候务必要发送一个名字叫update：绑定的字段 的事件
      props数据.sync 和 v-model 的作用是一样的，但是一个组件只有一个v-model
      v-model="isChannelShow" 是
      v-bind:value="isChannelShow"
      @input="isChannelShow = $event"
      的简写
     -->
    <HomeChannel
    v-model="isChannelShow"
    :user-channels="channels"
    :active-index.sync="activeChannelIndex"
    />
    <!-- 频道管理组件 -->
  </div>
</template>

<script>
import { getUserChannels } from '@/api/channel'
import { getArticles } from '@/api/article'
import HomeChannel from './components/channel'

export default {
  name: 'HomeIndex',
  components: {
    HomeChannel
  },
  data () {
    return {
      activeChannelIndex: 0, // 当前激活的标签页
      channels: [], // 存储频道列表
      isChannelShow: false
    }
  },
  computed: {
    /**
     * 当前激活的频道
     */
    activeChannel () {
      return this.channels[this.activeChannelIndex]
      // console.log(this.channels[this.activeChannelIndex])
    }
  },
  watch: {
    // 监视容器中的user 用户
    // 凡是能this.出来的成员都可以直接在这里监视
    // 由于路由缓存了，所以这里监视用户的登录状态，如果登录了，则加载用户登录的列表
    async '$store.state.user' () {
      this.loadChannels()
      // 频道数据改变，重新加载当前激活频道的数据
      // 只要将上拉加载更多设置为true，它就会自动去调用onLoad
      this.activeChannel.upPullLoading = true
      // await this.onLoad()
    },
    isChannelShow () {
      // 那就手动加载跳到推荐
      if (!this.isChannelShow) {
        // this.activeChannel.upPullLoading = true
        // this.onRefresh()
        // this.onLoad()
        // console.log(this.activeChannelIndex)
        this.activeChannelIndex = 0
      }
    }
  },
  created () {
    this.loadChannels()
  },
  methods: {
    async loadChannels () {
      // 获取本地存储数据
      const { user } = this.$store.state
      // 存储频道列表
      let channels = []
      // 已登录
      if (user) {
        const data = await getUserChannels()
        // console.log(data)
        channels = data.channels
      } else {
        // 未登录
        // 如果有本地存储数据则使用本地存储中的频道列表
        const localChannels = JSON.parse(window.localStorage.getItem('channels'))
        if (localChannels) {
          channels = localChannels
        } else {
          // 如果没有本地存储频道数据则请求获取默认推荐频道列表
          const data = await getUserChannels()
          // console.log(data)
          channels = data.channels
        }
      }
      //  修改channels， 将这个数据接口修改为满足我们使用的需求
      channels.forEach(item => {
        item.articles = [] // 存储当前文章的列表
        item.timestamp = Date.now() // 存储下一页的时间戳
        item.downPullLoading = false // 当前频道的下拉刷新
        item.upPullLoading = false // 当前频道的上拉刷新
        item.upPullFinished = false // 控制当前数据是否加载完毕
      })
      this.channels = channels
    },
    // 上拉加载更多 pushh 数据
    async onLoad () {
      await this.$sleep(800)
      let data = []
      data = await this.loadArticles()
      /**
       * 如果没有pre_timestamp并且数组是空的，则没有数据了
       */
      if (!data.pre_timestamp && !data.results.length) {
        this.activeChannel.upPullFinished = true // 设置该频道数据加载完毕。并且不再onLoad
        this.activeChannel.upPullLoading = false // loading效果取消
        // 代码不再往后执行
        return
      }
      // pre_timestamp 下一页的数据（上一次时间点的数据）
      // results 当前更新的文章数据
      // console.log(data)
      // 解决初始化的时候没有最新推荐数据的问题（没有最新数据，那就加载上一次推荐数据）
      if (data.pre_timestamp && !data.results.length) {
        this.activeChannel.timestamp = data.pre_timestamp
        // 加载下一页数据
        data = await this.loadArticles()
      }
      // 数据加载好以后，将pre_timestamp更新到当前频道中用于加载下下次数据
      this.activeChannel.timestamp = data.pre_timestamp
      // 将文章数据更新到频道中(注意： 是push追加，不是覆盖)
      this.activeChannel.articles.push(...data.results)
      // 数据加载完毕，取消loading状态
      this.activeChannel.upPullLoading = false
      // console.log(data)

      // 异步更新数据
      // setTimeout(() => {
      //   for (let i = 0; i < 10; i++) {
      //     this.list.push(this.list.length + 1)
      //   }
      //   // 加载状态结束
      //   this.loading = false

      //   // 数据全部加载完成
      //   if (this.list.length >= 40) {
      //     this.finished = true
      //   }
      // }, 500)
    },
    // 下拉刷新 重置列表数据
    async onRefresh () {
      const { activeChannel } = this
      // 备份加载下一页数据的时间戳
      // const timestamp = activeChannel.timestamp
      activeChannel.timestamp = Date.now()
      const data = await this.loadArticles()
      // 如果有最新数据，将数据更新到频道的文章列表中
      if (data.results.length) {
        // 将当前最新的推荐内容重置到频道文章中
        activeChannel.articles = data.results
        // 重置了文章列表，当前数据中的pre_timestamp就是上拉加载更多下一页的数据时间戳
        activeChannel.timestamp = data.pre_timestamp
        activeChannel.downPullSuccessText = '更新成功'
        // 当下拉刷新有数据并重置以后数据无法满足一屏，调用onLoad再次加载
        this.onLoad()
      } else {
        activeChannel.downPullSuccessText = '已是最新数据'
      }
      // 取消loading状态
      activeChannel.downPullLoading = false
    },
    // 当前频道数据
    async loadArticles () {
      const { id: channelId, timestamp } = this.activeChannel
      const data = await getArticles({
        channelId, // 当前激活频道ID
        timestamp, // 用于请求分页数据的事件戳
        withTop: 1 // 是否包含置顶数据
      })
      return data
    }
  }
}
</script>

<style lang="less" scoped>
.channel-tabs {
  margin-bottom: 100px
}
// 深度作用选择器
.channel-tabs /deep/ .van-tabs__wrap {
  position: fixed;
  top: 92px;
}
.channel-tabs /deep/ .van-tabs__content {
  margin-top: 100px;
}
.channel-tabs /deep/ .wap-nav {
  position: fixed;
  right: 0;
  background-color: #ffff77;
}
</style>
