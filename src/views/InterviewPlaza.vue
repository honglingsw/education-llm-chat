<template>
  <div class="interview-plaza" @click="handlePageClick">
    <!-- 顶部导航 -->
    <header class="header">
      <div class="header-container">
        <!-- 左侧logo -->
        <div class="header-left">
          <img class="nav-logo" src="@/assets/logo1.png" alt="Logo" />
        </div>
        <!-- 右侧工具栏 -->
        <div class="header-right">
          <div class="nav-icons">
            <template v-if="isLoggedIn">
              <div class="nav-icons-wrapper">
                <div class="qr-tooltip-container">
                  <img class="icon-img" src="@/assets/all.png" alt="all" />
                  <div class="qr-tooltip">
                    <div class="qr-tooltip-content">
                      <img
                        src="@/assets/qr_code.png"
                        alt="QR Code"
                        class="qr-code-img"
                      />
                      <div class="qr-tooltip-text">进群送次数</div>
                    </div>
                  </div>
                </div>
                <div class="wallet nav-icon" @click="showRechargeDialog">
                  <img
                    class="wallet-icon"
                    src="@/assets/wallet.png"
                    alt="wallet"
                  />
                  <span
                    class="balance"
                    style="
                      font-size: 14px;
                      color: #111111;
                      font-family: 'Alibaba Sans', sans-serif;
                    "
                    >{{ coinBalance }}</span
                  >
                </div>
              </div>
            </template>
            <template v-else>
              <div class="nav-icons-wrapper">
                <div class="qr-tooltip-container">
                  <img class="icon-img" src="@/assets/all.png" alt="all" />
                  <div class="qr-tooltip">
                    <div class="qr-tooltip-content">
                      <img
                        src="@/assets/qr_code.png"
                        alt="QR Code"
                        class="qr-code-img"
                      />
                      <div class="qr-tooltip-text">进群送次数</div>
                    </div>
                  </div>
                </div>
                <img
                  class="icon-img"
                  src="@/assets/wallet.png"
                  alt="wallet"
                  @click="showRechargeDialog"
                />
              </div>
            </template>
          </div>
          <div class="user-actions">
            <template v-if="isLoggedIn">
              <img src="@/assets/user.png" class="user-icon" alt="user" />
              <span
                class="user-phone"
                style="
                  color: #111111;
                  font-family: 'Alibaba Sans', sans-serif;
                  font-size: 14px;
                "
                >{{ maskPhoneNumber }}</span
              >
              <img
                src="@/assets/out.png"
                class="logout-icon"
                alt="logout"
                @click="handleLogout"
              />
            </template>
            <template v-else>
              <el-button
                class="login-button"
                type="primary"
                @click="showLoginDialog"
                >登录</el-button
              >
            </template>
          </div>
        </div>
      </div>
    </header>

    <!-- 主体内容 -->
    <div style="margin: 10px 100px; background-color: #ffffff">
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
            <!-- <div class="card-action">
              <span class="action-text">立即加入</span>
            </div> -->
            <div class="forWaiting" v-if="interview.isForWaiting">敬请期待</div>
          </div>
        </div>
      </main>
    </div>

    <!-- 添加登录弹框 -->
    <el-dialog
      :visible.sync="loginDialogVisible"
      class="dialog-container"
      width="400px"
      :show-close="false"
      :before-close="handleCloseDialog"
      :close-on-click-modal="false"
      center
    >
      <div class="login-container">
        <!-- LOGO区域 -->
        <div class="login-logo">
          <img src="@/assets/logo1.png" alt="Logo" class="logo-image" />
        </div>

        <el-form
          ref="loginForm"
          :model="loginForm"
          :rules="loginRules"
          label-width="0"
        >
          <!-- 手机号输入框 -->
          <el-form-item prop="phone" class="form-item">
            <el-input v-model="loginForm.phone" placeholder="手机号" />
          </el-form-item>

          <!-- 图形验证码 -->
          <el-form-item prop="captcha" class="captcha-verify">
            <el-input
              v-model="captcha.captchaCode"
              placeholder="图片验证"
              class="captcha-input"
            />
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
              <el-input
                v-model="loginForm.code"
                placeholder="输入验证码"
                class="verify-input"
              />
              <span
                class="send-code-text"
                :class="{ disabled: !canSendCode }"
                @click="sendCode"
              >
                {{
                  canSendCode ? "获取短信验证码" : `${countdown}秒后重新发送`
                }}
              </span>
            </div>
          </el-form-item>

          <!-- 注册/登录按钮 -->
          <el-form-item class="form-item">
            <el-button
              type="primary"
              class="register-login-btn"
              :loading="loading"
              @click="handleLogin"
            >
              注册/登录
            </el-button>
          </el-form-item>

          <!-- 取消按钮 -->
          <el-form-item class="form-item">
            <el-button class="cancel-btn" @click="handleCloseDialog"
              >取消</el-button
            >
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>

    <!-- 添加充值弹窗 -->
    <el-dialog
      :visible.sync="rechargeDialogVisible"
      class="recharge-dialog"
      width="720px"
      :show-close="false"
      center
    >
      <div class="recharge-container">
        <!-- 顶部用户信息 -->
        <div class="recharge-header">
          <div class="user-info">
            <i class="el-icon-user" />
            <span>{{ maskPhoneNumber }}</span>
          </div>
          <div class="wallet-info">
            <img class="wallet-icon" src="@/assets/wallet.png" alt="wallet" />
            <span>{{ isLoggedIn ? "4000" : "----" }}</span>
          </div>
          <div class="close-btn" @click="rechargeDialogVisible = false">
            <i class="el-icon-close" />
          </div>
        </div>

        <!-- 充值选项 -->
        <div class="recharge-options">
          <div
            v-for="(option, index) in rechargeOptions"
            :key="index"
            class="recharge-option"
            :class="{ selected: selectedRechargeOption === index }"
            @click="selectedRechargeOption = index"
          >
            <div class="original-price">{{ option.originalPrice }}元</div>
            <div class="discount-price">{{ option.discountPrice }}元</div>
            <div class="points">
              {{ option.points }} <i class="el-icon-info" />
            </div>
          </div>
        </div>

        <!-- 支付方式 -->
        <div class="payment-section">
          <!-- 二维码区域 -->
          <div class="qr-code">
            <img src="@/assets/qr_code.png" alt="QR Code" />
          </div>

          <!-- 右侧区域：支付选项和说明文字 -->
          <div class="payment-right-section">
            <!-- 支付选项 -->
            <div class="payment-options">
              <div
                class="payment-option"
                :class="{ selected: paymentMethod === 'wechat' }"
                @click="paymentMethod = 'wechat'"
              >
                <label class="radio-label">
                  <input
                    type="radio"
                    name="payment"
                    :checked="paymentMethod === 'wechat'"
                  />
                  <span class="radio-custom"></span>
                  <img src="@/assets/wechat_pay.png" alt="WeChat Pay" />
                  <span>微信支付</span>
                </label>
              </div>
              <div
                class="payment-option"
                :class="{ selected: paymentMethod === 'alipay' }"
                @click="paymentMethod = 'alipay'"
              >
                <label class="radio-label">
                  <input
                    type="radio"
                    name="payment"
                    :checked="paymentMethod === 'alipay'"
                  />
                  <span class="radio-custom"></span>
                  <img src="@/assets/alipay.png" alt="Alipay" />
                  <span>支付宝支付</span>
                </label>
              </div>
            </div>

            <!-- 说明文字 -->
            <div class="payment-notes">
              <p>
                •
                每次答题点评消耗积分，每次智能示范消耗积分；点数不足时，无法使用对应服务
              </p>
              <p>
                • 完成支付即视为同意<span class="agreement">《用户协议》</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 添加反馈对话框 -->
    <el-dialog
      :visible.sync="feedbackDialogVisible"
      :show-close="false"
      class="feedback-dialog"
      center
    >
      <div class="feedback-content">
        <div class="close-btn" @click="feedbackDialogVisible = false">
          <i class="el-icon-close"></i>
        </div>

        <h2>言e面试对您的面试有帮助吗?</h2>
        <div class="star-rating">
          <i
            class="el-icon-star-off"
            v-for="i in 5"
            :key="'help' + i"
            @click="setHelpRating(i)"
            :class="{ 'el-icon-star-on': helpRating >= i }"
          ></i>
        </div>

        <h2>言e面试的使用体验好吗?</h2>
        <div class="star-rating">
          <i
            class="el-icon-star-off"
            v-for="i in 5"
            :key="'use' + i"
            @click="setUseRating(i)"
            :class="{ 'el-icon-star-on': useRating >= i }"
          ></i>
        </div>

        <h2>言e面试的解答是否专业?</h2>
        <div class="star-rating">
          <i
            class="el-icon-star-off"
            v-for="i in 5"
            :key="'professional' + i"
            @click="setProfessionalRating(i)"
            :class="{ 'el-icon-star-on': professionalRating >= i }"
          ></i>
        </div>

        <h2>言e面试的定价是否合理?</h2>
        <div class="star-rating">
          <i
            class="el-icon-star-off"
            v-for="i in 5"
            :key="'price' + i"
            @click="setPriceRating(i)"
            :class="{ 'el-icon-star-on': priceRating >= i }"
          ></i>
        </div>

        <h2>如果您还有更多想说的，请告诉我:</h2>
        <el-input
          type="textarea"
          :rows="3"
          v-model="feedbackComment"
          placeholder="请输入您的反馈意见..."
        ></el-input>

        <div class="auto-show-option">
          <el-checkbox v-model="notAutoShow">不再自动弹出</el-checkbox>
        </div>

        <div class="feedback-btns">
          <el-button class="cancel-btn" @click="feedbackDialogVisible = false"
            >不了，谢谢</el-button
          >
          <el-button type="primary" class="submit-btn" @click="submitFeedback"
            >提交反馈</el-button
          >
        </div>
      </div>
    </el-dialog>

    <!-- 添加悬浮按钮 -->
    <div class="float-button" @click="feedbackDialogVisible = true">
      <img src="@/assets/QA.png" alt="QA" class="qa-icon" />
    </div>
  </div>
