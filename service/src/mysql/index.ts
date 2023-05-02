import mysql from 'mysql2/promise'

export const connectToDatabase = async () => {
  try {
    const connection = await mysql.createConnection({
      host: 'containers-us-west-8.railway.app',
      user: 'root',
      password: 'nIRnBwfvEeMPqJaPvxqe',
      database: 'railway',
      port: 7185,
    })

    // eslint-disable-next-line no-console
    console.log('Connected to the MySQL database.')
    return connection
  }
  catch (error) {
    console.error('Failed to connect to the MySQL database:', error)
    throw error
  }
}

// (async () => {
//   try {
//     const connection = await connectToDatabase()
// 使用连接查询数据库
// const [rows] = await connection.query('SELECT * FROM user_times')
// // eslint-disable-next-line no-console
// console.log(rows)

// // 关闭数据库连接
// await connection.end()
//   }
//   catch (error) {
//     console.error('Failed to execute query:', error)
//   }
// })()

// export default connectToDatabase
