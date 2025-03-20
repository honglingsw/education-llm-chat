<template>
  <div class="interview-plaza" @click="handlePageClick">
    <!-- 顶部导航 -->
    <!-- <header class="header">
      <div style="margin:0 100px;">
        <div class="header-content">
          <div class="logo">言elogo</div>
          <div class="header-right">
            <div class="wallet">
              <img class="wallet-icon" src="@/assets/wallet.png" alt="wallet">
              <span class="balance">{{ isLoggedIn ? '4000' : '----' }}</span>
            </div>
            <i class="el-icon-question" />
            <template v-if="isLoggedIn">
              <i class="el-icon-user" />
              <span class="user-phone">{{ maskPhoneNumber }}</span>
              <span class="logout-text" @click="handleLogout">退出登录</span>
            </template>
            <template v-else>
              <i class="el-icon-user" @click="showLoginDialog" />
              <span class="not-login-text" @click="showLoginDialog">未登录</span>
            </template>
          </div>
        </div>
      </div>
    </header> -->

    <!-- 主体内容 -->
    <div style="margin:10px 100px;background-color: #ffffff;">
      <main class="main-content">
        <h1 class="page-title">面试广场</h1>

        <!-- 导航标签 -->
        <div class="tab-container">
          <span
            v-for="tab in tabs"
            :key="tab.value"
            :class="['tab', { active: activeTab === tab.value }]"
            @click="activeTab = tab.value"
          >
            {{ tab.label }}
          </span>
        </div>

        <!-- 面试卡片列表 -->
        <div class="card-list">
          <div
            v-for="(interview, index) in filteredInterviews"
            :key="index"
            :style="interview.title !== '公务员考试' ? { filter: 'blur(3px)' } : {}"
            class="interview-card"
            @click="goToInterview(interview)"
          >
            <div class="card-icon">
              <i :class="interview.icon" />
            </div>
            <div class="card-content">
              <h3 class="card-title">{{ interview.title }}</h3>
              <p class="card-desc">{{ interview.description }}</p>
            </div>
            <div class="card-action">
              <span class="action-text">立即加入</span>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- 登录弹窗 -->
    <el-dialog
      :visible.sync="loginDialogVisible"
      class="dialog-container"
      width="560px"
      :show-close="false"
      :before-close="handleCloseDialog"
      center
    >
      <div class="login-container">
        <!-- LOGO区域 -->
        <div class="login-logo">
          LOGO
        </div>

        <el-form ref="loginForm" :model="loginForm" :rules="loginRules" label-width="0">
          <!-- 手机号输入框 -->
          <el-form-item prop="phone" class="form-item">
            <el-input
              v-model="loginForm.phone"
              placeholder="手机号"
            />
          </el-form-item>

          <!-- 验证码区域 -->
          <el-form-item prop="code" class="form-item">
            <div class="code-input-group">
              <el-input
                v-model="loginForm.code"
                placeholder="验证码"
              />
              <el-button
                type="primary"
                class="send-code-btn"
                :disabled="!canSendCode"
                @click="sendCode"
              >
                {{ canSendCode ? '发送短信' : `${countdown}秒后重新发送` }}
              </el-button>
            </div>
          </el-form-item>

          <!-- 注册/登录按钮 -->
          <el-form-item class="form-item">
            <el-button type="primary" class="register-login-btn" :loading="loading" @click="handleLogin">
              注册/登录
            </el-button>
          </el-form-item>

          <!-- 取消按钮 -->
          <el-form-item class="form-item">
            <el-button class="cancel-btn" @click="handleCloseDialog">取消</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'InterviewPlaza',
  data() {
    // 自定义手机号验证规则
    const validatePhone = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入手机号'))
      } else if (!/^1[3-9]\d{9}$/.test(value)) {
        callback(new Error('不合法的手机号！'))
      } else {
        callback()
      }
    }

    // 添加验证码验证规则
    const validateCode = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入验证码'))
      } else if (value !== '1234') {
        callback(new Error('验证码错误！'))
      } else {
        callback()
      }
    }

    return {
      activeTab: 'all',
      tabs: [
        { label: '全部', value: 'all' },
        { label: '结构化面试', value: 'structured' },
        { label: '互联网面试', value: 'internet' }
      ],
      interviews: [
        {
          id: 1,
          title: '公务员考试',
          description: '涵盖全国31省市近5年真题，500+高仿真模拟题，协助考生语言表达训练、应急应变技巧、考官评分视角分析',
          type: 'structured',
          icon: 'el-icon-user'
        },
        {
          id: 2,
          title: '教师资格证考试',
          description: '这是一段描述这是一段描述这是一段描述这是一段描述这是一段描述这是一段描述这是一段描述这是一段描述',
          type: 'structured',
          icon: 'el-icon-user-solid'
        },
        {
          id: 3,
          title: '教师资格证考试',
          description: '这是一段描述这是一段描述这是一段描述这是一段描述这是一段描述这是一段描述这是一段描述这是一段描述',
          type: 'structured',
          icon: 'el-icon-user-solid'
        },
        {
          id: 4,
          title: '教师资格证考试',
          description: '这是一段描述这是一段描述这是一段描述这是一段描述这是一段描述这是一段描述这是一段描述这是一段描述',
          type: 'internet',
          icon: 'el-icon-user-solid'
        }
      ],
      isLoggedIn: false,
      userPhone: '',
      loginDialogVisible: false,
      loading: false,
      loginForm: {
        phone: '',
        code: ''
      },
      loginRules: {
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: validatePhone, trigger: 'blur' }
        ],
        code: [
          { required: true, message: '请输入验证码', trigger: 'blur' },
          { validator: validateCode, trigger: 'blur' }
        ]
      },
      countdown: 60,
      timer: null,
      canSendCode: true,
      validPhone: '13012343322' // 可登录手机号
    }
  },

  computed: {
    maskPhoneNumber() {
      if (!this.userPhone) return ''
      return this.userPhone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
    },

    filteredInterviews() {
      if (this.activeTab === 'all') {
        return this.interviews
      }
      return this.interviews.filter(interview => interview.type === this.activeTab)
    }
  },

  // 在组件销毁前清除定时器
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  },

  methods: {
    goToInterview(interview) {
      this.$router.push(`/interview-practice`)
      // 导航到面试练习页面
      // this.$router.push({
      //   name: 'InterviewPractice',
      //   params: { id: interview.id },
      //   query: { type: interview.type }
      // })
    },

    // 新增登录相关方法
    showLoginDialog() {
      this.loginDialogVisible = true
      // 重置表单数据和验证状态
      this.$nextTick(() => {
        this.$refs.loginForm.resetFields()
      })
    },

    handleCloseDialog() {
      this.loginDialogVisible = false
      // 重置表单数据和验证状态
      this.$refs.loginForm.resetFields()
    },

    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          // 验证手机号是否匹配
          if (this.loginForm.phone === this.validPhone && this.loginForm.code === '1234') {
            setTimeout(() => {
              this.loading = false
              this.isLoggedIn = true
              this.userPhone = this.loginForm.phone
              this.handleCloseDialog()
              this.$message.success('登录成功')
            }, 1500)
          } else {
            this.loading = false
            this.$message.error('手机号或验证码错误')
          }
        }
      })
    },

    // 发送验证码
    async sendCode() {
      // 先验证手机号
      this.$refs.loginForm.validateField('phone', async(errorMessage) => {
        if (errorMessage) {
          return // 如果手机号验证不通过，直接返回
        }

        // 手机号验证通过，开始发送验证码
        this.canSendCode = false
        this.countdown = 60

        // 开始倒计时
        this.timer = setInterval(() => {
          if (this.countdown > 0) {
            this.countdown--
          } else {
            this.canSendCode = true
            clearInterval(this.timer)
            this.timer = null
          }
        }, 1000)

        try {
          // 这里添加发送验证码的接口调用
          // await this.$api.sendCode(this.loginForm.phone)
          this.$message.success('验证码发送成功')
        } catch (error) {
          this.canSendCode = true
          clearInterval(this.timer)
          this.$message.error('验证码发送失败')
        }
      })
    },

    // 添加点击页面空白处的处理方法
    handlePageClick(e) {
      // 判断点击的是否是输入框或按钮
      const isFormElement = e.target.closest('.el-input') ||
                          e.target.closest('.el-button') ||
                          e.target.closest('.el-form-item__error')

      // 如果不是表单元素，则清除验证信息
      if (!isFormElement && this.$refs.loginForm) {
        this.$refs.loginForm.clearValidate()
      }
    },

    // 添加退出登录方法
    handleLogout() {
      this.isLoggedIn = false
      this.userPhone = ''
      this.$message.success('已退出登录')
    }
  }
}
</script>

