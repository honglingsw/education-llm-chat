<template>
  <div class="interview-page" @click="handlePageClick">
    <!-- 顶部导航 -->
    <header class="header">
      <div style="margin:0 100px;"> <!-- 使用与灰色框相同的margin -->
        <div class="header-right">
          <div class="wallet" @click="showRechargeDialog">
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
    </header>
    <div style="margin:10px 100px;background-color: rgba(0, 0, 0, 0.05);">
      <!-- 主体内容 -->
      <main class="main-content">
        <!-- 翻页区域 -->
        <div class="pagination top-pagination">
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
            <el-button @click="searchQuestion">查询</el-button>
          </div>
          <div class="page-region">
            <el-button round @click="changeQuestion(--questionCount)">上一题</el-button>
            <span>1/22</span>
            <el-button round @click="changeQuestion(++questionCount)">下一题</el-button>
          </div>
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
              <span class="tab" :class="{ active: activeTab === 'demo' }" @click="activeTab = 'demo'">示范作答</span>
              <span class="tab" :class="{ active: activeTab === 'reference' }"
                @click="activeTab = 'reference'">参考答案</span>
            </div>

            <div v-if="activeTab === 'demo'" class="demo-area" @click="startDemo">
              <template v-if="!isDemoStarted">
                <div class="demo-start-area">
                  <img class="logo" src="@/assets/deepseek-color.png" alt="Logo">
                  <div class="demo-text">deepseek</div>
                  <div class="demo-hint">点击开始示范</div>
                </div>
              </template>
              <template v-else>
                <!-- 添加来源提示 -->
                <div class="source-hint">
                  以下内容均来自deepseek-r1生成
                  <el-button type="text" class="regenerate-btn">
                    <i class="el-icon-refresh" />
                    重新生成
                  </el-button>
                </div>

                <!-- 示范内容 -->
                <div class="demo-content">
                  <div class="content-text">
                    <p class="paragraph model-thinking">
                      最后，检查是否有遗漏的关键点，比如劳动教育在培养创新精神、实践能力方面的作用，或者如何平衡劳动教育与其他学科的关系，确保全面发展的教育目标。</p>

                    <p class="paragraph">作为教师招聘考试的考生，我认为劳动教育课成为社会关注的热点，体现了新时代教育理念的深刻转型，具有重要的现实意义和育人价值。以下是我的具体理解：</p>

                    <div class="section">
                      <h3 class="section-title">一、劳动教育是"五育融合"的必然要求</h3>
                      <p class="section-content">
                        劳动教育被纳入国家课程体系，与德育、智育、体育、美育共同构成"五育并举"的育人框架，这不仅是教育政策的调整，更是对"唯分数论"单一评价体系的纠偏。例如...</p>
                    </div>
                  </div>
                </div>
              </template>
            </div>

            <div v-else class="demo-area">
              <div class="reference-content">
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
                  <!-- <div v-if="!showEvaluationContent" class="evaluation-box" @click="showEvaluation">
                    <img class="eval-logo" src="@/assets/deepseek-color.png" alt="Logo">
                    <span>作答点评</span>
                  </div> -->
                  <!-- 点评内容 -->
                  <!-- <div v-else class="evaluation-content">
                    这是一个很好的回答，结构完整，论述有力。从劳动教育的本质出发，阐述了其重要性和意义。建议可以再补充一些具体的实施建议。
                  </div> -->
                </div>
              </template>
              <template v-else>
                点击录音按钮，开始答题
              </template>
            </div>
            <div class="record-button-wrapper">
              <div class="audio-recorder">
                <div class="mic-circle" :class="{ 'recording-btn': isRecording }" @click="toggleRecording">
                  <img v-if="!isRecording" src="@/assets/microphone.png" alt="microphone" ref="asrRecording">
                  <div v-else class="recording-square" ref="stopBtn" />
                </div>
                <div class="wave-line">
                  <div class="dotted-line" :class="{ 'recording': isRecording }" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- 替换浮动按钮为侧拉栏 -->
      <el-drawer title="答题列表" :visible.sync="drawerVisible" direction="rtl" size="30%">
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

    <!-- 添加充值弹窗 -->
    <el-dialog :visible.sync="rechargeDialogVisible" class="recharge-dialog" width="560px" :show-close="false" center>
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

          <!-- 支付选项 -->
          <div class="payment-selection">
            <div class="payment-option" :class="{ 'selected': paymentMethod === 'wechat' }"
              @click="paymentMethod = 'wechat'">
              <div class="radio-circle">
                <div v-if="paymentMethod === 'wechat'" class="radio-inner" />
              </div>
              <img src="@/assets/wechat_pay.png" alt="WeChat Pay">
              <span>微信支付</span>
            </div>
            <div class="payment-option" :class="{ 'selected': paymentMethod === 'alipay' }"
              @click="paymentMethod = 'alipay'">
              <div class="radio-circle">
                <div v-if="paymentMethod === 'alipay'" class="radio-inner" />
              </div>
              <img src="@/assets/alipay.png" alt="Alipay">
              <span>支付宝支付</span>
            </div>
          </div>
        </div>

        <!-- 说明文字 -->
        <div class="payment-notes">
          <p>• 每次答题点评消耗积分，每次智能示范消耗积分；点数不足时，无法使用对应服务</p>
          <p>• 完成支付即视为同意<span class="agreement">《用户协议》</span></p>
        </div>
      </div>
    </el-dialog>

    <!-- 添加登录弹框 -->
    <el-dialog :visible.sync="loginDialogVisible" class="dialog-container" width="560px" :show-close="false"
      :before-close="handleCloseDialog" center>
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
  </div>
