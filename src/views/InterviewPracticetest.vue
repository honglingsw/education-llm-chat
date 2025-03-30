<template>
  <div class="interview-page" @click="handlePageClick">
    <!-- 顶部导航 -->
    <header class="header">
      <div class="header-container">
        <!-- 左侧logo -->
        <div class="header-left">
          <img class="nav-logo" src="@/assets/logo1.png" alt="Logo">
        </div>
        <!-- 右侧工具栏 -->
        <div class="header-right">
          <div class="nav-icons">
            <template v-if="isLoggedIn">
              <div class="nav-icons-wrapper">
                <div class="qr-tooltip-container">
                  <img class="icon-img" src="@/assets/all.png" alt="all">
                  <div class="qr-tooltip">
                    <div class="qr-tooltip-content">
                      <img src="@/assets/qr_code.png" alt="QR Code" class="qr-code-img">
                      <div class="qr-tooltip-text">进群送次数</div>
                    </div>
                  </div>
                </div>
                <div class="wallet nav-icon" @click="showRechargeDialog">
                  <img class="wallet-icon" src="@/assets/wallet.png" alt="wallet">
                  <span class="balance"
                    style="font-size: 14px; color: #111111; font-family: 'Alibaba Sans', sans-serif;">{{ coinBalance
                    }}</span>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="nav-icons-wrapper">
                <div class="qr-tooltip-container">
                  <img class="icon-img" src="@/assets/all.png" alt="all">
                  <div class="qr-tooltip">
                    <div class="qr-tooltip-content">
                      <img src="@/assets/qr_code.png" alt="QR Code" class="qr-code-img">
                      <div class="qr-tooltip-text">进群送次数</div>
                    </div>
                  </div>
                </div>
                <img class="icon-img" src="@/assets/wallet.png" alt="wallet" @click="showRechargeDialog">
              </div>
            </template>
          </div>
          <div class="user-actions">
            <template v-if="isLoggedIn">
              <img src="@/assets/user.png" class="user-icon" alt="user" />
              <span class="user-phone"
                style="color: #111111; font-family: 'Alibaba Sans', sans-serif; font-size: 14px;">{{ maskPhoneNumber
                }}</span>
              <img src="@/assets/out.png" class="logout-icon" alt="logout" @click="handleLogout" />
            </template>
            <template v-else>
              <el-button class="login-button" type="primary" @click="showLoginDialog">登录</el-button>
            </template>
          </div>
        </div>
      </div>
    </header>
    <div>
      <!-- 主体内容 -->
      <main class="main-content-row">
        <div v-show="!drawerVisible" class="drawer-trigger" style="left: 0; right: auto;">
          <div class="trigger-area" @click="toggleDrawer">
            <i class="el-icon-notebook-2" />
            <span>答题表</span>
          </div>
        </div>
        <div class="main-container">
          <!-- 替换浮动按钮为侧拉栏 -->
          <transition name="slide-left">

            <div class="left-panel" v-show="drawerVisible">
              <!-- 抽屉顶部区域：标题和折叠图标 -->
              <div class="drawer-header">
                <span class="title">答题表</span>
                <img class="logo" src="@/assets/logoOrderedHistory.png" alt="折叠" @click="toggleDrawer" />
              </div>
              <div class="drawer-content">
                <div class="question-list">
                  <div v-for="(item, i) in orderedHistory" :key="item.answerId"
                    @click="get_exam_detail(item.questionId, i)"
                    :class="['question-item', { active: currentQuestionIndex === i }]">
                    <span>
                      {{ i + 1 }}.
                      <span v-if="item.state === 'ANSWERED' || item.state === 'VIEWED'" :class="['question-item-status', {
                        'item-status-answered': item.state === 'ANSWERED',
                        'item-status-viewed': item.state === 'VIEWED'
                      }]">
                        {{ item.state === 'ANSWERED' ? '已作答' : '已阅读' }}
                      </span>
                      {{ item.questionContent }} （{{ item.examTime }} {{ item.questionType }}）
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </transition>
          <main class="main-content">



            <!-- 侧拉栏触发区域 -->

            <!-- 翻页区域 -->
            <!-- <div class="pagination top-pagination">
          <div class="time-region">
            <div class="label-group">
              <span class="label">时间</span>
              <el-select v-model="selectedYear" size="small" placeholder="选择年份">
                <el-option v-for="year in years" :key="year" :label="year" :value="year" />
              </el-select>
            </div>
            <div class="label-group">
              <span class="label">地区</span>
              <el-select v-model="selectedRegion" size="small" placeholder="选择地区">
                <el-option v-for="region in regions" :key="region" :label="region" :value="region" />
              </el-select>
            </div>
            <div class="label-group">
              <span class="label">考题类型</span>
              <el-select v-model="selectedQuestionType" size="small" placeholder="选择地区">
                <el-option v-for="questionType in questionTypes" :key="questionType" :label="questionType"
                  :value="questionType" />
              </el-select>
            </div>
            <el-button @click="changeQuestion()">查询</el-button>
            <el-button @click="clearFilters">清空</el-button>
          </div>
         
        </div>  -->

            <!-- 题目区域 -->
            <div class="question-box">
              <div class="back-btn" @click="goBack">
                <i class="el-icon-arrow-left"></i>
                <span>返回</span>
                <span class="exam-title">公务员考试</span>
                <div class="light-btn" @click.stop="showTips">
                  <img src="@/assets/light.png" alt="提示" class="light-icon">
                </div>
              </div>
              <div class="page-region">
                <div class="question-number">
                  <span>{{ currentIndex }}</span>
                  <div class="question-status-tag"
                    v-if="questionContent.questionStateEnum === 'ANSWERED' || questionContent.questionStateEnum === 'VIEWED'"
                    :class="{
                      'status-answered': questionContent.questionStateEnum === 'ANSWERED',
                      'status-viewed': questionContent.questionStateEnum === 'VIEWED'
                    }">
                    {{ questionContent.questionStateEnum === 'ANSWERED' ? '已作答' : '已阅读' }}
                  </div>
                </div>
                <div class="nav-buttons">
                  <el-button class="square-nav-btn" @click="prevQuestion">
                    <img src="@/assets/left.png" alt="上一题" class="arrow-icon">
                  </el-button>
                  <span>{{ currentIndex }}/{{ totalCount }}</span>
                  <el-button class="square-nav-btn" @click="nextQuestion">
                    <img src="@/assets/right.png" alt="下一题" class="arrow-icon">
                  </el-button>
                </div>
              </div>
              <h1 class="question-title">
                {{ questionContent.content }}
                <span v-if="questionContent.examTime || questionContent.questionType" class="question-subtitle">
                  （{{ questionContent.examTime }} {{ questionContent.questionType }}）
                </span>
              </h1>
            </div>

            <div class="content-wrapper">
              <!-- 左侧录音区域 -->
              <div class="record-box">
                <!-- 修改录音区域的头部布局 -->
                <div class="record-header">
                  <div class="record-title">
                    自主作答
                    <span class="recording-wave" v-if="isRecording"></span>
                  </div>

                  <!-- 录音中显示结束作答按钮 -->
                  <div class="header-actions" v-if="isRecording">
                    <button class="action-btn end-record-btn" @click="endRecording">
                      结束作答
                    </button>
                  </div>

                  <!-- 录音结束后显示三个操作按钮 -->
                  <div class="header-actions" v-if="!isRecording && hasRecordedContent">
                    <button class="action-btn restart-btn" @click="restartRecording">
                      <i class="el-icon-microphone"></i>
                      重新回答
                    </button>
                    <button class="action-btn fullscreen-btn" @click="toggleFullscreen">
                      <i class="el-icon-full-screen"></i>
                      全屏
                    </button>
                    <button class="action-btn evaluation-btn" @click="showEvaluation" v-if="!showEvaluationContentIn">
                      <i class="el-icon-s-comment"></i>
                      作答点评
                    </button>
                  </div>
                </div>

                <!-- 录音前的提示 -->
                <div class="record-hint" v-if="!isRecording && !hasRecordedContent">
                  点击录音按钮，开始答题

                  <!-- 录音按钮 - 只在录音前显示 -->
                  <div class="record-button-wrapper">
                    <div class="mic-circle" @click="toggleRecording">
                      <img src="@/assets/microphone.png" alt="microphone">
                    </div>
                  </div>
                </div>

                <!-- 录音中或录音后的内容 -->
                <template v-else>
                  <div id="status"></div>
                  <div class="recorded-content" ref="recordContent">
                    {{ asrResult }}
                    <!-- 点评内容 -->
                    <div v-if="showEvaluationContentIn" class="evaluation-content" ref="evaluationContent">
                      <p class="paragraph model-thinking" v-html="markdownReason"></p>
                      <p class="paragraph" v-html="markdownResult"></p>
                    </div>
                  </div>
                </template>
              </div>

            </div>
          </main>
          <transition name="slide-right">
            <div class="demo-panel" v-show="demoDrawerVisible">
              <div class="demo-drawer-content">
                <template v-if="!isDemoStarted">
                  <div class="demo-start-area" @click="startDemo">
                    <img class="logo" src="@/assets/deepseek-color.png" alt="Logo">
                    <div class="demo-text">deepseek</div>
                    <div class="demo-hint">点击开始示范</div>
                  </div>
                </template>
                <template v-else>
                  <div class="source-hint">
                    以下内容均来自deepseek-r1生成
                    <el-button type="text" class="regenerate-btn" @click.stop="startDemo">
                      <i class="el-icon-refresh" />
                      重新生成
                    </el-button>
                    <el-button type="text" @click="toggleAn">
                      <i :class="isAnVisible ? 'el-icon-s-fold' : 'el-icon-s-unfold'" />
                      {{ isAnVisible ? '隐藏' : '显示' }}
                    </el-button>
                  </div>
                  <div class="demo-content" v-if="isAnVisible" ref="sourceHint">
                    <div class="content-text">
                      <p class="paragraph model-thinking" v-html="markdownReasonContent"></p>
                      <p class="paragraph" v-html="markdownModelResult"></p>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </transition>
        </div>
      </main>

      <!-- 示范作答侧拉按钮 -->
      <div class="demo-trigger">
        <div class="demo-trigger-area" @click="toggleDemoDrawer">
          <span>示范作答</span>
          <i :class="demoDrawerVisible ? 'el-icon-arrow-right' : 'el-icon-arrow-left'"></i>
        </div>
      </div>




    </div>

    <!-- 添加消息对话框 -->
    <el-dialog :visible.sync="messageDialogVisible" :show-close="false" class="welcome-dialog">
      <div class="welcome-content">
        <h1 class="welcome-title">欢迎使用结构化面试陪练助手！</h1>

        <p class="user-greeting">亲爱的考生:</p>

        <p class="intro-text">感谢您对我们产品的信任！ 在这里，我们将为您简单介绍一下本系统的功能和使用方法。</p>

        <p class="feature-text">
          结构化面试是当前公务员/事业编考试中，最常见的面试形式。结构化面试常见的评分维度存在......等评分维度。根据过往经验，我们将结构化面试分为了5个维度：分析能力、应变能力、计划组织能力、人际交往意识与技巧、言语表达能力。
        </p>

        <p class="dots">......</p>

        <p class="feature-text">在结构化面试陪练助手中，基于国内顶尖的人工智能大模型，我们为您提供了专业、智能的面试练习体验。</p>

        <p class="dots">......</p>

        <p class="more-info">访问xx网站以获取更多信息：<a href="http://www.example.com">http://www.example.com</a></p>

        <div class="signature">
          <p>您的职业伙伴</p>
          <p>aigcpm</p>
          <p>2025年4月19日</p>
        </div>

        <div class="btn-container">
          <button class="confirm-btn" @click="messageDialogVisible = false">确定</button>
        </div>
      </div>
    </el-dialog>

    <!-- 添加充值弹窗 -->
    <el-dialog :visible.sync="rechargeDialogVisible" class="recharge-dialog" width="720px" :show-close="false" center>
      <div class="recharge-container">
        <!-- 顶部用户信息 -->
        <div class="recharge-header">
          <div class="user-info">
            <i class="el-icon-user" />
            <span>{{ maskPhoneNumber }}</span>
          </div>
          <div class="wallet-info">
            <img class="wallet-icon" src="@/assets/wallet.png" alt="wallet">
            <span>{{ isLoggedIn ? '4000' : '----' }}</span>
          </div>
          <div class="close-btn" @click="rechargeDialogVisible = false">
            <i class="el-icon-close" />
          </div>
        </div>

        <!-- 充值选项 -->
        <div class="recharge-options">
          <div v-for="(option, index) in rechargeOptions" :key="index" class="recharge-option"
            :class="{ 'selected': selectedRechargeOption === index }" @click="selectedRechargeOption = index">
            <div class="original-price">{{ option.originalPrice }}元</div>
            <div class="discount-price">{{ option.discountPrice }}元</div>
            <div class="points">{{ option.points }} <i class="el-icon-info" /></div>
          </div>
        </div>

        <!-- 支付方式 -->
        <div class="payment-section">
          <!-- 二维码区域 -->
          <div class="qr-code">
            <img src="@/assets/qr_code.png" alt="QR Code">
          </div>

          <!-- 右侧区域：支付选项和说明文字 -->
          <div class="payment-right-section">
            <!-- 支付选项 -->
            <div class="payment-options">
              <div class="payment-option" :class="{ 'selected': paymentMethod === 'wechat' }"
                @click="paymentMethod = 'wechat'">
                <label class="radio-label">
                  <input type="radio" name="payment" :checked="paymentMethod === 'wechat'">
                  <span class="radio-custom"></span>
                  <img src="@/assets/wechat_pay.png" alt="WeChat Pay">
                  <span>微信支付</span>
                </label>
              </div>
              <div class="payment-option" :class="{ 'selected': paymentMethod === 'alipay' }"
                @click="paymentMethod = 'alipay'">
                <label class="radio-label">
                  <input type="radio" name="payment" :checked="paymentMethod === 'alipay'">
                  <span class="radio-custom"></span>
                  <img src="@/assets/alipay.png" alt="Alipay">
                  <span>支付宝支付</span>
                </label>
              </div>
            </div>

            <!-- 说明文字 -->
            <div class="payment-notes">
              <p>• 每次答题点评消耗积分，每次智能示范消耗积分；点数不足时，无法使用对应服务</p>
              <p>• 完成支付即视为同意<span class="agreement">《用户协议》</span></p>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 添加登录弹框 -->
    <el-dialog :visible.sync="loginDialogVisible" class="dialog-container" width="400px" :show-close="false"
      :before-close="handleCloseDialog" :close-on-click-modal="false" center>
      <div class="login-container">
        <!-- LOGO区域 -->
        <div class="login-logo">
          <img src="@/assets/logo1.png" alt="Logo" class="logo-image">
        </div>

        <el-form ref="loginForm" :model="loginForm" :rules="loginRules" label-width="0">
          <!-- 手机号输入框 -->
          <el-form-item prop="phone" class="form-item">
            <el-input v-model="loginForm.phone" placeholder="手机号" />
          </el-form-item>

          <!-- 图形验证码 -->
          <el-form-item prop="captcha" class="captcha-verify">
            <el-input v-model="captcha.captchaCode" placeholder="图片验证" class="captcha-input" />
            <el-image :src="captcha.captchaImg" alt="" class="captcha-image">
              <div slot="placeholder" class="image-slot">
                加载中<span class="dot">...</span>
              </div>
            </el-image>
            <i class="el-icon-refresh" @click="getCaptcha"></i>
          </el-form-item>

          <!-- 验证码区域 -->
          <el-form-item prop="code" class="form-item">
            <div class="verify-input-wrapper">
              <el-input v-model="loginForm.code" placeholder="输入验证码" class="verify-input" />
              <span class="send-code-text" :class="{ 'disabled': !canSendCode }" @click="sendCode">
                {{ canSendCode ? '获取短信验证码' : `${countdown}秒后重新发送` }}
              </span>
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

    <!-- 添加反馈对话框 -->
    <el-dialog :visible.sync="feedbackDialogVisible" :show-close="false" class="feedback-dialog" center>
      <div class="feedback-content">
        <div class="close-btn" @click="feedbackDialogVisible = false">
          <i class="el-icon-close"></i>
        </div>

        <h2>言e面试对您的面试有帮助吗?</h2>
        <div class="star-rating">
          <i class="el-icon-star-off" v-for="i in 5" :key="'help' + i" @click="setHelpRating(i)"
            :class="{ 'el-icon-star-on': helpRating >= i }"></i>
        </div>

        <h2>言e面试的使用体验好吗?</h2>
        <div class="star-rating">
          <i class="el-icon-star-off" v-for="i in 5" :key="'use' + i" @click="setUseRating(i)"
            :class="{ 'el-icon-star-on': useRating >= i }"></i>
        </div>

        <h2>言e面试的解答是否专业?</h2>
        <div class="star-rating">
          <i class="el-icon-star-off" v-for="i in 5" :key="'professional' + i" @click="setProfessionalRating(i)"
            :class="{ 'el-icon-star-on': professionalRating >= i }"></i>
        </div>

        <h2>言e面试的定价是否合理?</h2>
        <div class="star-rating">
          <i class="el-icon-star-off" v-for="i in 5" :key="'price' + i" @click="setPriceRating(i)"
            :class="{ 'el-icon-star-on': priceRating >= i }"></i>
        </div>

        <h2>如果您还有更多想说的，请告诉我:</h2>
        <el-input type="textarea" :rows="3" v-model="feedbackComment" placeholder="请输入您的反馈意见..."></el-input>

        <div class="auto-show-option">
          <el-checkbox v-model="notAutoShow">不再自动弹出</el-checkbox>
        </div>

        <div class="feedback-btns">
          <el-button class="cancel-btn" @click="feedbackDialogVisible = false">不了，谢谢</el-button>
          <el-button type="primary" class="submit-btn" @click="submitFeedback">提交反馈</el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 添加悬浮按钮 -->
    <div class="float-button" @click="feedbackDialogVisible = true">
      <img src="@/assets/QA.png" alt="QA" class="qa-icon">
    </div>

    <!-- 修改全屏模态框结构 -->
    <div class="fullscreen-modal" v-if="isFullscreenModalVisible" @click.self="closeFullscreenModal">
      <div class="fullscreen-content">
        <div class="fullscreen-header">
          <div class="fullscreen-title">自主作答</div>
          <button class="close-fullscreen-btn" @click="closeFullscreenModal">
            <i class="el-icon-close"></i>
          </button>
        </div>
        <div class="fullscreen-body">
          <!-- 分为左右两栏 -->
          <div class="fullscreen-columns">
            <!-- 左侧：用户作答内容 -->
            <div class="fullscreen-answer-column">
              <div class="column-title">我的作答</div>
              <div class="column-content">{{ asrResult }}</div>
            </div>

            <!-- 右侧：点评内容（仅当有点评时显示） -->
            <div class="fullscreen-evaluation-column" v-if="showEvaluationContentIn">
              <div class="column-title">作答点评</div>
              <div class="column-content">
                <p class="paragraph model-thinking" v-html="markdownReason"></p>
                <p class="paragraph" v-html="markdownResult"></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import ASRClient from '@/utils/asr'
