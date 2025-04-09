<template>
  <div class="interview-page" @click="handlePageClick">
    <!-- 顶部导航 -->
    <header class="header">
      <div style="margin:0 100px; display: flex; justify-content: space-between; align-items: center;">
        <!-- 使用与灰色框相同的margin -->
        <!-- 左侧图标 -->
        <div class="header-left">
          <i class="el-icon-message" @click="showMessageDialog"></i>
          <i class="el-icon-chat-dot-square" @click="showFeedbackDialog"></i>
        </div>
        <div class="header-right">
          <div class="wallet" @click="showRechargeDialog">
            <img class="wallet-icon" src="@/assets/wallet.png" alt="wallet">
            <span class="balance">{{ isLoggedIn ? coinBalance : '----' }}</span>
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
    </header>
    <div>
      <!-- 主体内容 -->
      <main class="main-content">
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
          <h1 class="question-title">
            {{
              questionContent.questionStateEnum === 'ANSWERED'
                ? '（已作答）'
                : (questionContent.questionStateEnum === 'VIEWED' ? '（已阅读）' : '（未阅读）') }} {{ questionContent.content }}
            <span v-if="questionContent.examTime || questionContent.questionType" class="question-subtitle">
              （{{ questionContent.examTime }} {{ questionContent.questionType }}）
            </span>
          </h1>
          <div class="page-region">
            <el-button round @click="prevQuestion">上一题</el-button>
            <span>{{ currentIndex }}/{{ totalCount }}</span>
            <el-button round @click="nextQuestion">下一题</el-button>
          </div>
        </div>

        <div class="content-wrapper">
          <!-- 左侧答题区域 -->
          <div class="answer-box">
            <div class="tab-group">
              <span class="tab" :class="{ active: activeTab === 'demo' }" @click="activeTab = 'demo'">示范作答</span>
              <!-- <span class="tab" :class="{ active: activeTab === 'reference' }"
                @click="activeTab = 'reference'">参考答案</span> -->
            </div>

            <div v-if="activeTab === 'demo'" class="demo-area">
              <template v-if="!isDemoStarted">
                <div class="demo-start-area" @click="startDemo">
                  <img class="logo" src="@/assets/deepseek-color.png" alt="Logo">
                  <div class="demo-text">deepseek</div>
                  <div class="demo-hint">点击开始示范</div>
                </div>
              </template>
              <template v-else>
                <!-- 添加来源提示 -->
                <div class="source-hint">
                  以下内容均来自deepseek-r1生成
                  <el-button type="text" class="regenerate-btn" @click.stop="startDemo">
                    <i class="el-icon-refresh" />
                    重新生成
                  </el-button>
                  <el-button type="text" @click="toggleAn">
                    <!-- 根据 isLogoVisible 变量切换内置图标 -->
                    <i :class="isAnVisible ? 'el-icon-s-fold' : 'el-icon-s-unfold'" />
                    {{ isAnVisible ? '隐藏' : '显示' }}
                  </el-button>
                </div>

                <!-- 示范内容 -->
                <div class="demo-content" ref="sourceHint" v-if="isAnVisible">
                  <div class="content-text">
                    <p class="paragraph model-thinking" v-html="markdownReasonContent"></p>
                    <p class="paragraph" v-html="markdownModelResult"></p>
                  </div>
                </div>
              </template>
            </div>

            <div v-else class="demo-area">
              <div class="reference-content">

                <div class="content-text">


                  <p class="paragraph">{{ questionContent.answer }}</p>


                </div>
                <!-- 参考答案的具体内容 -->
              </div>
            </div>
          </div>

          <!-- 右侧录音区域 -->
          <div class="record-box">
            <div class="record-hint">
              <template v-if="isRecording || hasRecordedContent">
                <div id="status"></div>
                <div class="recorded-content" ref="recordContent">
                  {{ asrResult }}
                  <!-- 点评框 -->
                  <div v-if="!showEvaluationContent" class="evaluation-box" @click="showEvaluation">
                    <img class="eval-logo" src="@/assets/deepseek-color.png" alt="Logo">
                    <span>作答点评</span>
                  </div>
                  <!-- 点评内容 -->
                  <div v-else class="evaluation-content" ref="evaluationContent">

                    点评: <p class="paragraph model-thinking" v-html="markdownReason"></p>
                    <p class="paragraph" v-html="markdownResult"></p>
                  </div>
                </div>
              </template>
              <template v-else>
                点击录音按钮，开始答题
              </template>
            </div>
            <div class="record-button-wrapper">
              <div class="audio-recorder">
                <div class="mic-circle" :class="{ 'recording-btn': isRecording }" @click="toggleRecording">
                  <img v-if="!isRecording" src="@/assets/microphone.png" alt="microphone">
                  <div v-else class="recording-square"></div>
                </div>
                <div class="wave-line">
                  <div class="dotted-line" :class="{ 'recording': isRecording }" />
                </div>
                <!-- <el-button @click="submitAnswer()">提交答案</el-button> -->
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- 替换浮动按钮为侧拉栏 -->
      <el-drawer title="答题列表" :visible.sync="drawerVisible" direction="rtl" size="30%" style="overflow-y: auto;">

        <div class="drawer-content">
          <div class="question-list">
            <div v-for="(item, i) in orderedHistory" :key="item.answerId" @click="get_exam_detail(item.questionId, i)"
              :class="['question-item', { active: currentQuestionIndex === i }]">
              <span>
                {{ i + 1 }}. {{
                  item.state === 'ANSWERED'
                    ? '（已作答）'
                    : (item.state === 'VIEWED' ? '（已阅读）' : '（未阅读）') }} {{ item.questionContent }} （{{ item.examTime }} {{
                  item.questionType }}）
              </span>
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
            <img src="@/assets/qr_code.jpg" alt="QR Code">
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
    <el-dialog :visible.sync="loginDialogVisible" class="dialog-container" width="560px" :show-close="false"
      :before-close="handleCloseDialog" :close-on-click-modal="false" center>
      <div class="login-container">
        <!-- LOGO区域 -->
        <div class="login-logo">
          LOGO
        </div>

        <el-form ref="loginForm" :model="loginForm" :rules="loginRules" label-width="0">
          <!-- 手机号输入框: 480px x 44px -->
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
            <div class="code-input-group">
              <el-input v-model="loginForm.code" placeholder="验证码" />
              <el-button type="primary" class="send-code-btn" :disabled="!canSendCode" @click="sendCode">
                {{ canSendCode ? '发送短信' : `${countdown}秒后重新发送` }}
              </el-button>
            </div>
          </el-form-item>

          <!-- 注册/登录按钮: 480px x 44px -->
          <el-form-item class="form-item">
            <el-button type="primary" class="register-login-btn" :loading="loading" @click="handleLogin">
              注册/登录
            </el-button>
          </el-form-item>

          <!-- 取消按钮: 480px x 44px -->
          <el-form-item class="form-item">
            <el-button class="cancel-btn" @click="handleCloseDialog">取消</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>

    <!-- 添加消息对话框 -->
    <el-dialog :visible.sync="messageDialogVisible" :show-close="false" class="welcome-dialog" center>
      <div class="welcome-content">
        <h1 class="welcome-title">欢迎使用结构化面试陪练助手！</h1>

        <p class="user-greeting">亲爱的考生:</p>

        <p class="intro-text">感谢您对我们产品的信任！ 在这里，我们将为您简单介绍当前工具的使用场景及特色功能:</p>

        <p class="feature-text">结构化面试是当前公务员/事业编考试中，最常见的面试手段， 它具备......的特点， 考试形式是......，
          存在......等评分维度；根据过往经验，我们将结构化面试分为了5个维度，分别是:</p>

        <p class="dots">......</p>

        <p class="feature-text">在结构化面试陪练助手中，基于国内顶尖的人工智能基础设施，我们为您准备了以下的特色功能:</p>

        <p class="dots">......</p>

        <p class="more-info">访问xx网站以获取更多信息: <a href="http://www.example.com" class="link">www.example.com</a></p>

        <div class="signature">
          <p>您的职业伙伴</p>
          <p>aigcpm</p>
          <p>2025年4月19日</p>
        </div>

        <div class="btn-container">
          <button class="confirm-btn" @click="messageDialogVisible = false">好的，我知道了</button>
        </div>
      </div>
    </el-dialog>

    <!-- 添加反馈对话框 -->
    <el-dialog :visible.sync="feedbackDialogVisible" :show-close="false" class="feedback-dialog" center>
      <div class="feedback-content">
        <div class="close-btn" @click="feedbackDialogVisible = false">
          <i class="el-icon-close"></i>
        </div>

        <h2>陪练助手对您的面试有帮助吗?</h2>
        <div class="star-rating">
          <i class="el-icon-star-off" v-for="i in 5" :key="'help' + i" @click="setHelpRating(i)"
            :class="{ 'el-icon-star-on': helpRating >= i }"></i>
        </div>

        <h2>陪练助手的使用足够方便吗?</h2>
        <div class="star-rating">
          <i class="el-icon-star-off" v-for="i in 5" :key="'use' + i" @click="setUseRating(i)"
            :class="{ 'el-icon-star-on': useRating >= i }"></i>
        </div>

        <h2>如果您还有更多想说的，请告诉我:</h2>
        <el-input type="textarea" :rows="6" v-model="feedbackComment" placeholder="请输入您的反馈意见..."></el-input>

        <div class="auto-show-option">
          <el-checkbox v-model="notAutoShow">不再自动弹出</el-checkbox>
        </div>

        <div class="feedback-btns">
          <el-button class="cancel-btn" @click="feedbackDialogVisible = false">不了，谢谢</el-button>
          <el-button type="primary" class="submit-btn" @click="submitFeedback">提交反馈</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios';