<style scoped>
.interview-plaza {
  min-height: 100vh;
  background-color: #fff;
}

.header {
  padding: 16px 0;
  background: #fff;
  border-bottom: 1px solid #eaeaea;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.header-right {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
  color: #606266;
}

.wallet {
  display: flex;
  align-items: center;
  gap: 4px;
}

.wallet-icon {
  width: 20px;
  height: 20px;
}

.balance {
  font-size: 14px;
  color: #909399;
}

.el-icon-question,
.el-icon-user {
  font-size: 20px;
  cursor: pointer;
  color: #909399;
}

.el-icon-question:hover,
.el-icon-user:hover,
.not-login-text:hover {
  color: #409EFF;
}

.not-login-text {
  cursor: pointer;
  color: #909399;
  font-size: 14px;
}

.user-phone {
  font-size: 14px;
  color: #909399;
}

.logout-text {
  cursor: pointer;
  font-size: 14px;
  color: #F56C6C;
}

.logout-text:hover {
  color: #f78989;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.page-title {
  font-size: 28px;
  font-weight: 500;
  color: #333;
  text-align: center;
  margin-bottom: 30px;
}

.tab-container {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.tab {
  padding: 10px 20px;
  margin: 0 10px;
  cursor: pointer;
  font-size: 16px;
  color: #606266;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
}

.tab.active {
  color: #409EFF;
  border-bottom-color: #409EFF;
}

.tab:hover {
  color: #409EFF;
}

.card-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.interview-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s;
  cursor: pointer;
  position: relative;
  height: 200px;
  display: flex;
  flex-direction: column;
}

