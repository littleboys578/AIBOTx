import nodemailer from 'nodemailer'

// 创建一个SMTP服务器配置
const config = {
  host: 'smtp.qq.com', // 邮箱服务的主机，QQ邮箱为例
  port: 465, // 邮箱服务的主机对应的端口
  auth: {
    user: '865672992@qq.com', // 发送验证码的QQ邮箱账号
    pass: 'ejqxaijofyurbefj', // 邮箱的授权码
  },
}

// 创建一个SMTP客户端对象
const transporter = nodemailer.createTransport(config)

// 发送邮件
export const sendMail = (mail: nodemailer.SendMailOptions) => {
  transporter.sendMail(mail, (error: any, info: { response: any }) => {
    if (error)
      return console.log(error)
    console.log('mail sent:', info.response)
  })
}

// export default sendMail
