<template>
  <van-popup
    :style="{ height: '95%' }"
    :value="value"
    @input="$emit('input', $event)"
    position="bottom"
    get-container="body"
    :lazy-render="false"
  >
  <!-- 我的频道 -->
    <div class="channel">
      <div class="channel-head">
        <div>
          <span class="title">我的频道</span>
          <span class="desc">点击进入频道</span>
        </div>
        <div>
          <van-button
            type="danger"
            plain
            size="mini"
            @click="isEdit = !isEdit"
          >{{ isEdit ? '完成': '编辑' }}</van-button>
        </div>
      </div>
      <van-grid class="channel-content" :gutter="10" clickable>
        <van-grid-item
          v-for="(item, index) in userChannels"
          :key="item.id"
          @click="handleUserChannelClick(item, index)">
          <span
          class="text"
          :class="{ active: index === activeIndex && !isEdit}"
          >{{item.name}}</span><!-- 在频道中显示高亮 编辑状态则不显示↑ -->
          <van-icon class="close-icon" v-show="isEdit" name="close" />
        </van-grid-item>
      </van-grid>
    </div>
  <!-- 推荐频道 -->
    <div class="channel">
      <div class="channel-head">
        <div>
          <span class="title">频道推荐</span>
          <span class="desc">点击添加频道</span>
        </div>
      </div>
      <van-grid class="channel-content" :gutter="10" clickable>
        <van-grid-item
          v-for="item in recommendChannels"
          :key="item.id"
          @click="handleAddChannel(item)"
          >
          <div class="info">
            <span class="text">{{ item.name}}</span>
          </div>
        </van-grid-item>
      </van-grid>
    </div>
  </van-popup>
</template>

<script>
import { getAllChannels } from '@/api/channel'
import { mapState } from 'vuex'
export default {
  name: 'HomeChannel',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    userChannels: {
      type: Array,
      default: () => []
    },
    activeIndex: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      allChannels: [], // 所有的频道列表
      isEdit: false
    }
  },
  computed: {
    /**
    * 过滤出不包含用户频道的列表数据
    * 计算属性会监视内部依赖的实例成员，当数据发生改变，他会重新进行计算
    */
    recommendChannels () {
      // 从用户列表中映射一个数组，数据中存储了所有的用户频道ID
      const duplicates = this.userChannels.map(item => item.id)
      /**
      * 返回一个不包含用户频道的数组
      * includes(有数据则返回true无则false)  取反
      *  */
      return this.allChannels.filter(item => !duplicates.includes(item.id))
    },

    // Vuex的辅助方法，用来将state中的数据映射到本地计算属性
    // 等价于 user = this.$store.state.user
    ...mapState(['user'])
  },
  created () {
    this.loadAllChannels()
  },
  methods: {
    // 获取所有频道列表
    async loadAllChannels () {
      const data = await getAllChannels()
      // console.log(data)
      data.channels.forEach(item => {
        item.articles = [] // 存储当前文章的列表
        item.timestamp = Date.now() // 存储下一页的时间戳
        item.downPullLoading = false // 当前频道的下拉刷新
        item.upPullLoading = false // 当前频道的上拉刷新
        item.upPullFinished = false // 控制当前数据是否加载完毕
      })
      this.allChannels = data.channels
    },
    handleAddChannel (item) {
      // 将点击的频道添加到用户频道中
      this.userChannels.push(item)
      // 持久化：
      if (this.user) {
        // 登录：将数据添加到后端
        // return
      } else {
        // 未登录：将数据储存到本地
        window.localStorage.setItem('channels', JSON.stringify(this.userChannels))
      }
    },
    // 切换频道
    changeChannel (item, index) {
      // console.log('change')
      // 切换频道
      this.$emit('update:active-index', index)
      // 切换频道后关闭窗口
      this.$emit('input', false)
    },
    // 删除频道
    deleteChannel (item, index) {
      // console.log('deleted')
      // 删除用户数据
      this.userChannels.splice(index, 1)
      // 手动设置一下当前激活的标签搜因，用来触发onLoad调用，否则看不到数据
      // this.$emit('update:active-index', 1)
      // 判断当前激活频道中是否有数据
      if (this.user) {
        // 登录：发请求删除

        return
      }
      // 未登录，删除本地存储的数据
      // 重新更新本地数据
      window.localStorage.setItem('channels', JSON.stringify(this.userChannels))
    },
    handleUserChannelClick (item, index) {
      // 非编辑状态:切换频道
      if (!this.isEdit) {
        this.changeChannel(item, index)
      } else {
        // 编辑状态：删除频道
        this.deleteChannel(item, index)
      }
    }
  }
}
</script>

<style lang="less" scoped>
.channel {
  .channel-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    .title {
      font-size: 30px;
      margin-right: 5px;
    }
    .desc {
      font-size: 12px;
    }
    .action {}
  }
  .channel-content {
    .text {
      font-size: 24px;
    }
    .active {
      color: red;
    }
    .close-icon {
      font-size: 30px;
      position: absolute;
      top: -5px;
      right: -5px;
      z-index: 999;
      background-color: #fff;
    }
    .info {
      display: flex;
      align-items: center;
    }
  }
}
</style>