import { stream } from 'xlsx';
import { marked } from 'marked'
export default {
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
        // } else if (value !== '1234') {
        //   callback(new Error('验证码错误！'))
      } else {
        callback()
      }
    }

    return {
      messageDialogVisible: false,
      feedbackDialogVisible: false,
      drawerVisible: false,
      demoDrawerVisible: false,
      isRecording: false,
      loginDialogVisible: false,
      loading: false,
      token: '',
      loginForm: {
        phone: '',
        code: ''
      },
      coinBalance: 0,
      asrClient: null,
      captcha: {
        captchaId: '',
        captchaImg: '',
        captchaCode: '',
      },
      loginRules: {
        phone: [
          { required: true, message: '请输入手机号', trigger: 'submit' },
          { validator: validatePhone, trigger: 'submit' }
        ],
        code: [
          { required: true, message: '请输入验证码', trigger: 'submit' },
          { validator: validateCode, trigger: 'submit' }
        ],
      },

      activeTab: 'demo',
      countdown: 60,
      timer: null,
      canSendCode: true,
      hasRecordedContent: false,
      showEvaluationContentIn: false,
      isDemoStarted: false,
      recordCount: 0, // 添加录音次数计数
      showTipMessage: false, // 控制提示消息的显示
      isLoggedIn: false,
      userPhone: '',
      validPhone: '13012343322', // 可登录手机号先写
      modelResult: '',
      selectedQuestionType: '',
      selectedYear: '',
      selectedRegion: '',
      questionContentitem: '',
      orderedHistory: [], // 用于存储按答题顺序排列的历史记录
      history: [],
      errorLock: false,
      years: [],
      regions: [],
      questionTypes: [],

      questionContent: {
        questionId: '',
        content: '',
        answer: '',
        totalCount: '',
        currentIndex: ''
      },
      questionContentitem: {
        questionContent: '',
        region: '',
        questionType: ''
      },
      questionIdList: [],
      questionCount: 0,
      currentQuestionIndex: 0,

      rechargeDialogVisible: false,
      selectedRechargeOption: 0,
      paymentMethod: 'wechat',
      rechargeOptions: [
        { originalPrice: '129.9', discountPrice: '99.99', points: '2000' },
        { originalPrice: '129.9', discountPrice: '99.99', points: '2000' },
        { originalPrice: '129.9', discountPrice: '99.99', points: '2000' },
        { originalPrice: '129.9', discountPrice: '99.99', points: '2000' }
      ],

      searchInput: {
        examType: '',
        questionType: '',
        year: '',
        region: ''
      },
      asrResult: '',
      submitting: false,
      currentIndex: 1,
      totalCount: 22,
      aiResponseReasonContent: '',
      aiResponseResult: '',
      reasonContent: '',
      isAnVisible: true,
      helpRating: 0,
      useRating: 0,
      feedbackComment: '',
      notAutoShow: false,
      professionalRating: 0,
      priceRating: 0,
      isFullscreenModalVisible: false
    }
  },

  computed: {
    maskPhoneNumber() {
      if (!this.userPhone) return ''
      return this.userPhone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
    },
    markdownReason() {
      return marked(this.aiResponseReasonContent || '')
    },
    markdownResult() {
      return marked(this.aiResponseResult || '')
    },
    markdownReasonContent() {
      return marked(this.reasonContent || '')
    },
    markdownModelResult() {
      return marked(this.modelResult || '')
    }
  },
  mounted() {
    this.getUserInfo()
    this.getToken()
    this.get_exam_history()
    this.changeQuestion()
    this.searchInput.examType = this.$route.query.type
    const token = localStorage.getItem('token');
    var config = {
      method: 'get',
      url: 'https://test.aigcpmer.com/api/api/exam/tags',
      headers: { 'Authorization': `Bearer ${token}` }
    };
    axios(config)
      .then((response) => {
        console.log(response.data);
        this.questionTypes = response.data.data[0].tags
        this.years = response.data.data[1].tags
        this.regions = response.data.data[2].tags
      })
      .catch(function (error) {
        console.log(error);
      });

    this.getCaptcha()
    this.asrRecording()
    this.changeQuestion()

    // 检查是否需要显示欢迎对话框
    this.checkWelcomeDialog()

    // 添加全局点击监听器
    document.addEventListener('click', this.handlePageClick)
  },
  watch: {
    selectedQuestionType(newVal, oldVal) {
      this.searchInput.questionType = newVal
    },
    selectedYear(newVal, oldVal) {
      this.searchInput.year = newVal
    },
    selectedRegion(newVal, oldVal) {
      this.searchInput.region = newVal
    }
  },

  methods: {
    showMessageDialog() {
      this.messageDialogVisible = true;
    },

    showFeedbackDialog() {
      this.feedbackDialogVisible = true;
    },

    setHelpRating(rating) {
      this.helpRating = rating;
    },

    setUseRating(rating) {
      this.useRating = rating;
    },

    setProfessionalRating(rating) {
      this.professionalRating = rating;
    },

    setPriceRating(rating) {
      this.priceRating = rating;
    },

    submitFeedback() {
      // 准备要提交的数据
      const feedbackData = {
        helpRating: this.helpRating,
        useRating: this.useRating,
        professionalRating: this.professionalRating,
        priceRating: this.priceRating,
        comment: this.feedbackComment,
        notAutoShow: this.notAutoShow
      };

      // 这里可以添加API请求来提交数据
      console.log('提交的反馈数据:', feedbackData);

      this.$message.success('感谢您的参与，祝您生活愉快！');
      this.feedbackDialogVisible = false;
      // 重置表单数据
      this.helpRating = 0;
      this.useRating = 0;
      this.feedbackComment = '';
      this.professionalRating = 0;
      this.priceRating = 0;
    },

    // 添加检查欢迎对话框的方法
    checkWelcomeDialog() {
      let storageKey = 'lastVisitTime_guest';

      // 如果用户已登录，使用用户手机号作为唯一标识符
      if (this.isLoggedIn && this.userPhone) {
        storageKey = `lastVisitTime_${this.userPhone}`;
      }

      const lastVisitTime = localStorage.getItem(storageKey);
      const currentTime = Date.now();
      const daysPassed = lastVisitTime ? this.getDaysPassed(parseInt(lastVisitTime), currentTime) : null;

      // 检查是否是180天内的首次访问或者从未访问过
      if (!lastVisitTime || daysPassed > 180) {
        // 显示欢迎对话框
        this.messageDialogVisible = true;
        // 更新访问时间
        localStorage.setItem(storageKey, currentTime.toString());
      }
    },

    // 计算两个时间戳之间经过的天数
    getDaysPassed(oldTimestamp, newTimestamp) {
      const millisecondsInDay = 24 * 60 * 60 * 1000;
      return Math.floor((newTimestamp - oldTimestamp) / millisecondsInDay);
    },

    get_exam_history(page, size) {
      const token = localStorage.getItem('token');

      var data = {
        page: page || 1,
        size: size || 10,
        serviceTypeEnum: this.serviceTypeEnum || "GOV_EXAM"
      }

      var config = {
        method: 'get',
        url: 'https://test.aigcpmer.com/api/api/exam/history',
        headers: { 'Authorization': `Bearer ${token}` },
        params: data
      };

      axios(config)
        .then((response) => {
          if (response.data.code === 200) {
            this.history = response.data.data;
            console.log(this.history);
            // 根据 answerId 排序，较新的 ID 排在前面
            this.orderedHistory = [...this.history].sort((a, b) => b.answerId - a.answerId);
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    toggleAn() {
      this.isAnVisible = !this.isAnVisible
    },
    get_exam_detail(id, I) {
      this.currentQuestionIndex = I
      console.log('id', id);
      const token = localStorage.getItem('token');
      const data = {
        currentId: id
      }

      axios({
        method: 'post',
        url: 'https://test.aigcpmer.com/api/api/exam/switchQuestionById',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        data: data
      })
        .then(response => {
          if (response.data.code === 200) {
            const data = response.data.data;

            // 更新题目内容对象
            this.questionContent = {
              questionId: data.questionId,
              content: data.content,
              answer: data.answer,
              questionStateEnum: data.questionStateEnum,
              totalCount: data.totalCount || this.totalCount
            };
            this.questionContent.questionId = data.questionId
            
            this.modelResult = data.modelResult;
            this.hasRecordedContent = true;
            this.asrResult = data.userContent;
            this.aiResponseReasonContent = data.reasonContent;
            this.aiResponseResult = data.modelResult
            this.currentIndex = data.currentIndex
            // 重置相关状态
            this.isDemoStarted = false;
            this.showEvaluationContentIn = true;
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    getCaptcha() {
      var config = {
        method: 'get',
        url: 'https://test.aigcpmer.com/api/auth/captcha',
        headers: {}
      };

      axios(config)
        .then((response) => {
          // console.log(response.data);
          this.captcha.captchaId = response.data.data.captchaId
          this.captcha.captchaImg = response.data.data.captchaImage
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    asrRecording() {
      // const startBtn = document.getElementById('asrRecording');
      // const stopBtn = document.getElementById('stopBtn');
      // const resultDiv = document.getElementById('recordContent');
      // const statusDiv = document.getElementById('status');
      // console.log(startBtn, stopBtn, resultDiv, statusDiv);

      // 创建ASR客户端
      this.asrClient = new ASRClient('wss://test.aigcpmer.com/asr/ws');

      // 设置回调函数
      this.asrClient.setCallbacks({
        onReady: () => {
          // statusDiv.textContent = '准备就绪，可以开始识别';
          this.$refs.asrRecording.disabled = false; // 启用开始按钮
        },
        onStart: () => {
          // statusDiv.textContent = '正在识别...';
        },
        onPartialResult: (text) => {
          // resultDiv.textContent = text;
          this.asrResult = text
        },
        onFinalResult: (text) => {
          resultDiv.textContent = text;
          // 可以在这里处理最终识别结果
        },
        onComplete: () => {
          // statusDiv.textContent = '识别完成';
        },
        onError: (error) => {
          // statusDiv.textContent = `错误: ${error}`;
        }
      });

      // 连接到WebSocket服务器
      this.asrClient.connect().then(() => {
        // 连接成功后主动启用开始按钮
        this.$refs.asrRecording.disabled = false;
        // statusDiv.textContent = '已连接到服务器，可以开始识别';
      }).catch(error => {
        // statusDiv.textContent = `连接错误: ${error.message}`;
      });

      // 开始按钮
      this.$refs.asrRecording.addEventListener('click', () => {
        this.asrResult = '';
        this.aiResponseReasonContent = '';
        this.aiResponseResult = '';
        // this.$refs.asrRecording.disabled = true;
        // this.$refs.stopBtn.disabled = false;
        this.asrClient.startRecognition();
      });

      // 停止按钮
      this.$refs.stopBtn.addEventListener('click', () => {
        console.log('this.asrClient.stopRecognition');
        // this.$refs.asrRecording.disabled = false;
        // this.$refs.stopBtn.disabled = true;
        this.asrClient.stopRecognition();
        this.asrClient.disconnect();
      });

      // 页面卸载时断开连接
      window.addEventListener('beforeunload', () => {
        this.asrClient.disconnect();
      });
    },
    startRecognition() {
      this.asrResult = '';
      this.aiResponseReasonContent = '';
      this.aiResponseResult = '';

      // 如果ASR客户端不存在或已断开连接，重新创建并连接
      if (!this.asrClient) {
        this.asrClient = new ASRClient('wss://test.aigcpmer.com/asr/ws');

        // 设置回调函数
        this.asrClient.setCallbacks({
          onReady: () => {
            console.log('ASR客户端准备就绪');
          },
          onStart: () => {
            console.log('开始识别');
          },
          onPartialResult: (text) => {
            this.asrResult = text;
            this.hasRecordedContent = !!text; // 有内容时设置为true
          },
          onFinalResult: (text) => {
            this.asrResult = text;
            this.hasRecordedContent = !!text; // 有内容时设置为true
          },
          onComplete: () => {
            console.log('识别完成');
          },
          onError: (error) => {
            console.error('识别错误:', error);
          }
        });

        this.asrClient.connect().then(() => {
          this.asrClient.startRecognition();
        }).catch(error => {
          console.error('ASR客户端连接失败:', error);
          this.$message.error('语音识别服务连接失败，请重试');
          this.isRecording = false;
        });
      } else {
        this.asrClient.startRecognition();
      }
    },
    // 新增一个方法来处理停止按钮的点击
    endRecording() {
      // 停止录音
      if (this.asrClient) {
        this.asrClient.stopRecognition();
        this.asrClient.disconnect();
      }

      // 更新状态
      this.isRecording = false;
      this.hasRecordedContent = true;
      this.showEvaluationContentIn = false;
    },
    searchQuestion(pageNum, pageSize) {
      console.log(this.searchInput);

      var data = JSON.stringify({
        "examType": this.searchInput.examType || '',
        "examTime": this.searchInput.year || '2017',
        "region": this.searchInput.region || 'HuBei',
        "questionType": this.searchInput.questionType || '',
        "pageNum": 1,
        "pageSize": 10
      });

      var config = {
        method: 'post',
        url: '/api/exam/filter',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
        },
        data: data
      };

      axios(config)
        .then((response) => {
          console.log(response.data);
        })
        .catch(function (error) {
          console.log(error);
        });

    },
    changeQuestion(direction) {
      if (this.isLoading) return;
      this.isLoading = true;

      // 构建请求数据
      const data = this.questionContent.questionId ? {
        currentId: this.questionContent.questionId, // 当前题目ID
        direction: direction, // 方向：-1 上一题，1 下一题
        tags: {
          examType: '',        // 根据需要设置
          examTime: this.selectedYear || '',
          region: this.selectedRegion || '',
          questionType: this.selectedQuestionType || '',
          pageNum: 1,
          pageSize: 1
        },
        keyword: ''
      } : {};
      const token = localStorage.getItem('token');

      axios({
        method: 'post',
        url: 'https://test.aigcpmer.com/api/api/exam/switch',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        data: data
      })
        .then(response => {
          this.isLoading = false;

          if (response.data.code === 200 && response.data.data) {
            // 更新题目内容
            const questionData = response.data.data;
            this.questionContent = {
              questionId: questionData.questionId,
              content: questionData.content,
              answer: questionData.answer,
              questionStateEnum: questionData.questionStateEnum
            };

            // 更新题目序号
            if (questionData.currentIndex) {
              this.currentIndex = questionData.currentIndex;
            }
            if (questionData.totalCount) {
              this.totalCount = questionData.totalCount;
            }

            // 重置相关状态
            this.isDemoStarted = false;
            this.hasRecordedContent = false;
            this.showEvaluationContentIn = false;
            this.asrResult = '';
            this.modelResult = '';
          } else {
            // 处理错误情况
            if (!this.errorLock) {
              this.errorLock = true;
              this.$message.error(response.data.message || '切换题目失败');
              setTimeout(() => {
                this.errorLock = false;
              }, 2000);
            }
          }
        })
        .catch(error => {
          console.log('接口错误：', error);
          this.isLoading = false;
          if (!this.errorLock) {
            this.errorLock = true;
            const msg =
              (error.response && error.response.data && error.response.data.message) ||
              '切换题目失败';
            this.$message.error(msg);
            setTimeout(() => {
              this.errorLock = false;
            }, 2000);
          }
        });
    },
    async submitAnswer() {
      let stream = true
      const token = localStorage.getItem('token');

      const config = {
        method: 'POST', // 根据实际需求设置请求方法
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/plain',
          'Authorization': `Bearer ${token}`,
        },
        // 如果需要请求体数据，请在 body 中传入字符串化后的 JSON
        body: JSON.stringify({
          "questionId": this.questionContent.questionId,
          "submitContent": this.asrResult
        })
      };

      try {
        const response = await fetch('https://test.aigcpmer.com/api/api/exam/submit', config);
        if (!response.body) {
          throw new Error('当前浏览器不支持流式响应');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let done = false;

        this.aiResponseReasonContent = '';
        this.aiResponseResult = '';
        let partialData = '';

        while (!done) {
          const { value, done: streamDone } = await reader.read();
          done = streamDone;
          if (value) {
            // 将当前 chunk 解码
            const chunk = decoder.decode(value, { stream: true });

            // 累加到 partialData 中
            partialData += chunk;

            // 按换行符分割成多行
            const lines = partialData.split('\n');
            // 保留最后可能不完整的一行，等待后续数据拼接
            partialData = lines.pop();

            // 逐行处理
            for (const line of lines) {
              if (line.startsWith('data:')) {
                // 去掉开头 "data:" 后获得 JSON 字符串
                const jsonStr = line.slice(5).trim();
                try {
                  const obj = JSON.parse(jsonStr);
                  if (obj.contentType === 'reason') {
                    this.aiResponseReasonContent += obj.content;
                    this.$nextTick(() => {
                      const container = this.$refs.evaluationContent;
                      container.scrollTop = container.scrollHeight;
                    });
                  } else if (obj.contentType === 'answer') {
                    this.aiResponseResult += obj.content;
                    this.$nextTick(() => {
                      const container = this.$refs.evaluationContent;
                      container.scrollTop = container.scrollHeight;
                    });
                  }
                  await this.$nextTick();
                } catch (err) {
                  console.error('JSON 解析出错:', err);
                }
              }
            }
          }
        }
        console.log('数据流接收完毕');
      } catch (error) {
        console.error('请求错误：', error);
      }
    },
    demoAnswer() {

    },
    toggleDrawer() {
      this.drawerVisible = !this.drawerVisible
      this.get_exam_history()
    },
    onLogoClick() {
      this.drawerVisible = !this.drawerVisible
    },
    toggleRecording() {
      this.isRecording = !this.isRecording;
      if (!this.isRecording) {
        this.hasRecordedContent = true;
        this.showEvaluationContentIn = false; // 重置点评显示状态

        // 如果未使用点评功能，增加计数
        if (!this.showEvaluationContentIn) {
          this.recordCount++;

          // 连续5次录音后显示提示
          if (this.recordCount >= 5) {
            this.$message({
              message: `您已经第${this.recordCount}次回答本题，可以试用一下点评功能`,
              type: 'info',
              duration: 3000,
              offset: 80
            });
          }
        }
        this.stopRecording();
      } else {
        // 开始录音时，确保评价按钮可见
        this.hasRecordedContent = false; // 先设为false，等有内容时再设为true
        this.showEvaluationContentIn = false;
        this.startRecognition();
      }
    },
    showEvaluation() {
      this.showEvaluationContentIn = true
      this.aiResponseReasonContent = '';
      this.aiResponseResult = '';
      this.recordCount = 0 // 使用点评功能后重置计数
      if (this.isRecording) {
        this.isRecording = false
        this.hasRecordedContent = true
      }
      this.submitAnswer()
      console.log('endRecording');
      this.endRecording()
    },
    // 新增登录相关方法
    showLoginDialog() {
      // 先重置表单数据和验证状态，防止打开对话框时触发验证
      if (this.$refs.loginForm) {
        this.$refs.loginForm.resetFields()
        this.$refs.loginForm.clearValidate()
      }

      // 再打开对话框
      this.loginDialogVisible = true

      // 清空图形验证码输入框
      this.captcha.captchaCode = ''

      // 获取新的图形验证码
      this.$nextTick(() => {
        this.getCaptcha()
      })
    },
    handleCloseDialog() {
      this.loginDialogVisible = false
      // 重置表单数据和验证状态
      this.$refs.loginForm.resetFields()
      this.captcha.captchaCode = ''
    },
    getUserInfo() {
      const userPhone = localStorage.getItem('userPhone');
      const token = localStorage.getItem('token');
      if (userPhone && token) {
        this.isLoggedIn = true
        this.userPhone = userPhone
      }
    },
    getToken() {
      const token = localStorage.getItem('token');


      var config = {
        method: 'get',
        url: 'https://test.aigcpmer.com/api/user/detail',
        headers: { 'Authorization': `Bearer ${token}` }
      };

      axios(config)
        .then((response) => {
          // console.log(response.data);
          this.coinBalance = response.data.data.coinBalance
        })
        .catch(function (error) {
          console.log(error);
        });

    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          var config = {
            method: 'post',
            url: 'https://test.aigcpmer.com/api/auth/login',
            headers: {
              'Content-Type': 'application/json',
              'Accept': '*/*',
            },
            data: { 'phone': this.loginForm.phone, 'captcha': this.loginForm.code }
          };

          axios(config)
            .then((response) => {
              if (response.data.code === 200) {
                this.loading = false
                this.isLoggedIn = true
                this.userPhone = this.loginForm.phone
                localStorage.setItem('userPhone', this.loginForm.phone);

                localStorage.setItem('token', response.data.data.token);
                this.handleCloseDialog()
                this.$message.success('登录成功')
                this.getToken()
              } else {
                this.loading = false
                this.$message.error('手机号或验证码错误')
              }
            })
            .catch((error) => {
              this.loading = false
              this.$message.error('登录失败，请重试')
              console.log(error);
            });
        }
      })
    },
    // 发送验证码
    async sendCode() {
      if (!this.canSendCode) {
        return // 如果正在倒计时，直接返回不做任何操作
      }

      // 先验证手机号
      this.$refs.loginForm.validateField('phone', async (errorMessage) => {
        if (errorMessage) {
          return // 如果手机号验证不通过，直接返回
        }

        // 验证验证码不为空
        if (!this.captcha.captchaCode) {
          this.$message.warning('请输入图片验证码')
          return
        }

        try {
          // 直接发送短信验证码，接口内部会验证图形验证码
          var data = JSON.stringify({
            "phone": this.loginForm.phone,
            "captcha": this.captcha.captchaCode,
            "captchaId": this.captcha.captchaId,
            "macAddress": "1232"
          });

          var config = {
            method: 'post',
            url: 'https://test.aigcpmer.com/api/auth/sms',
            headers: {
              'Content-Type': 'application/json'
            },
            data: data
          };

          const response = await axios(config);
          console.log('短信验证码响应:', response.data);

          // 检查响应状态
          if (response.data.code !== 200) {
            // 处理各种错误情况
            this.$message.error(response.data.message || '发送失败，请重试');
            return;
          }

          // 短信验证码发送成功，开始倒计时
          this.canSendCode = false;
          this.countdown = 60;
          this.timer = setInterval(() => {
            if (this.countdown > 0) {
              this.countdown--;
            } else {
              this.canSendCode = true;
              clearInterval(this.timer);
              this.timer = null;
            }
          }, 1000);

          this.$message.success('验证码发送成功');
        } catch (error) {
          console.log('发送短信验证码出错:', error);
          this.$message.error('验证码发送失败，请重试');
        }
      });
    },
    // 在组件销毁前清除定时器
    beforeDestroy() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }

      // 移除点击监听器
      document.removeEventListener('click', this.handlePageClick)
    },
    // 添加点击页面空白处的处理方法
    handlePageClick(e) {
      // 判断点击的是否是输入框或按钮
      const isFormElement = e.target.closest('.el-input') ||
        e.target.closest('.el-button') ||
        e.target.closest('.el-form-item__error') ||
        e.target.closest('.send-code-text')

      // 如果不是表单元素，则清除验证信息，但不触发新的验证
      if (!isFormElement && this.$refs.loginForm) {
        this.$refs.loginForm.clearValidate()
      }
    },
    async startDemo() {

      var data = {
        "questionId": this.questionContent.questionId
      };
      const token = localStorage.getItem('token');

      var config = {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)  // 注意这里要用 body
      };
      try {
        if (!this.isDemoStarted) {
          this.isDemoStarted = true
        }
        const response = await fetch('https://test.aigcpmer.com/api/api/exam/demoAnswner', config);
        if (!response.body) {
          throw new Error('当前浏览器不支持流式响应');
        }
        const now = new Date();
        // 记录触发时间，可以选择打印日志或存入数组中显示在页面上
        console.log(`开始接收：${now.toLocaleTimeString()}`);

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let done = false;

        this.reasonContent = '';
        this.modelResult = '';
        let partialData = '';
        console.log(`开始处理${now.toLocaleTimeString()}`);
        while (!done) {
          const { value, done: streamDone } = await reader.read();
          done = streamDone;
          if (value) {
            // 将当前 chunk 解码
            const chunk = decoder.decode(value, { stream: true });

            // 累加到 partialData 中
            partialData += chunk;

            // 按换行符分割成多行
            const lines = partialData.split('\n');
            // 保留最后可能不完整的一行，等待后续数据拼接
            partialData = lines.pop();

            // 逐行处理
            for (const line of lines) {
              if (line.startsWith('data:')) {
                // 去掉开头 "data:" 后获得 JSON 字符串
                const jsonStr = line.slice(5).trim();
                try {
                  const obj = JSON.parse(jsonStr);
                  const now = new Date();
                  // 记录触发时间，可以选择打印日志或存入数组中显示在页面上
                  console.log(`开始每行处理：${now.toLocaleTimeString()} ${obj.contentType} `);

                  if (obj.contentType === 'reason') {
                    this.reasonContent += obj.content;
                    this.$nextTick(() => {
                      const container = this.$refs.sourceHint;
                      container.scrollTop = container.scrollHeight;
                    });
                  } else if (obj.contentType === 'answer') {
                    this.modelResult += obj.content;
                    this.$nextTick(() => {
                      const container = this.$refs.sourceHint;
                      container.scrollTop = container.scrollHeight;
                    });
                  }
                  console.log(`进行渲染：${now.toLocaleTimeString()}  `);

                  // await this.$nextTick();
                } catch (err) {
                  console.error('JSON 解析出错:', err);
                }
              }
            }

          }
        }
        console.log('数据流接收完毕');
      } catch (error) {
        console.error('请求错误：', error);
      }
    },
    // 添加退出登录方法
    handleLogout() {
      localStorage.removeItem('userPhone');
      localStorage.removeItem('token');
      this.isLoggedIn = false
      this.userPhone = ''
      this.$message.success('已退出登录')
    },
    // 显示充值弹窗
    showRechargeDialog() {
      if (this.isLoggedIn) {
        this.rechargeDialogVisible = true
      } else {
        this.showLoginDialog()
        this.$message.warning('请先登录后再进行充值操作')
      }
    },
    prevQuestion() {
      if (this.currentIndex > 1) {
        this.changeQuestion(-1);
      }
    },
    nextQuestion() {
      if (this.currentIndex < this.totalCount) {
        this.changeQuestion(1);
      }
    },
    clearFilters() {
      this.selectedYear = '';
      this.selectedRegion = '';
      this.selectedQuestionType = '';
      this.searchInput.year = '';
      this.searchInput.region = '';
      this.searchInput.questionType = '';
    },
    goBack() {
      // 返回面试广场
      this.$router.push('/interview-square');
    },
    showTips() {
      // 显示消息对话框
      this.messageDialogVisible = true;
    },
    toggleDemoDrawer() {
      this.demoDrawerVisible = !this.demoDrawerVisible
    },
    stopRecording() {
      console.log('触发停止录音');
      if (this.asrClient) {
        this.asrClient.stopRecognition();
        this.asrClient.disconnect();

        // 重新连接ASR客户端，以便下次使用
        this.asrClient.connect().then(() => {
          console.log('ASR客户端重新连接成功');
        }).catch(error => {
          console.error('ASR客户端重新连接失败:', error);
        });
      }
    },
    // 添加重新回答方法
    restartRecording() {
      // 重置状态
      this.asrResult = '';
      this.aiResponseReasonContent = '';
      this.aiResponseResult = '';
      this.showEvaluationContentIn = false;

      // 开始新的录音
      this.isRecording = true;
      this.hasRecordedContent = false;
      this.startRecognition();
    },
    // 添加全屏切换方法
    toggleFullscreen() {
      this.isFullscreenModalVisible = true;
    },
    closeFullscreenModal() {
      this.isFullscreenModalVisible = false;
    }
  }
}
</script>

<style scoped>
/* 外层容器：左右中三栏布局 */
.main-container {
  display: flex;
  width: 100%;
  position: relative;
  margin-left: 0px !important;
  overflow: hidden;
}

/* ===== 左侧面板 ===== */
.left-panel {
  width: 300px;
  background-color: #f5f7fa;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  height: calc(100vh - 56px);
  overflow: hidden;
}

/* ===== 右侧面板 ===== */
.demo-panel {
  width: 320px;
  background-color: #f5f7fa;
  overflow-y: auto;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
}

/* 中间内容区，flex:1 撑开 */
.main-content {
  flex: 1;
  background: #fff;
  overflow-y: auto;
  height: calc(100vh - 56px);
}

/* 左侧触发按钮 */
.drawer-trigger {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  background: #ffffff;
  z-index: 100;
}

/* 右侧触发按钮 */
.demo-trigger {
  position: fixed;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  width: 36px;
  height: 140px;
  background-color: #FFFFFF;
  border: 1px solid #1E9FFF;
  border-radius: 4px 0 0 4px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  z-index: 9999;
}

.demo-trigger-area {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #7B2CF5;
  writing-mode: vertical-lr;
  font-size: 16px;
  letter-spacing: 2px;
}

.demo-trigger-area span {
  writing-mode: vertical-lr;
  transform: rotate(180deg);
  font-weight: 500;
}

/* 过渡动画 */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease;
}

.slide-left-enter,
.slide-left-leave-to {
  transform: translateX(-100%);
}

.slide-right-enter,
.slide-right-leave-to {
  transform: translateX(100%);
}

/* 头部和导航样式 */
.header {
  padding: 0;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-container {
  margin: 0 100px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 56px;
}

.header-left, .header-right {
  display: flex;
  align-items: center;
}

.header-right {
  gap: 24px;
}

.nav-logo {
  height: 40px;
  width: auto;
}

/* 录音区域样式 */
.record-box {
  flex: 1;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  height: calc(100vh - 270px);
  display: flex;
  flex-direction: column;
  position: relative;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.record-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 录音波纹动画 */
.recording-wave {
  width: 6px;
  height: 6px;
  background-color: #f56c6c;
  border-radius: 50%;
  margin-left: 8px;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.5);
    opacity: 0.5;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.header-actions {
  display: flex;
  gap: 10px;
}

/* 录音按钮样式 */
.action-btn {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  border: none;
  transition: all 0.3s;
}

.end-record-btn {
  background-color: #f56c6c;
  color: white;
}

.end-record-btn:hover {
  background-color: #f78989;
}

.restart-btn {
  background-color: #fff;
  color: #606266;
  border: 1px solid #dcdfe6;
}

.restart-btn:hover {
  color: #409EFF;
  border-color: #c6e2ff;
  background-color: #ecf5ff;
}

.fullscreen-btn {
  background-color: #fff;
  color: #606266;
  border: 1px solid #dcdfe6;
}

.fullscreen-btn:hover {
  color: #409EFF;
  border-color: #c6e2ff;
  background-color: #ecf5ff;
}

.evaluation-btn {
  background-color: #7B2CF5;
  color: white;
}

.evaluation-btn:hover {
  background-color: #6521d4;
}

/* 录音提示区域 */
.record-hint {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #909399;
  font-size: 16px;
  overflow-y: auto;
}

/* 录音按钮区域 */
.record-button-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  margin-bottom: 20px;
}

.mic-circle {
  width: 60px;
  height: 60px;
  background: #7B2CF5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(123, 44, 245, 0.3);
}

.mic-circle img {
  width: 24px;
  height: 24px;
  filter: brightness(0) invert(1);
}

/* 录音内容显示区域 */
.recorded-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  gap: 20px;
  text-align: left;
  font-size: 14px;
  line-height: 1.8;
  justify-content: space-between;
  color: #333333;
  overflow-y: auto;
  flex: 1;
  padding: 10px;
}

/* 点评内容区域 */
.evaluation-content {
  width: 50%;
  height: 100%;
  overflow-y: auto;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
  margin-top: 10px;
}

/* 抽屉内容区域 */
.drawer-content {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #ebeef5;
}

.drawer-header .title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.drawer-header .logo {
  width: 24px;
  height: 24px;
  cursor: pointer;
}

.question-list {
  padding: 10px;
  height: 100%;
}

.question-item {
  padding: 10px;
  border-bottom: 1px solid #EBEEF5;
  cursor: pointer;
}

.question-item:hover {
  background-color: #f0f2f5;
}

.question-item.active {
  background-color: #e6f1fc;
}

/* 题目样式 */
.question-box {
  background: #fff;
  padding: 24px;
  border: 1px solid #F0F2FA;
  height: 156px;
}

.question-title {
  font-size: 18px;
  font-weight: 500;
  margin-top: 0;
  margin-bottom: 0;
  line-height: 1.4;
  max-height: 75px;
  overflow: hidden;
}

.question-subtitle {
  font-size: 14px;
  color: #909399;
  margin-left: 8px;
  font-weight: normal;
}

/* 返回按钮样式 */
.back-btn {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #909399;
  font-size: 14px;
  margin-bottom: 10px;
}

.back-btn i {
  margin-right: 4px;
}

.back-btn span {
  color: #606266;
}

.back-btn .exam-title {
  margin-left: 8px;
  font-size: 18px;
  font-weight: 500;
  color: #303133;
  width: 90px;
  height: 24px;
  display: flex;
  align-items: center;
}

/* 全屏模态框样式 */
.fullscreen-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fullscreen-content {
  width: 90%;
  height: 90%;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.fullscreen-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #EBEEF5;
}

.fullscreen-title {
  font-size: 18px;
  font-weight: 500;
  color: #303133;
}

.close-fullscreen-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #909399;
  cursor: pointer;
}

.fullscreen-body {
  flex: 1;
  overflow: hidden;
  padding: 24px;
}

.fullscreen-columns {
  display: flex;
  gap: 24px;
  height: 100%;
}

.fullscreen-answer-column,
.fullscreen-evaluation-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
  border-radius: 8px;
  overflow: hidden;
}

