import axios from 'axios'
import {
  RequestMerge,
  errorFilterHook,
  corsHook,
  setHeaderAuthorizationHook,
  setCommonParamsHook,
  RequestQueue,
} from './utils'

const requestMerge = new RequestMerge()
const requestQueue = new RequestQueue()

export default class Api {
  constructor(axiosConfig, errorConfig, queue = false) {
    this.queue = typeof queue !== 'boolean' ? false : queue // 默认为关闭请求队列
    this.instance = axios.create()
    this.axiosConfig = axiosConfig // 存储axiosConfig，用于RequestMerge
    this.instance.interceptors.request.use(function (config) {
      config = { ...config, ...axiosConfig } // merge axiosConfig with config
      config = corsHook(config) // add cors hook
      config = setHeaderAuthorizationHook(config) // add authorization hook
      config = setCommonParamsHook(config) // add common params hook

      return config
    })

    this.instance.interceptors.response.use(
      function (response) {
        return response
      },
      function (error) {
        // 处理错误信息
        const { response } = error
        if (response) {
          // 处理响应错误
          const { status } = response
          errorFilterHook(status, errorConfig)
        } else {
          // 处理请求错误，在具体的接口请求代码中根据业务需求进行处理
        }
      },
    )
  }

  get(url, data, config) {
    const requestTask = () =>
      requestMerge.request(this.instance, 'get', url, data, config, this.axiosConfig)
    return this.queue ? requestQueue.add(requestTask) : requestTask()
  }

  post(url, data, config) {
    const requestTask = () =>
      requestMerge.request(this.instance, 'post', url, data, config, this.axiosConfig)
    return this.queue ? requestQueue.add(requestTask) : requestTask()
  }

  put(url, data, config) {
    const requestTask = () =>
      requestMerge.request(this.instance, 'put', url, data, config, this.axiosConfig)
    return this.queue ? requestQueue.add(requestTask) : requestTask()
  }

  delete(url, data, config) {
    const requestTask = () =>
      requestMerge.request(this.instance, 'delete', url, data, config, this.axiosConfig)
    return this.queue ? requestQueue.add(requestTask) : requestTask()
  }

  patch(url, data, config) {
    const requestTask = () =>
      requestMerge.request(this.instance, 'patch', url, data, config, this.axiosConfig)
    return this.queue ? requestQueue.add(requestTask) : requestTask()
  }
}