.interview-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.card-icon {
  width: 50px;
  height: 50px;
  background: #f0f2f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 20px;
  left: 20px;
}

.card-icon i {
  font-size: 24px;
  color: #606266;
}

.card-content {
  padding: 20px 20px 20px 80px;
  flex: 1;
}

.card-title {
  font-size: 18px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 10px;
}

.card-desc {
  font-size: 14px;
  color: #909399;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-action {
  padding: 15px 20px;
  background: #f5f7fa;
  text-align: right;
}

.action-text {
  color: #409EFF;
  font-size: 14px;
  padding-right: 5px;
}

/* 登录弹窗样式 */
.dialog-container {
  .el-dialog__header {
    padding: 0;
    padding-bottom: 0;
  }

  .el-dialog {
    width: 560px !important;
    height: 480px !important;
    position: fixed !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    margin: 0 !important;
    background: #F5F5F5 !important;
    border-radius: 8px !important;
    padding: 0 !important;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1) !important;
    overflow: hidden !important;
  }

  .el-dialog__body {
    height: 100% !important;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 16px 32px;
    gap: 24px !important;
  }

  .login-container {
    .el-button--primary {
      border-color: #FFF;
    }

    .el-form {
      width: 480px !important;

      .el-input__inner {
        width: 100% !important;
        height: 44px !important;
        padding: 0 15px !important;
        line-height: 44px !important;
        box-sizing: border-box !important;
        font-size: 16px;
        border-radius: 16px !important;
      }

      .code-input-group {
        display: flex;
        gap: 16px;

        .el-input {
          flex: 1;

          .el-input__inner {
            width: 100% !important;
            border-radius: 16px !important;
          }
        }

        .send-code-btn {
          width: 144px !important;
          height: 44px !important;
          background: black !important;
          color: white !important;
          border-radius: 16px !important;
        }
      }

      /* 修改表单项间距 */
      .form-item {
        margin-bottom: 24px !important;  /* 普通表单项的底部间距 */
      }

      /* 特别调整验证码输入框（第二个表单项）的间距 */
      .form-item:nth-child(2) {
        margin-bottom: 32px !important;  /* 增加或减少这个值来调整验证码输入框的位置 */
      }

      /* 调整登录按钮（第三个表单项）的间距 */
      .form-item:nth-child(3) {
        margin-bottom: 16px !important;
      }
    }

    /* 登录和取消按钮 */
    .register-login-btn,
    .cancel-btn {
      width: 100% !important;
      height: 44px !important;
      border-radius: 16px;
    }

    .register-login-btn {
      background: black !important;
      color: white !important;
      font-size: 16px;
    }

    .register-login-btn:hover {
      background: #303133 !important;
    }

    .cancel-btn {
      background: transparent !important;
      color: #606266 !important;
      border: 1px solid #DCDCDC !important;
    }
  }

  .login-logo {
    width: 480px;
    height: 120px;
    background: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36px;
    font-weight: bold;
    color: #606266;
    margin-bottom: 48px !important;
  }

:deep(.el-form) {
  width: 80% !important;
}

.form-item {
  margin-bottom: 8px !important;
}

.form-item:nth-child(2) {
  margin-bottom: 48px !important;
}

:deep(.el-form-item__error) {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  padding: 0;
  margin: 0;
  line-height: normal;
  color: #F56C6C;
  z-index: 2;
  background: white;
}

:deep(.el-input__inner) {
  padding-right: 100px !important; /* 为错误提示预留空间 */
}
}
</style>