</template>

<script>
import axios from "axios";
export default {
  name: "InterviewPlaza",
  data() {
    // 自定义手机号验证规则
    const validatePhone = (rule, value, callback) => {
      if (!value) {
        callback(new Error("请输入手机号"));
      } else if (!/^1[3-9]\d{9}$/.test(value)) {
        callback(new Error("不合法的手机号！"));
      } else {
        callback();
      }
    };

    // 添加验证码验证规则
    const validateCode = (rule, value, callback) => {
      if (!value) {
        callback(new Error("请输入验证码"));
        // } else if (value !== '1234') {
        //   callback(new Error('验证码错误！'))
      } else {
        callback();
      }
    };

    return {
      activeTab: "all",
      tabs: [
        { label: "全部", value: "all" },
        { label: "结构化面试", value: "structured" },
        { label: "互联网面试", value: "internet" },
      ],
      interviews: [
        {
          id: 1,
          title: "公务员考试",
          description:
            "涵盖全国31省市近5年真题，500+高仿真模拟题，协助考生语言表达训练、应急应变技巧、考官评分视角分析",
          type: "structured",
          code: "GOV_EXAM",
          icon: "el-icon-user",
          isForWaiting: false,
        },
        {
          id: 2,
          title: "互联网考试",
          description:
            "这是一段描述这是一段描述这是一段描述这是一段描述这是一段描述这是一段描述这是一段描述这是一段描述",
          type: "structured",
          code: "INTERNET",

          icon: "el-icon-user-solid",
          isForWaiting: false,
        },
        {
          id: 3,
          title: "教师资格证考试",
          description:
            "这是一段描述这是一段描述这是一段描述这是一段描述这是一段描述这是一段描述这是一段描述这是一段描述",
          type: "structured",
          icon: "el-icon-user-solid",
          isForWaiting: false,
        },
        {
          id: 4,
          title: "教师资格证考试",
          description:
            "这是一段描述这是一段描述这是一段描述这是一段描述这是一段描述这是一段描述这是一段描述这是一段描述",
          type: "internet",
          icon: "el-icon-user-solid",
          isForWaiting: false,
        },
        {
          id: 5,
          title: "公务员考试",
          description:
            "涵盖全国31省市近5年真题，500+高仿真模拟题，协助考生语言表达训练、应急应变技巧、考官评分视角分析",
          type: "structured",
          code: "GOV_EXAM",
          icon: "el-icon-user",
          isForWaiting: false,
        },
        {
          id: 6,
          title: "教师资格证考试",
          description:
            "这是一段描述这是一段描述这是一段描述这是一段描述这是一段描述这是一段描述这是一段描述这是一段描述",
          type: "structured",
          icon: "el-icon-user-solid",
          isForWaiting: false,
        },
        {
          id: 7,
          title: "教师资格证考试",
          description:
            "这是一段描述这是一段描述这是一段描述这是一段描述这是一段描述这是一段描述这是一段描述这是一段描述",
          type: "structured",
          icon: "el-icon-user-solid",
          isForWaiting: true,
        },
        {
          id: 8,
          title: "教师资格证考试",
          description:
            "这是一段描述这是一段描述这是一段描述这是一段描述这是一段描述这是一段描述这是一段描述这是一段描述",
          type: "internet",
          icon: "el-icon-user-solid",
          isForWaiting: true,
        },
      ],
      isLoggedIn: false,
      userPhone: "",
      loginDialogVisible: false,
      loading: false,
      token: "",
      loginForm: {
        phone: "",
        code: "",
      },
      loginRules: {
        phone: [
          { required: true, message: "请输入手机号", trigger: "submit" },
          { validator: validatePhone, trigger: "submit" },
        ],
        code: [
          { required: true, message: "请输入验证码", trigger: "submit" },
          { validator: validateCode, trigger: "submit" },
        ],
      },
      countdown: 60,
      timer: null,
      canSendCode: true,
      validPhone: "13012343322", // 可登录手机号
      coinBalance: 0,
      captcha: {
        captchaId: "",
        captchaImg: "",
        captchaCode: "",
      },
      rechargeDialogVisible: false,
      selectedRechargeOption: 0,
      paymentMethod: "wechat",
      rechargeOptions: [
        { originalPrice: "129.9", discountPrice: "99.99", points: "2000" },
        { originalPrice: "129.9", discountPrice: "99.99", points: "2000" },
        { originalPrice: "129.9", discountPrice: "99.99", points: "2000" },
        { originalPrice: "129.9", discountPrice: "99.99", points: "2000" },
      ],
      feedbackDialogVisible: false,
      helpRating: 0,
      useRating: 0,
      professionalRating: 0,
      priceRating: 0,
      errorLock: false,

      feedbackComment: "",
      notAutoShow: false,
    };
  },

  computed: {
    maskPhoneNumber() {
      if (!this.userPhone) return "";
      return this.userPhone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
    },

    filteredInterviews() {
      if (this.activeTab === "all") {
        return this.interviews;
      }
      return this.interviews.filter(
        (interview) => interview.type === this.activeTab
      );
    },
  },

  mounted() {
    this.getCaptcha();
    this.getUserInfo();

    this.getToken();

    // 添加全局点击监听器
    document.addEventListener("click", this.handlePageClick);
  },

  // 在组件销毁前清除定时器
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },

  methods: {
    getCaptcha() {
      var config = {
        method: "get",
        url: "https://test.aigcpmer.com/api/auth/captcha",
        headers: {},
      };

      axios(config)
        .then((response) => {
          if (response.data.code === 200) {
            // console.log(response.data);
            this.captcha.captchaId = response.data.data.captchaId;
            this.captcha.captchaImg = response.data.data.captchaImage;
          } else {
            if (!this.errorLock) {
              this.errorLock = true;
              this.$message.error(response.data.message);
              setTimeout(() => {
                this.errorLock = false;
              }, 2000);
            }
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    goToInterview(interview) {
      this.$router.push({
        name: "InterviewPracticeTest",
        params: { code: interview.code },
      });
      // 导航到面试练习页面
      // this.$router.push({
      //   name: 'InterviewPractice',
      //   params: { id: interview.id },
      //   query: { type: interview.type }
      // })
    },

    // 新增登录相关方法
    showLoginDialog() {
      this.loginDialogVisible = true;
      // 重置表单数据和验证状态
      this.$nextTick(() => {
        this.$refs.loginForm.resetFields();
      });
    },
    showRechargeDialog() {
      if (this.isLoggedIn) {
        this.rechargeDialogVisible = true;
      } else {
        this.showLoginDialog();
        this.$message.warning("请先登录后再进行充值操作");
      }
    },

    handleCloseDialog() {
      this.loginDialogVisible = false;
      // 重置表单数据和验证状态
      this.$refs.loginForm.resetFields();
      this.captcha.captchaCode = "";
    },
    showRechargeDialog() {},
    getUserInfo() {
      const userPhone = localStorage.getItem("userPhone");
      const token = localStorage.getItem("token");
      if (userPhone && token) {
        this.isLoggedIn = true;
        this.userPhone = userPhone;
      }
    },
    getToken() {
      const token = localStorage.getItem("token");

      var config = {
        method: "get",
        url: "https://test.aigcpmer.com/api/user/detail",
        headers: { Authorization: `Bearer ${token}` },
      };

      axios(config)
        .then((response) => {
          console.log('response', response);
          
          if (response.data.code === 200) {
            // console.log(response.data);
            this.coinBalance = response.data.data.coinBalance;
          } else {
            // 处理错误情况
            if (!this.errorLock) {
              this.errorLock = true;
              this.$message.error(response.data.message);
              setTimeout(() => {
                this.errorLock = false;
              }, 2000);
            }
          }
        })
        .catch((error) => {
          if (error.response) {
              if (error.response.status === 401) {
                // 处理 401 错误
                localStorage.removeItem("userPhone");
                localStorage.removeItem("token");
                this.isLoggedIn = false;
                this.userPhone = "";
                return;
              } else if (error.response.data && error.response.data.message) {
                errorMsg = error.response.data.message;
              }
            }
          console.log("error", error);
          let errorMsg = false;
          if (
            error.response &&
            error.response.data &&
            error.response.data.message
          ) {
            errorMsg = error.response.data.message;
          }
          if (!errorMsg) {
            return;
          }
          if (!this.errorLock) {
            this.errorLock = true;

            this.$message.error(errorMsg);
            setTimeout(() => {
              this.errorLock = false;
            }, 2000);
          }
        });
    },
    handleLogin() {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.loading = true;
          var config = {
            method: "post",
            url: "https://test.aigcpmer.com/api/auth/login",
            headers: {
              "Content-Type": "application/json",
              Accept: "*/*",
            },
            data: { phone: this.loginForm.phone, captcha: this.loginForm.code },
          };

          axios(config)
            .then((response) => {    
              if (response.data.code === 200) {
                this.loading = false;
                this.isLoggedIn = true;
                this.userPhone = this.loginForm.phone;
                localStorage.setItem("userPhone", this.loginForm.phone);

                localStorage.setItem("token", response.data.data.token);
                this.handleCloseDialog();
                this.$message.success("登录成功");
                this.getToken();
              } else {
                // 处理错误情况
                if (!this.errorLock) {
                  this.errorLock = true;
                  this.$message.error(response.data.message);
                  setTimeout(() => {
                    this.errorLock = false;
                  }, 2000);
                }
              }
            })
            .catch((error) => {
              this.loading = false;
              this.$message.error("登录失败，请重试");
              console.log("error", error);
              let errorMsg = false;
              if (
                error.response &&
                error.response.data &&
                error.response.data.message
              ) {
                errorMsg = error.response.data.message;
              }
              if (!errorMsg) {
                return;
              }
              if (!this.errorLock) {
                this.errorLock = true;
                this.$message.error(errorMsg);
                setTimeout(() => {
                  this.errorLock = false;
                }, 2000);
              }
            });
        }
      });
    },

    // 发送验证码
    async sendCode() {
      if (!this.canSendCode) {
        return; // 如果正在倒计时，直接返回不做任何操作
      }
      this.canSendCode = false;
      // 先验证手机号
      this.$refs.loginForm.validateField("phone", async (errorMessage) => {
        if (errorMessage) {
          this.canSendCode = true;

          return; // 如果手机号验证不通过，直接返回
        }

        // 验证验证码不为空
        if (!this.captcha.captchaCode) {
          this.canSendCode = true;

          this.$message.warning("请输入图片验证码");
          return;
        }

        try {
          // 直接发送短信验证码，接口内部会验证图形验证码
          var data = JSON.stringify({
            phone: this.loginForm.phone,
            captcha: this.captcha.captchaCode,
            captchaId: this.captcha.captchaId,
            macAddress: "1232",
          });

          var config = {
            method: "post",
            url: "https://test.aigcpmer.com/api/auth/sms",
            headers: {
              "Content-Type": "application/json",
            },
            data: data,
          };

          const response = await axios(config);
          console.log("短信验证码响应:", response.data);

          // 检查响应状态
          if (response.data.code !== 200) {
            // 处理错误情况
            if (!this.errorLock) {
              this.errorLock = true;
              this.$message.error(response.data.message);
              setTimeout(() => {
                this.errorLock = false;
              }, 2000);
            }
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

          this.$message.success("验证码发送成功");
        } catch (error) {
          this.canSendCode = true;

          console.log("发送短信验证码出错:", error);
          this.$message.error("验证码发送失败，请重试");
        }
      });
    },

    // 添加点击页面空白处的处理方法
    handlePageClick(e) {
      // 判断点击的是否是输入框或按钮
      const isFormElement =
        e.target.closest(".el-input") ||
        e.target.closest(".el-button") ||
        e.target.closest(".el-form-item__error") ||
        e.target.closest(".send-code-text");

      // 如果不是表单元素，则清除验证信息，但不触发新的验证
      if (!isFormElement && this.$refs.loginForm) {
        this.$refs.loginForm.clearValidate();
      }
    },

    // 添加退出登录方法
    handleLogout() {
      this.isLoggedIn = false;
      this.userPhone = "";
      this.$message.success("已退出登录");
    },

    // 显示反馈对话框
    showFeedbackDialog() {
      this.feedbackDialogVisible = true;
    },

    // 设置帮助评分
    setHelpRating(rating) {
      this.helpRating = rating;
    },

    // 设置使用体验评分
    setUseRating(rating) {
      this.useRating = rating;
    },

    // 设置专业性评分
    setProfessionalRating(rating) {
      this.professionalRating = rating;
    },

    // 设置价格合理性评分
    setPriceRating(rating) {
      this.priceRating = rating;
    },

    // 提交反馈
    submitFeedback() {
      const token = localStorage.getItem("token");

      // 准备要提交的数据
      const feedbackData = {
        helpfulnessRating: this.helpRating,
        convenienceRating: this.useRating,
        professionalRating: this.professionalRating,
        priceRating: this.priceRating,
        additionalComments: this.feedbackComment,
        noPopup: this.notAutoShow,
      };

      var config = {
        method: "post",
        url: "https://test.aigcpmer.com/api/userFeedback/create",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: feedbackData,
      };

      axios(config)
        .then((response) => {
          if (response.data.code === 200) {
            // 这里可以添加API请求来提交数据
            console.log("提交的反馈数据:", feedbackData);

            this.$message.success("感谢您的参与，祝您生活愉快！");
            this.feedbackDialogVisible = false;
            // 重置表单数据
            this.helpRating = 0;
            this.useRating = 0;
            this.feedbackComment = "";
            this.professionalRating = 0;
            this.priceRating = 0;
          } else {
            // 处理错误情况
            if (!this.errorLock) {
              this.errorLock = true;
              this.$message.error(response.data.message);
              setTimeout(() => {
                this.errorLock = false;
              }, 2000);
            }
          }
        })
        .catch((error) => {
          this.feedbackDialogVisible = false;
          this.$message.success("网络故障，请重新提交");
        });
    },
  },
};
</script>

<style scoped>
.interview-plaza {
  min-height: 100vh;
  max-height: 100vh;
  /* 限制最大高度为视口高度 */
  background-color: #fff;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  /* 防止整体页面滚动 */
}

.header {
  padding: 0px 0;
  background: #fff;
  box-shadow: none;
  border-bottom: 1px solid #f0f0f0; /* 可选：添加一个非常淡的底部边框 */
}

.header-container {
  margin: 16px 24px 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
}

.nav-logo {
  height: 24px;
  width: 24px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 24px;
}

.nav-icons {
  display: flex;
  align-items: center;
  height: 24px;
}

.nav-icon {
  font-size: 24px;
  color: #666666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 24px;
}

.nav-icon:hover {
  color: #409eff;
}

.wallet {
  display: flex;
  align-items: center;
  height: 24px;
  gap: 4px;
}

.wallet-icon {
  width: 24px;
  height: 24px;
  display: block;
}

.balance {
  font-size: 14px;
  color: #111111;
  font-family: "Alibaba Sans", sans-serif;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
}

.user-icon {
  width: 24px;
  height: 24px;
  display: block;
}

.user-phone {
  font-size: 14px !important;
  color: #111111 !important;
  font-family: "Alibaba Sans", sans-serif !important;
  margin-right: 8px;
}

.logout-text {
  cursor: pointer;
  font-size: 14px;
  color: #f56c6c;
}

.logout-text:hover {
  color: #f78989;
}

.login-button {
  font-size: 14px;
  padding: 8px 20px;
  border-radius: 4px;
  background-color: #7b2cf5;
  border-color: #7b2cf5;
}

.login-button:hover {
  background-color: #6521d4;
  border-color: #6521d4;
}

.icon-img {
  width: 24px;
  height: 24px;
  cursor: pointer;
  color: #909399;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  vertical-align: middle;
}

.icon-img:hover {
  opacity: 0.8;
  color: #409eff;
}

.qr-tooltip-container {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
}

.qr-tooltip {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 10px;
  width: 200px;
  height: 200px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: none;
  z-index: 1000;
  padding: 15px;
  box-sizing: border-box;
}

.qr-tooltip-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
}

