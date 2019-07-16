<template>
  <van-dialog
    :value="value"
    @input ="$emit('input', $event)"
    closeOnClickOverlay
    :showConfirmButton=false
    >
    <div>123</div>
  </van-dialog>
</template>

<script>
export default {
  name: 'MoreAction',
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {}
  }
}
</script>

<style>

</style>
