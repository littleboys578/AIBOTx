import axios, { type AxiosResponse } from 'axios'
import { useAuthStore } from '@/store'

const service = axios.create({
  baseURL: import.meta.env.VITE_GLOB_API_URL,
})

service.interceptors.request.use(
  (config) => {
    
	//TODO 暂时以覆盖 Authorization 的方式做前端登录，需优化jwt的前端方式，避免与开源项目使用到的有冲突（如切换为非openai官方方式），
	const jwt_token = localStorage.getItem('jwt_token')
	if(jwt_token){
	  config.headers.Authorization2 = `Bearer ${jwt_token}`
	}
	
	
	const token = useAuthStore().token
    if (token )
      config.headers.Authorization = `Bearer ${token}`

	
    return config
  },
  (error) => {
    return Promise.reject(error.response)
  },
)

service.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    if (response.status === 200)
      return response

    throw new Error(response.status.toString())
  },
  (error) => {
    if(error.response.status==403){
      location.href='/'
    }
    return Promise.reject(error)
  },
)

export default service
