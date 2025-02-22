<template>
  <div class="interview-page">
    <!-- 顶部导航 -->
    <header class="header">
      <div class="header-right">
        <i class="el-icon-message" />
        <i class="el-icon-question" />
        <span>未登录</span>
      </div>
    </header>
    <div style="margin:10px 100px;background-color: rgba(0, 0, 0, 0.05);">
      <!-- 主体内容 -->
      <main class="main-content">
        <!-- 翻页区域 -->
        <div class="pagination top-pagination">
          <el-button round>上一题</el-button>
          <span>1/22</span>
          <el-button round>下一题</el-button>
        </div>

        <!-- 题目区域 -->
        <div class="question-box">
          <h1 class="question-title">
            对于劳动教育课成为话题，你怎么看？
            <span class="question-subtitle">（2017 湖北省考面试题）</span>
          </h1>
        </div>

        <div class="content-wrapper">
          <!-- 左侧答题区域 -->
          <div class="answer-box">
            <div class="tab-group">
              <span class="tab active">示范作答</span>
              <span class="tab">参考答案</span>
            </div>

            <div class="demo-area">
              <img class="logo" src="@/assets/deepseek-color.png" alt="Logo">
              <div class="demo-text">deepseek</div>
              <div class="demo-hint">点击开始示范</div>
            </div>
          </div>

          <!-- 右侧录音区域 -->
          <div class="record-box">
            <div class="record-hint">点击录音按钮，开始答题</div>
            <div class="record-button-wrapper">
              <div class="audio-recorder">
                <div class="mic-circle">
                  <!-- <img src="@/assets/microphone.png" alt="microphone"> -->
                </div>
                <div class="wave-line">
                  <div class="dotted-line" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- 替换浮动按钮为侧拉栏 -->
      <el-drawer
        title="答题列表"
        :visible.sync="drawerVisible"
        direction="rtl"
        size="30%"
      >
        <div class="drawer-content">
          <div class="question-list">
            <div class="question-item">
              <span>1. 对于劳动教育课成为话题，你怎么看？ （2017 湖北省考面试题）</span>
            </div>
            <div class="question-item">
              <span>2. 对于劳动教育课成为话题，你怎么看？ （2017 湖北省考面试题）</span>
            </div>
            <div class="question-item active">
              <span>3. 对于劳动教育课成为话题，你怎么看？ （2017 湖北省考面试题）</span>
            </div>
            <div class="question-item">
              <span>4. 对于劳动教育课成为话题，你怎么看？ （2017 湖北省考面试题）</span>
            </div>
          </div>
        </div>
      </el-drawer>
    </div>
    <!-- 侧拉栏触发区域 -->
    <div class="drawer-trigger">
      <div class="trigger-area" @click="toggleDrawer">
        <i class="el-icon-notebook-2" />
        <span>答题表</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      drawerVisible: false
    }
  },
  methods: {
    toggleDrawer() {
      this.drawerVisible = !this.drawerVisible
    }
  }
}
</script>

<style scoped>
.interview-page {
  min-height: 100vh;
  background-color: #fff;
  position: relative;
}

.header {
  padding: 16px;
  background: #fff;
  border-bottom: 1px solid #eee;
}

.header-right {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
  color: #606266;
}

.login-status {
  padding: 8px 20px;  /* 保留扩大的内边距 */
  border: 1px solid #fff;
  border-radius: 4px;
  color: #606266;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.top-pagination {
  margin-bottom: 24px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
}

.question-box {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
  margin-bottom: 24px;
}

.question-title {
  font-size: 18px;
  font-weight: 500;
}

.question-subtitle {
  font-size: 14px;
  color: #909399;
  margin-left: 8px;
  font-weight: normal;
}

.content-wrapper {
  display: flex;
  gap: 24px;
}

.answer-box {
  flex: 1;
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
}

.record-box {
  width: 384px;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
}

.tab-group {
  display: flex;
  gap: 24px;
  margin-bottom: 0;
}

.tab {
  cursor: pointer;
  color: #909399;
  padding: 12px 24px;
  border: none;
  background: #fff;
  border-radius: 8px 8px 0 0;
}

.tab.active {
  color: #606266;
  font-weight: 500;
  background: #f5f7fa;
}

.demo-area {
  height: 320px;
  border: none;
  border-radius: 0 8px 8px 8px;
  margin-top: -1px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  position: relative;
}

.logo {
  width: 96px;
  height: 96px;
  margin-bottom: 16px;
}

.demo-text {
  font-size: 20px;
  color: #909399;
  margin-bottom: 8px;
}

.demo-hint {
  color: #909399;
}

.record-hint {
  text-align: center;
  padding: 32px;
  background: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 24px;
  height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.record-button-wrapper {
  display: flex;
  justify-content: center;
}

.audio-recorder {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #F5F7FA;
  padding: 16px;
  border-radius: 8px;
  width: 100%;
}

.mic-circle {
  width: 40px;
  height: 40px;
  background: #909399;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mic-circle img {
  width: 20px;
  height: 20px;
}

.wave-line {
  flex: 1;
  height: 40px;
  display: flex;
  align-items: center;
}

.dotted-line {
  width: 100%;
  border-bottom: 2px dotted #DCDFE6;
}

.drawer-trigger {
  position: absolute;
  right: 0;
  top: 60px;
  height: calc(100% - 60px);
  z-index: 100;
}

.trigger-area {
  width: 40px;
  height: 100%;
  background: #f5f7fa;
  border: 1px solid #e6e6e6;
  border-right: none;
  border-radius: 0;  /* 移除圆角 */
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 300px;
  cursor: pointer;
  color: #606266;
}

.trigger-area i {
  font-size: 20px;
  margin-bottom: 8px;
}

.trigger-area span {
  writing-mode: vertical-lr;
  font-size: 14px;
}

.trigger-area:hover {
  background: #e6e6e6;
}

.drawer-content {
  padding: 20px;
  height: 100%;
  background-color: #f5f7fa;
  overflow: hidden;
}

.question-list {
  padding: 0 20px;
}

.question-item {
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 12px;
  cursor: pointer;
  font-size: 14px;
  color: #606266;
  background: #fff;
}

.question-item.active {
  color: #409EFF;
  background: #ecf5ff;
}

.question-item:hover {
  background: #f5f7fa;
}
</style>