</template>

<script>
import axios from 'axios';
import ASRClient from '@/utils/asr'
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
      } else if (value !== '1234') {
        callback(new Error('验证码错误！'))
      } else {
        callback()
      }
    }

    return {
      drawerVisible: false,
      isRecording: false,
      loginDialogVisible: false,
      loading: false,
      loginForm: {
        phone: '',
        code: ''
      },
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

      selectedQuestionType: '',
      selectedYear: '2017',
      selectedRegion: '湖北',

      years: ['2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016'],
      regions: ['北京', '上海', '广东', '湖北', '江苏', '浙江', '四川', '山东'],
      questionTypes: [],

      questionContent: {
        questionId: '',
        content: '',
        answer: '',
        totalCount: '',
        currentIndex: ''
      },
      questionIdList: [],
      questionCount: 0,

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

      asrResult: ''
    }
  },

  computed: {
    maskPhoneNumber() {
      if (!this.userPhone) return ''
      return this.userPhone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
    }
  },
  mounted() {
    this.searchInput.examType = this.$route.query.type
    var config = {
      method: 'get',
      url: '/api/exam/tags',
      headers: {}
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
    getCaptcha() {
      var config = {
        method: 'get',
        url: '/auth/captcha',
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
      const asrClient = new ASRClient('ws://1.13.0.140:8080/asr/ws');

      // 设置回调函数
      asrClient.setCallbacks({
        onReady: () => {
          // statusDiv.textContent = '准备就绪，可以开始识别';
          this.$refs.asrRecording.disabled = false; // 启用开始按钮
        },
        onStart: () => {
          statusDiv.textContent = '正在识别...';
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
          statusDiv.textContent = '识别完成';
          this.$refs.asrRecording.disabled = false;
          this.$refs.asrRecording.disabled = true;
        },
        onError: (error) => {
          statusDiv.textContent = `错误: ${error}`;
          this.$refs.asrRecording.disabled = false;
          this.$refs.asrRecording.disabled = true;
        }
      });

      // 连接到WebSocket服务器
      asrClient.connect().then(() => {
        // 连接成功后主动启用开始按钮
        this.$refs.asrRecording.disabled = false;
        statusDiv.textContent = '已连接到服务器，可以开始识别';
      }).catch(error => {
        statusDiv.textContent = `连接错误: ${error.message}`;
      });

      // 开始按钮
      this.$refs.asrRecording.addEventListener('click', () => {
        this.asrResult = '';
        // this.$refs.asrRecording.disabled = true;
        // this.$refs.stopBtn.disabled = false;
        asrClient.startRecognition();
      });

      // 停止按钮
      this.$refs.stopBtn.addEventListener('click', () => {
        // this.$refs.asrRecording.disabled = false;
        // this.$refs.stopBtn.disabled = true;
        asrClient.stopRecognition();
      });

      // 页面卸载时断开连接
      window.addEventListener('beforeunload', () => {
        asrClient.disconnect();
      });
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
    changeQuestion(questionCount) {
      var data = JSON.stringify({
        "currentId": this.questionContent.questionId || 0,
        "tags": {
          // "examType": this.searchInput.examType || '',
          // "examTime": this.searchInput.year || '',
          // "region": this.searchInput.region || '',
          // "questionType": this.searchInput.questionType || '',
          // "pageNum": questionCount >= this.questionIdList.length ? questionCount + 1 : this.questionIdList.length,
          // "pageSize": 1
          "examType": '',
          "examTime": '',
          "region": '',
          "questionType": '',
          "pageNum": 1,
          "pageSize": 10
        },
        "keyword": '',
        "direction": 0
      });

      var config = {
        method: 'post',
        url: '/api/exam/switch',
        headers: {
          'Content-Type': 'application/json'
        },
        data: data
      };

      axios(config)
        .then((response) => {
          console.log(response.data);
          if (questionCount >= this.questionIdList.length) {
            this.questionIdList.push(response.data.data.currentId)
            this.questionContent = response.data.data
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    toggleDrawer() {
      this.drawerVisible = !this.drawerVisible
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
      }
    },
    showEvaluation() {
      this.showEvaluationContent = true
      this.recordCount = 0 // 使用点评功能后重置计数
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
      this.$refs.loginForm.validateField('phone', async (errorMessage) => {
        if (errorMessage) {
          return // 如果手机号验证不通过，直接返回
        }

        // 手机号验证通过，开始发送验证码
        this.canSendCode = false
        this.countdown = 60
        var data = JSON.stringify({
          "phone": this.loginForm.phone,
          "captcha": this.captcha.captchaCode,
          "captchaId": this.captcha.captchaCode,
          "macAddress": "1232"
        });
        var config = {
          method: 'post',
          url: '/auth/sms',
          headers: {
            'Content-Type': 'application/json'
          },
          data: data
        };

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
          await axios(config)
            .then(function (response) {
              console.log(response.data);
            })
            .catch(function (error) {
              console.log(error);
            });
          this.$message.success('验证码发送成功')
        } catch (error) {
          this.canSendCode = true
          clearInterval(this.timer)
          this.$message.error('验证码发送失败')
        }
      })
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
    startDemo() {
      if (!this.isDemoStarted) {
        this.isDemoStarted = true
      }
    },
    // 添加退出登录方法
    handleLogout() {
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
  gap: 16px;
}

.page-region span {
  font-size: 14px;
  color: #606266;
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
  width: 384px;
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
  padding: 16px;
  background: #FFFFFF;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.8;
  color: #333333;
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
  width: 100%;
  height: 100%;
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

/* 为地区select单独设置宽度 */
.label-group:nth-child(2) .el-select {
  width: 80px;
  /* 减小地区选择框的宽度 */
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
  background-color: #f5f5f5;
}

.recharge-option.selected {
  border-color: #409EFF;
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
  padding: 24px;
  gap: 24px;
  background-color: #f5f5f5;
}

.qr-code {
  flex: 0 0 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff;
  border-radius: 4px;
  padding: 16px;
  height: 200px;
}

.qr-code img {
  width: 160px;
  height: 160px;
  object-fit: contain;
}

.payment-selection {
  flex: 0 0 50%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.payment-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background-color: #fff;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  height: 50px;
}

.payment-option.selected {
  background-color: #fff;
}

.radio-circle {
  width: 18px;
  height: 18px;
  border: 1px solid #DCDFE6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.radio-inner {
  width: 10px;
  height: 10px;
  background-color: #409EFF;
  border-radius: 50%;
}

.payment-option img {
  width: 24px;
  height: 24px;
}

.payment-option span {
  font-size: 14px;
  color: #606266;
}

.payment-notes {
  padding: 16px 24px;
  color: #909399;
  font-size: 12px;
  line-height: 1.6;
  background-color: #f5f5f5;
}

.payment-notes p {
  margin: 4px 0;
}

.agreement {
  color: #409EFF;
  cursor: pointer;
}
</style>
