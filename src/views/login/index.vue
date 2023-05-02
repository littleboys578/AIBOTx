<!-- eslint-disable unused-imports/no-unused-vars -->
<script>
import { fetchCheckdata, fetchSenddata } from '@/api'
// import sendMail from ''
export default {
  data() {
    return {
      email: '',
      verificationCode: '',
      errorMessage: '',
    }
  },
  computed: {
    isValidForm() {
      return this.email && this.verificationCode
    },
    isEmailValid() {
      const emailRegex = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/
      return emailRegex.test(this.email)
    },
  },
  methods: {
    async sendVerificationCode() {
      if (!this.isEmailValid)
        return

      try {
        // const res = await insertdata(this.email, this.verificationCode)
        const { status, message, data } = await fetchSenddata(this.email)
        // await fetchVerify(this.email)
        // eslint-disable-next-line no-console
        console.log(message)
        // 处理验证码发送成功的逻辑，如显示提示信息
      }
      catch (error) {
        console.error('验证码发送失败:', error)
        // 处理验证码发送失败的逻辑，如显示错误消息
        this.errorMessage = '验证码发送失败，请稍后再试。'
      }
    },
    async submitForm() {
      if (!this.isValidForm)
        return

      try {
        // eslint-disable-next-line unused-imports/no-unused-vars
        const { status, message, data } = await fetchCheckdata(this.email, this.verificationCode)
        // const check = await fetchCheckdata(this.email)
        // console.log('登录成功:', response.data)
        // 处理成功登录，例如重定向到另一个页面
        if (status === 'Success') {
          localStorage.setItem('jwt_token', data)
          this.$router.push('/chat')
        }
      }
      catch (error) {
        console.error('登录失败:', error)
        // 处理登录失败，例如显示错误消息
        this.errorMessage = '登录失败，请检查您的邮箱和验证码。'
      }
    },
  },
}
</script>

<template>
  <div class="login-container">
    <div class="login-form">
      <h2>帐号登录</h2>
      <form @submit.prevent="submitForm">
        <div>
          <label for="email">邮箱：</label>
          <input id="email" v-model.trim="email" class="email" type="email" required>
          <span v-if="!isEmailValid && email.length > 0" class="input-hint">请输入有效的邮箱地址</span>
          <button type="button" :disabled="!isEmailValid" @click="sendVerificationCode">
            发送验证码
          </button>
        </div>
        <div>
          <label for="verification-code">请输入验证码：</label>
          <input id="verification-code" v-model.trim="verificationCode" class="verification-code" type="text" required>
        </div>
        <button type="submit" :disabled="!isValidForm">
          登录
        </button>
        <p v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </p>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-image: url("https://img.colorhub.me/VzJ_lPMQdJo/rs:auto:0:500:0/g:ce/fn:colorhub/bG9jYWw6Ly8vMTIvNWIvNTdiNDNhZDRkNmUxYWQwMDk0NGUxZDI3NjIxM2FiOTU2ZjFlMTI1Yi5qcGVn.webp");
  background-repeat: no-repeat; /* 不重复平铺 */
  background-size: cover; /* 背景图尽可能撑满容器 */
}

  .login-form {
    width: 300px;
    padding-top: 10px;
    padding-right: 10px;
    padding-bottom: 20px;
    padding-left: 10px;
    border-radius: 4px;
    background-color: #fff;
  }

  h2 {
    display: block;
    font-weight: bold;
    color: black;
    text-align: center;
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
    background-color:  white; /* 添加底色 */
  }

  label[for="email"]  {
    margin-bottom: 0.5rem;
    font-size: 1rem; /* 修改字体大小为 1.2rem */
  }

  .email{
  border: none;
  border-radius: 4px;
  padding: 0.7rem 1rem; /* 修改了padding */
  margin-bottom: 1rem;
  width: 100%;
  font-size: 1rem; /* 增加了font-size属性 */
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1); /* 增加了box-shadow属性 */
  }
  .input-hint {
  color: rgba(255, 0, 0, 0.668);
}
  .verification-code{
  border: none;
  border-radius: 4px;
  padding: 0.3rem 1rem; /* 修改了padding */
  margin-top: 1rem;
  margin-bottom: 1rem;
  width: 50%;
  font-size: 0.5rem; /* 增加了font-size属性 */
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1); /* 增加了box-shadow属性 */
  }
  button {
    background-color: #03b57c;
    color: #fff;
    border: none;
    border-radius: 4px;
    padding: 0.5rem 1rem;
    margin-top: 1rem;
    cursor: pointer;
    width: 100%;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  button:hover {
    background-color: #00a48e;
  }

  .error-message {
    color: red;
    margin-top: 1rem;
    text-align: center;
  }

  @media (max-width: 600px) {
     .login-form {
      width: 80%;
      max-width: 400px;
    }
  }
</style>