.qr-code-img {
  width: 140px;
  height: 140px;
  object-fit: contain;
  margin-bottom: 5px;
}

.qr-tooltip-text {
  font-size: 12px;
  color: #333;
  font-family: "PingFang SC", sans-serif;
  text-align: center;
  margin-top: 5px;
  width: 60px;
  height: 17px;
  line-height: 17px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-tooltip:before {
  content: "";
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid #fff;
}

.qr-tooltip-container:hover .qr-tooltip {
  display: block;
}

.nav-icons-wrapper {
  display: flex;
  align-items: center;
  height: 24px;
  gap: 20px;
}

.qr-tooltip-container {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
}

.icon-img {
  width: 24px;
  height: 24px;
  margin: 0;
  cursor: pointer;
  color: #909399;
  vertical-align: middle;
  display: flex;
}

.wallet-icon {
  width: 24px;
  height: 24px;
  display: block;
}

.logout-icon {
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: block;
}

.message {
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 35px;
  right: 100px;
  bottom: 80px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s linear;
}

.message:hover {
  background: #efefef;
  cursor: pointer;
  transform: translateY(-2px);
}

.logo img {
  width: 30px;
  height: 30px;
}

.header-right {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 24px;
  color: #606266;
}

.wallet {
  display: flex;
  align-items: center;
  gap: 4px;
}

.wallet-icon {
  width: 24px;
  height: 24px;
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
  color: #409eff;
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
  color: #f56c6c;
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
  justify-content: start;
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
  background: #ccc;
  border-radius: 5px;
  height: 40px;
}

.tab:hover {
  background: #eee;
  border-radius: 5px;
  height: 40px;
}

.card-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
  gap: 20px;
}

