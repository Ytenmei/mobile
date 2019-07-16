<template>
  <van-dialog
    :value="value"
    @input="$emit('input', $event)"
    :showConfirmButton="false"
    closeOnClickOverlay
  >
    <van-cell-group v-if="!isReportShow">
      <van-cell icon="location-o" title="不感兴趣" @click="handleDislick" />
      <van-cell icon="location-o" title="反馈垃圾内容" is-link @click="isReportShow = true" />
      <van-cell icon="location-o" title="拉黑作者" @click="handleAddBalckList" />
    </van-cell-group>

    <van-cell-group v-else>
      <van-cell icon="arrow-left" @click="isReportShow = false" />
      <van-cell icon="location-o" title="拉黑作者" />
       <van-cell
       icon="location-o"
       :title="item.labey"
       v-for="item in reportTypes"
       :key="item.value"
       @click="handleReportArticle(item.value)"
       />
    </van-cell-group>
  </van-dialog>
</template>

<script>
import { dislickArticle, reportArticle } from '@/api/article'
import { addBlacklist } from '@/api/user'
export default {
  name: 'MoreAction',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    currentArticle: {
      type: Object
    }
  },
  data () {
    return {
      isReportShow: false,
      reportTypes: [
        { labey: '其他问题', value: 0 },
        { labey: '标题夸张', value: 1 },
        { labey: '低俗色情', value: 2 },
        { labey: '错别字多', value: 3 },
        { labey: '旧闻重复', value: 4 },
        { labey: '广告软文', value: 5 },
        { labey: '内容不实', value: 6 },
        { labey: '涉嫌违法犯罪', value: 7 },
        { labey: '侵权', value: 8 }
      ]
    }
  },
  methods: {
    async handleDislick () {
      try {
        await dislickArticle(this.currentArticle.art_id)
        // 移除客户端的那个文章
        this.$emit('dislike-success')
        // 关闭对话框
        // this.$emit('input', false)
        // 提示操作成功
        // this.$toast('操作成功')
      } catch (err) {
        this.$toast('操作失败')
      }
    },
    async handleAddBalckList () {
      try {
        await addBlacklist(this.currentArticle.aut_id)
        this.$emit('add-blacklist-success')
      } catch (err) {
        this.$toast('操作失败')
      }
    },
    async handleReportArticle (type) {
      try {
        await reportArticle({
          articleId: this.currentArticle.art_id,
          type
        })
        // this.$toast('举报成功')
        //  事件不是轻质的，我只是提供了，用不用是你的事
        this.$emit('report-success')
        // 关闭对话框
        this.$emit('input', false)
        // 提示
        this.$toast('举报成功')
      } catch (err) {
        if (err.response.status === 409) {
          this.$toast('该文章已被举报过')
        } else {
          this.$toast('操作失败')
        }
      }
    }
  }
}
</script>

<style lang="less" scoped></style>