import ASRClient from '@/utils/asr'
import AudioPlayer from '@/utils/tts'
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
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: validatePhone, trigger: 'blur' }
        ],
        code: [
          { required: true, message: '请输入验证码', trigger: 'blur' },
          { validator: validateCode, trigger: 'blur' }
        ],
      },

      activeTab: 'demo',
      countdown: 60,
      timer: null,
      canSendCode: true,
      hasRecordedContent: false,
      showEvaluationContent: false,
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
      serviceTypeEnum: '',

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
      notAutoShow: false
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

    submitFeedback() {
      console.log('feedback');
      const token = localStorage.getItem('token');
      var data = JSON.stringify({
        "helpfulnessRating": this.helpRating,
        "convenienceRating": this.useRating,
        "additionalComments": this.feedbackComment,
        "noPopup": true
      });

      var config = {
        method: 'post',
        url: 'https://test.aigcpmer.com/api/userFeedback/create',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        data: data
      };

      axios(config)
        .then((response) => {
          // 这里可以添加提交反馈的逻辑
          this.$message.success('感谢您的反馈！');
          this.feedbackDialogVisible = false;
          // 重置表单数据
          this.helpRating = 0;
          this.useRating = 0;
          this.feedbackComment = '';
        })
        .catch((error) => {
          this.feedbackDialogVisible = false;
          this.$message.success('网络故障，请重新提交');
        });
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
          const data = response?.data?.data;
          if (data?.questionStateEnum == "ANSWERED") {
            this.dealisANSWERED(data)
          } else {
            this.dealisNotANSWERED(response)
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
    dealisANSWERED(data) {
      // 更新题目内容对象
      this.questionContent = {
        questionId: data.questionId,
        content: data.content,
        answer: data.answer,
        questionStateEnum: data.questionStateEnum,
        totalCount: data.totalCount || this.totalCount
      };
      this.questionContent.questionId = data.questionId
      // 更新页面显示的题目内容

      // 更新其他状态
      // this.selectedYear = data.examTime;
      // this.selectedRegion = data.region;
      // this.selectedQuestionType = data.questionType;
      this.modelResult = data.modelResult;
      this.hasRecordedContent = true;
      this.asrResult = data.userContent;
      this.aiResponseReasonContent = data.reasonContent;
      this.aiResponseResult = data.modelResult
      this.currentIndex = data.currentIndex
      // 重置相关状态
      this.isDemoStarted = false;
      this.showEvaluationContent = true;// 更新题目内容对象
      this.questionContent = {
        questionId: data.questionId,
        content: data.content,
        answer: data.answer,
        questionStateEnum: data.questionStateEnum,
        totalCount: data.totalCount || this.totalCount
      };
      this.questionContent.questionId = data.questionId
      // 更新页面显示的题目内容

      // 更新其他状态
      // this.selectedYear = data.examTime;
      // this.selectedRegion = data.region;
      // this.selectedQuestionType = data.questionType;
      this.modelResult = data.modelResult;
      this.hasRecordedContent = true;
      this.asrResult = data.userContent;
      this.aiResponseReasonContent = data.reasonContent;
      this.aiResponseResult = data.modelResult
      this.currentIndex = data.currentIndex
      // 重置相关状态
      this.isDemoStarted = false;
      this.showEvaluationContent = true;
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
      this.asrClient.startRecognition();
    },
    // 新增一个方法来处理停止按钮的点击
    stopRecognition() {
      console.log('触发停止录音');
      if (this.asrClient) {
        this.asrClient.stopRecognition();
        this.asrClient.disconnect();
      }
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
    dealisNotANSWERED(response) {
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
        this.showEvaluationContent = false;
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
          questionType: this.selectedQuestionType || 'GOV_EXAM',
          pageNum: 1,
          pageSize: 1
        },
        keyword: '',
        serviceTypeEnum: "GOV_EXAM"
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

          const data = response?.data?.data;
          if (data?.questionStateEnum == "ANSWERED") {
            this.dealisANSWERED(data)
          } else {
            this.dealisNotANSWERED(response)
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
    toggleRecording() {
      this.isRecording = !this.isRecording
      if (!this.isRecording) {
        this.hasRecordedContent = true
        this.showEvaluationContent = false // 重置点评显示状态

        // 如果未使用点评功能，增加计数
        if (!this.showEvaluationContent) {
          this.recordCount++

          // 连续5次录音后显示提示
          if (this.recordCount >= 5) {
            this.$message({
              message: `您已经第${this.recordCount}次回答本题，可以试用一下点评功能`,
              type: 'info',
              duration: 3000,
              offset: 80
            })
          }
        }
        this.stopRecognition()
      } else {
        // 开始录音时，确保评价按钮可见
        this.hasRecordedContent = true
        this.showEvaluationContent = false
        this.startRecognition()
      }
    },
    showEvaluation() {
      this.showEvaluationContent = true
      this.aiResponseReasonContent = '';
      this.aiResponseResult = '';
      this.recordCount = 0 // 使用点评功能后重置计数
      if (this.isRecording) {
        this.isRecording = false
        this.hasRecordedContent = true
      }
      this.submitAnswer()
      console.log('stopRecognition');
      this.stopRecognition()
    },
    // 新增登录相关方法
    showLoginDialog() {
      this.loginDialogVisible = true
      // 重置表单数据和验证状态
      this.$nextTick(() => {
        this.$refs.loginForm.resetFields()
        // 清空图形验证码输入框
        this.captcha.captchaCode = ''
        // 获取新的图形验证码
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
            .catch(function (error) {
              console.log(error);
            });

        }
      })
    },
    // 发送验证码
    async sendCode() {
      // 先验证手机号
      this.$refs.loginForm.validateField('phone', async (errorMessage) => {
        if (errorMessage) {
          return // 如果手机号验证不通过，直接返回
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
  }
}
</script>

<style scoped>
.captcha-verify {
  height: 40px;
  margin-left: 0;
  font-size: 50px;
}

.captcha-verify .captcha-input {
  width: 60%;

}

.captcha-verify .captcha-image {
  width: 30%;
  margin-left: 10px;
  vertical-align: middle;
}

.interview-page {
  min-height: 100vh;
  background-color: #fff;
  position: relative;
}

.header {
  padding: 16px 0;
  background: #fff;
}

.header-right {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
  color: #606266;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-left .el-icon-message,
.header-left .el-icon-chat-dot-square {
  font-size: 20px;
  color: #909399;
  cursor: pointer;
}

.header-left .el-icon-message:hover,
.header-left .el-icon-chat-dot-square:hover {
  color: #409EFF;
}

.wallet {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
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

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.top-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.time-region {
  display: flex;
  gap: 16px;
}

.label-group {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  /* 确保高度统一 */
}

.label {
  font-size: 14px;
  color: #909399;
}

.value {
  padding: 4px 12px;
  background: #E4E7ED;
  border-radius: 4px;
  font-size: 14px;
  color: #606266;
  height: 28px;
  line-height: 20px;
  display: inline-block;
}

.page-region {
  display: flex;
  align-items: center;
  justify-content: end;
  gap: 16px;
}

.page-region span {
  font-size: 14px;
  color: #606266;
}

/* 添加翻页按钮的统一样式 */
.page-region .el-button {
  background: #fff;
  border: 1px solid #DCDFE6;
  color: #606266;
}

.page-region .el-button:hover {
  color: #409EFF;
  border-color: #c6e2ff;
  background-color: #ecf5ff;
}

.page-region .el-button:active {
  color: #409EFF;
  border-color: #409EFF;
  background-color: #ecf5ff;
}

.question-box {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
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
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.record-box {
  width: 580px;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
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
  transition: all 0.3s ease;
}

.tab.active {
  color: #606266;
  font-weight: 500;
  background: #f5f7fa;
}

.tab:hover {
  color: #606266;
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

.demo-start-area:hover {
  background: rgba(0, 0, 0, 0.02);
}

.demo-start-area:hover .demo-text,
.demo-start-area:hover .demo-hint {
  color: #409EFF;
}

.demo-start-area:active {
  background: rgba(0, 0, 0, 0.05);
}

.logo {
  width: 96px;
  height: 96px;
  margin-bottom: 16px;
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
  background: #409EFF;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.recording-btn {
  background: transparent;
  border: 4px solid #FF4D4F;
  box-sizing: border-box;
}

.recording-square {
  width: 14px;
  height: 14px;
  background-color: #FF4D4F;
  border-radius: 0;
}

.mic-circle:hover {
  background: #66b1ff;
}

.recording-btn:hover {
  background: transparent;
  /* 录音状态下保持透明背景 */
  border-color: #ff7875;
  /* hover时边框变浅红色 */
}

.recording-btn:hover .recording-square {
  background-color: #ff7875;
  /* hover时方块也变成浅红色 */
}

.mic-circle img {
  width: 20px;
  height: 20px;
  filter: brightness(0) invert(1);
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

.dotted-line.recording {
  border-bottom: 2px solid #000000;
  animation: wave 1.5s infinite ease-in-out;
}

@keyframes wave {
  0% {
    transform: scaleY(1);
  }

  50% {
    transform: scaleY(2);
  }

  100% {
    transform: scaleY(1);
  }
}

.drawer-trigger {
  position: absolute;
  right: 0;
  top: 60px;
  height: calc(100% - 60px);
  z-index: 100;
}

.trigger-area {
  width: 100px;
  /* 增加宽度 */
  height: 100%;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  /* 水平居中 */
  justify-content: center;
  /* 垂直居中 */
  padding-bottom: 120px;
  cursor: pointer;
  color: #606266;
}

.trigger-area i {
  font-size: 24px;
  margin-bottom: 8px;
}

.trigger-area span {
  writing-mode: vertical-lr;
  /* 文字垂直排列 */
  letter-spacing: 4px;
  /* 增加文字间距 */
}

.drawer-content {
  padding: 40PX 20px;
  height: calc(100% - 115px) !important;
  background-color: #f5f7fa;
  overflow: auto;
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

.dialog-container {
  .el-dialog__header {
    padding: 0;
    padding-bottom: 0;
  }

  .el-dialog {
    width: 560px !important;
    height: 540px !important;
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
        margin-bottom: 24px !important;
        /* 普通表单项的底部间距 */
      }

      /* 特别调整验证码输入框（第二个表单项）的间距 */
      .form-item:nth-child(2) {
        margin-bottom: 32px !important;
        /* 增加或减少这个值来调整验证码输入框的位置 */
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
    padding-right: 100px !important;
    /* 为错误提示预留空间 */
  }
}

.reference-content {
  width: 100%;
  height: 100%;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.answer-text {
  background: #F5F5F5;
  padding: 16px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
}

.evaluation-box {
  background: #F5F5F5;
  padding: 16px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.evaluation-logo {
  font-size: 16px;
  color: #666;
}

.evaluation-text {
  font-size: 14px;
  color: #999;
}

.audio-player {
  background: #F5F5F5;
  padding: 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.mic-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #DCDFE6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
}

.audio-line {
  flex: 1;
  height: 2px;
  background: #DCDFE6;
  position: relative;
}

.audio-line::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(90deg,
      #DCDFE6,
      #DCDFE6 4px,
      transparent 4px,
      transparent 8px);
}

.recorded-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  text-align: left;
  font-size: 14px;
  line-height: 1.8;
  color: #333333;
  overflow-y: scroll;
}

.recorded-content::-webkit-scrollbar {
  width: 6px;
  /* 调整宽度 */
}

/* 滚动槽 */
.recorded-content::-webkit-scrollbar-track {
  background: transparent;
  /* 背景透明 */
}

/* 滚动条滑块 */
.recorded-content::-webkit-scrollbar-thumb {
  background: #C0C4CC;
  /* 颜色可以根据需要调整 */
  border-radius: 3px;
  /* 圆角效果 */
}

.evaluation-box {
  width: 100%;
  height: 80px;
  background: #FFFFFF;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: auto;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.evaluation-box:hover {
  background: #F5F7FA;
}

.eval-logo {
  width: 32px;
  height: 32px;
  margin-bottom: 8px;
}

.evaluation-content {
  margin-top: auto;
  /* padding: 16px; */
  /* background: #FFFFFF; */
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.8;
  color: #333333;
  overflow-y: auto;
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

.regenerate-btn:hover {
  color: #409EFF;
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

.section {
  margin: 24px 0;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #262626;
  margin-bottom: 12px;
}

.section-content {
  text-indent: 2em;
  color: #404040;
}

/* 优化滚动条样式 */
.demo-content::-webkit-scrollbar {
  width: 6px;
}

.demo-content::-webkit-scrollbar-thumb {
  background: #C0C4CC;
  border-radius: 3px;
}

.demo-content::-webkit-scrollbar-track {
  background: transparent;
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

/* 修改select的宽度样式 */
.label-group .el-select {
  width: 80px;
  /* 减小时间选择框的宽度 */
}

/* 地区select单独设置宽度 */
.label-group:nth-child(2) .el-select {
  width: 100px;
}

/* select单独设置宽度 */
.label-group:nth-child(3) .el-select {
  width: 100px;
}

/* 恢复value的灰色背景样式 */
.value {
  padding: 4px 12px;
  background: #E4E7ED;
  border-radius: 4px;
  font-size: 14px;
  color: #606266;
  height: 28px;
  line-height: 20px;
  display: inline-block;
}

.model-thinking {
  color: #909399;
  /* 使用浅灰色 */
}

/* 充值弹窗样式 */
.recharge-dialog {
  :deep(.el-dialog) {
    border-radius: 8px;
    overflow: hidden;
    padding: 0;
    max-width: 560px;
    margin-top: 15vh !important;
  }

  :deep(.el-dialog__body) {
    padding: 0;
  }

  :deep(.el-dialog__header) {
    display: none !important;
    padding: 0 !important;
    padding-bottom: 0 !important;
    margin: 0 !important;
    height: 0 !important;
    min-height: 0 !important;
    line-height: 0 !important;
    border: none !important;
    overflow: hidden !important;
    visibility: hidden !important;
    opacity: 0 !important;
    position: absolute !important;
    z-index: -1 !important;
  }
}

.recharge-container {
  position: relative;
  background-color: #fff;
}

.recharge-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #EBEEF5;
  gap: 24px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #606266;
}

.user-info .el-icon-user {
  font-size: 16px;
}

.wallet-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #606266;
}

.wallet-info img {
  width: 16px;
  height: 16px;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  cursor: pointer;
  font-size: 24px;
  color: #909399;
}

.close-btn:hover {
  color: #606266;
}

.recharge-options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 24px;
}

.recharge-option {
  background-color: #fff;
  border: 1px solid #EBEEF5;
  border-radius: 4px;
  padding: 16px 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.recharge-option:first-child {
  background-color: #fff;
}

.recharge-option.selected {
  border-color: #409EFF;
  background-color: #f5f5f5;
}

.original-price {
  color: #909399;
  text-decoration: line-through;
  font-size: 14px;
  margin-bottom: 8px;
}

.discount-price {
  color: #303133;
  font-size: 20px;
  font-weight: 500;
  margin-bottom: 8px;
}

.points {
  color: #606266;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.points .el-icon-info {
  font-size: 12px;
  color: #909399;
}

.payment-section {
  display: flex;
  padding: 0;
  background-color: #f5f5f5;
  border-radius: 4px;
  overflow: hidden;
  margin: 0 24px 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.qr-code {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
  padding: 20px;
  height: 240px;
  border-right: 1px dashed #ccc;
}

.qr-code img {
  width: 140px;
  height: 140px;
  object-fit: contain;
}

.payment-right-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  padding: 20px;
  justify-content: space-between;
}

.payment-options {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 0 20px;
  gap: 15px;
}

.payment-option {
  margin-bottom: 0;
  border-radius: 30px;
  overflow: hidden;
  border: 1px solid #dcdfe6;
  background-color: #fff;
  transition: all 0.3s;
  height: 44px;
}

.payment-option.selected {
  border-color: #409EFF;
  background-color: #fff;
}

.radio-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0 20px;
  width: 100%;
  height: 100%;
}

.radio-label input[type="radio"] {
  display: none;
}

.radio-custom {
  width: 18px;
  height: 18px;
  border: 1px solid #dcdfe6;
  border-radius: 50%;
  margin-right: 10px;
  position: relative;
  flex-shrink: 0;
}

.radio-custom::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #409EFF;
  opacity: 0;
  transition: opacity 0.2s;
}

.radio-label input[type="radio"]:checked+.radio-custom::after {
  opacity: 1;
}

.payment-option.selected .radio-custom {
  border-color: #409EFF;
}

.payment-option img {
  width: 20px;
  height: 20px;
  margin-right: 8px;
  flex-shrink: 0;
}

.payment-option span {
  font-size: 14px;
  color: #606266;
}

.payment-notes {
  padding: 0;
  color: #909399;
  font-size: 12px;
  line-height: 1.6;
  background-color: #f5f5f5;
}

.payment-notes p {
  margin: 4px 0;
  display: flex;
  align-items: flex-start;
  line-height: 1.8;
}

.agreement {
  color: #409EFF;
  cursor: pointer;
  text-decoration: underline;
}

/* 欢迎对话框样式 */
.welcome-dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.welcome-dialog>>>.el-dialog {
  width: 1600px !important;
  height: 800px !important;
  margin: 0 !important;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  padding: 0;
}

.welcome-dialog>>>.el-dialog__header,
.welcome-dialog>>>.el-dialog__footer {
  display: none;
}

.welcome-dialog>>>.el-dialog__body {
  padding: 0;
  margin: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.welcome-content {
  width: 100%;
  height: 100%;
  padding: 40px 100px;
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
}

.welcome-title {
  font-size: 32px;
  font-weight: bold;
  text-align: center;
  margin-top: 10px;
  margin-bottom: 40px;
}

.user-greeting {
  font-size: 18px;
  margin-left: 40px;
  margin-bottom: 30px;
  font-weight: normal;
}

.intro-text,
.feature-text {
  font-size: 16px;
  line-height: 1.8;
  margin-bottom: 20px;
  text-indent: 2em;
  margin-left: 0;
  margin-right: 0;
}

.dots {
  font-size: 22px;
  text-align: center;
  letter-spacing: 10px;
  margin: 20px 0;
}

.more-info {
  font-size: 16px;
  margin-bottom: 20px;
  margin-top: 20px;
  text-indent: 2em;
}

.link {
  color: #409EFF;
  text-decoration: none;
}

.signature {
  text-align: right;
  margin-top: 40px;
  line-height: 1.6;
  margin-right: 0;
}

.signature p {
  margin: 5px 0;
}

.btn-container {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: auto;
  margin-bottom: 40px;
}

.confirm-btn {
  width: 300px;
  height: 46px;
  background-color: #3384ff;
  color: white;
  border: none;
  border-radius: 23px;
  font-size: 16px;
  cursor: pointer;
}

.confirm-btn:hover {
  opacity: 0.9;
}

/* 反馈对话框样式 */
.feedback-dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.feedback-dialog>>>.el-dialog {
  width: 620px !important;
  height: 730px !important;
  margin: 0 !important;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  padding: 0;
}

.feedback-dialog>>>.el-dialog__header,
.feedback-dialog>>>.el-dialog__footer {
  display: none;
}

.feedback-dialog>>>.el-dialog__body {
  padding: 0;
  margin: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.feedback-content {
  width: 100%;
  height: 100%;
  padding: 40px;
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.feedback-content .close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  cursor: pointer;
  font-size: 24px;
  color: #909399;
}

.feedback-content .close-btn:hover {
  color: #606266;
}

.feedback-content h2 {
  font-size: 18px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 10px;
  text-align: center;
}

.star-rating {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 30px;
}

.star-rating i {
  font-size: 40px;
  color: #DCDFE6;
  cursor: pointer;
}

.star-rating i.el-icon-star-on {
  color: #F7BA2A;
}

.auto-show-option {
  margin-top: 20px;
  margin-bottom: 10px;
}

.feedback-btns {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: auto;
}

.feedback-btns .cancel-btn,
.feedback-btns .submit-btn {
  width: 160px;
  height: 46px;
  border-radius: 23px;
  font-size: 16px;
}

.feedback-btns .submit-btn {
  background: #3384ff;
}

.feedback-btns .submit-btn:hover {
  opacity: 0.9;
}
</style>
