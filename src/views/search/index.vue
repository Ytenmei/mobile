<template>
  <div>
    <!-- 搜索框 -->
    <van-search
    placeholder="请输入搜索关键词"
    v-model="searchText"
    show-action
    />
    <!-- /搜索框 -->

    <!-- 联想建议 -->
    <van-cell-group>
      <van-cell
      icon="search"
      :title="item"
      v-for="item in suggestions"
      :key="item"
      />

    </van-cell-group>
    <!-- /联想建议 -->

    <!-- 历史记录 -->
    <!-- /历史记录 -->
  </div>
</template>

<script>
import { getSuggestion } from '@/api/search'
export default {
  name: 'SearchIndex',
  data () {
    return {
      searchText: '',
      suggestions: []
    }
  },
  watch: {
    /**
     * 监视输入数据的改变，当数据发生变化，发送请求获取搜索建议，展示到列表中
     */
    async searchText (text) {
      // console.log('改变了')
      text = text.trim()
      // 非空判断
      if (!text.length) {
        return
      }
      // 请求获取搜索建议
      try {
        const data = await getSuggestion(text)
        // console.log(data)
        this.suggestions = data.options
      } catch (err) {
        console.log(err)
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