.column-title {
  padding: 12px 16px;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  background-color: #fff;
  border-bottom: 1px solid #EBEEF5;
}

.column-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  font-size: 14px;
  line-height: 1.8;
  color: #606266;
}

/* 示范作答内容区域 */
.demo-start-area {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.demo-text {
  font-size: 20px;
  color: #909399;
  margin-bottom: 8px;
  transition: all 0.3s;
}

.demo-hint {
  color: #909399;
  transition: all 0.3s;
}

.logo {
  width: 96px;
  height: 96px;
  margin-bottom: 16px;
  transition: all 0.3s;
}

.demo-drawer-content {
  padding: 40px 20px;
  height: calc(100% - 60px) !important;
  background-color: #f5f7fa;
  overflow: auto;
}

.source-hint {
  position: absolute;
  top: 16px;
  left: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #909399;
}

.regenerate-btn {
  padding: 0;
  font-size: 14px;
  color: #909399;
}

.demo-content {
  position: absolute;
  top: 40px;
  width: 100%;
  height: 85%;
  padding: 48px 24px 24px;
  overflow-y: auto;
}

.content-text {
  text-align: left;
  font-size: 15px;
  line-height: 1.8;
  color: #333333;
  letter-spacing: 0.5px;
}

.paragraph {
  margin-bottom: 20px;
  text-indent: 2em;
}

.model-thinking {
  color: #909399;
}

/* 通用滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-thumb {
  background: #C0C4CC;
  border-radius: 3px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

/* 媒体查询 - 适配较小屏幕 */
@media (max-width: 1200px) {
  .header-container {
    margin: 0 20px;
  }
  
  .main-container {
    flex-direction: column;
  }
  
  .left-panel,
  .demo-panel {
    width: 100%;
    height: auto;
    max-height: 300px;
  }
}
</style>