.interview-card {
  padding-top: 10px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s;
  cursor: pointer;
  position: relative;
  height: 180px;
  display: flex;
  flex-direction: column;
}

.forWaiting {
  position: absolute;
  text-align: center;
  top: 0;
  right: 10px;
  width: 20px;
  height: 80px;
  background-color: #fad964;
  font-size: 14px;
  padding-top: 5px;

  clip-path: polygon(
    0 0,
    100% 0,
    100% 100%,
    calc(50% + 10px) 100%,
    50% calc(100% - 10px),
    calc(50% - 10px) 100%,
    0 100%
  );
}

.interview-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.card-icon {
  width: 50px;
  height: 50px;
  background: #f0f2f5;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 30px;
  left: 20px;
}

.card-icon i {
  font-size: 24px;
  color: #606266;
}

.card-content {
  padding: 20px 20px 20px 20px;
  flex: 1;
}

.card-title {
  font-size: 18px;
  font-weight: 500;
  color: #ca7ff6;
  margin-bottom: 20px;
  margin-left: 60px;
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
  color: #409eff;
  font-size: 14px;
  padding-right: 5px;
}

.dialog-container {
  .el-dialog__header {
    padding: 0;
    display: none;
    /* 完全隐藏header */
  }

  .el-dialog {
    width: 400px !important;
    height: 416px !important;
    position: fixed !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    margin: 0 !important;
    background: #ffffff !important;
    border-radius: 8px !important;
    padding: 0 !important;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1) !important;
    overflow: hidden !important;
    font-family: "PingFang SC", sans-serif;
    font-size: 16px;
  }

  .el-dialog__body {
    height: 100% !important;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 0 20px 20px 20px;
    margin: 0;
    box-sizing: border-box;
    font-family: "PingFang SC", sans-serif;
    font-size: 16px;
  }

  .login-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    font-family: "PingFang SC", sans-serif;
    font-size: 16px;
  }

  .login-logo {
    width: 400px;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .logo-image {
    width: 37px;
    height: 40px;
    object-fit: contain;
  }

  .el-button--primary {
    border-color: #fff;
    font-family: "PingFang SC", sans-serif;
    font-size: 16px;
  }

  .el-form {
    width: 320px !important;
    height: 284px !important;
    box-sizing: border-box;
    font-family: "PingFang SC", sans-serif;
    font-size: 16px;
  }

  .el-input__inner {
    width: 100% !important;
    height: 40px !important;
    padding: 0 15px !important;
    line-height: 40px !important;
    box-sizing: border-box !important;
    font-size: 16px;
    border-radius: 4px !important;
    font-family: "PingFang SC", sans-serif;
  }

  .el-input__inner:focus {
    border-color: #7b2cf5 !important;
  }

  .el-input.is-active .el-input__inner {
    border-color: #7b2cf5 !important;
  }

  .code-input-group {
    display: none;
  }

  .code-input-group .el-input {
    flex: 1;
  }

  .code-input-group .el-input__inner {
    width: 100% !important;
    border-radius: 4px !important;
  }

  .send-code-btn {
    width: 120px !important;
    height: 40px !important;
    background: #7b2cf5 !important;
    color: white !important;
    border-radius: 4px !important;
    padding: 0;
    margin: 0;
    font-family: "PingFang SC", sans-serif;
    font-size: 16px;
  }

  /* 修改表单项间距 */
  .form-item {
    margin-bottom: 20px !important;
    font-family: "PingFang SC", sans-serif;
    font-size: 16px;
  }

  /* 特别调整验证码输入框的间距 */
  .captcha-verify {
    margin-bottom: 20px !important;
    display: flex;
    align-items: center;
    font-family: "PingFang SC", sans-serif;
    font-size: 16px;
  }

  .captcha-input {
    flex: 0 0 134px;
    width: 134px !important;
    font-family: "PingFang SC", sans-serif;
    font-size: 16px;
  }

  .captcha-image {
    width: 148px;
    height: 40px;
    margin-left: 10px;
  }

  .el-icon-refresh {
    margin-left: 5px;
    cursor: pointer;
    color: #7b2cf5;
    font-size: 16px;
  }

  /* 登录和取消按钮 */
  .register-login-btn,
  .cancel-btn {
    width: 100% !important;
    height: 40px !important;
    border-radius: 4px;
    font-size: 16px;
    font-family: "PingFang SC", sans-serif;
  }

  .register-login-btn {
    background: #7b2cf5 !important;
    color: white !important;
  }

  .cancel-btn {
    background: transparent !important;
    color: #606266 !important;
    border: 1px solid #dcdcdc !important;
  }

  :deep(.el-form-item__error) {
    position: absolute;
    left: 0;
    top: 100%;
    padding: 0;
    margin: 2px 0 0;
    line-height: normal;
    color: #f56c6c;
    font-size: 12px;
    font-family: "PingFang SC", sans-serif;
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
  .el-form-item__content {
    display: flex;
  }
  :deep(.el-form) {
    width: 80% !important;
  }

  .form-item {
    margin-bottom: 20px !important;
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
    color: #f56c6c;
    z-index: 2;
    background: white;
  }

  :deep(.el-input__inner) {
    padding-right: 100px !important;
    /* 为错误提示预留空间 */
  }
}

.verify-input-wrapper {
  position: relative;
  width: 320px;
  height: 40px;
  font-family: "PingFang SC", sans-serif;
}

.verify-input {
  width: 320px !important;
  font-family: "PingFang SC", sans-serif;
  font-size: 16px;
}

.verify-input .el-input__inner {
  padding-right: 120px !important;
}

.send-code-text {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #7b2cf5;
  font-size: 16px;
  font-family: "PingFang SC", sans-serif;
  cursor: pointer;
  white-space: nowrap;
}

.send-code-text.disabled {
  color: #909399;
  cursor: not-allowed;
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
  border-bottom: 1px solid #ebeef5;
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
  border: 1px solid #ebeef5;
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
  border-color: #409eff;
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
  border-color: #409eff;
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
  background-color: #409eff;
  opacity: 0;
  transition: opacity 0.2s;
}

.radio-label input[type="radio"]:checked + .radio-custom::after {
  opacity: 1;
}

.payment-option.selected .radio-custom {
  border-color: #409eff;
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
  color: #409eff;
  cursor: pointer;
  text-decoration: underline;
}

/* 添加反馈对话框样式 */
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

.feedback-dialog >>> .el-dialog {
  width: 580px !important;
  height: 720px !important;
  margin: 0 !important;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  padding: 0;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.feedback-dialog >>> .el-dialog__header,
.feedback-dialog >>> .el-dialog__footer {
  display: none;
}

.feedback-dialog >>> .el-dialog__body {
  padding: 0;
  margin: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.feedback-content {
  width: 100%;
  height: 100%;
  padding: 15px 30px 25px;
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: center;
}

.feedback-content .close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  cursor: pointer;
  font-size: 24px;
  color: #909399;
}

.feedback-content h2 {
  font-size: 17px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 5px;
  text-align: center;
}

.star-rating {
  display: flex;
  justify-content: center;
  gap: 25px;
  margin-bottom: 8px;
}

.star-rating i {
  font-size: 30px;
  color: #dcdfe6;
  cursor: pointer;
}

.star-rating i.el-icon-star-on {
  color: #f7ba2a;
}

.auto-show-option {
  margin-top: 10px;
  margin-bottom: 5px;
}

.feedback-btns {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 15px;
}

.feedback-btns .cancel-btn,
.feedback-btns .submit-btn {
  width: 140px;
  height: 42px;
  border-radius: 21px;
  font-size: 16px;
}

.feedback-btns .submit-btn {
  background: #3384ff;
}

.feedback-btns .submit-btn:hover {
  opacity: 0.9;
}

/* 悬浮按钮样式 */
.float-button {
  position: fixed;
  right: 30px;
  bottom: 60px;
  width: 60px;
  height: 60px;
  background-color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  transition: all 0.3s;
  padding: 0;
  overflow: hidden;
}

.float-button:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.float-button:active {
  transform: scale(0.95);
}

.qa-icon {
  width: 28px;
  height: 28px;
  display: block;
  margin: 0;
  padding: 0;
  object-fit: contain;
  object-position: center;
}
</style>
