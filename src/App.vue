<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
/* 修改 Element UI 消息组件的宽度（全局样式） */
.el-message {
  min-width: 0 !important;
  width: auto !important;
  padding: 10px 15px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  margin: 20px auto !important;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1) !important;
  border-radius: 4px !important;
}

.el-message__content {
  font-size: 14px !important;
  line-height: 1.4 !important;
  margin: 0 !important;
  padding: 0 !important;
}

.el-message .el-message__icon {
  margin-right: 10px !important;
  font-size: 16px !important;
  flex-shrink: 0 !important;
}

/* 确保消息组件在移动设备上也显示正常 */
@media screen and (max-width: 768px) {
  .el-message {
    width: auto !important;
    max-width: 90% !important;
  }
}
</style>
