import axios from 'axios'
import {
  MergeRequest,
  errorFilterHook,
  corsHook,
  setHeaderAuthorizationHook,
  setCommonParamsHook,
} from './utils'

const mergeRequest = new MergeRequest()

export default class Api {
  constructor(axiosConfig, errorConfig) {
    this.instance = axios.create()
    this.axiosConfig = axiosConfig // 存储axiosConfig，用于mergeRequest
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
    return mergeRequest.merge(this.instance, 'get', url, data, config, this.axiosConfig)
  }
  // get(url, data, config) {
  //   return this.instance.get(url, { params: data, ...config })
  // }

  post(url, data, config) {
    return this.instance.post(url, data, config)
  }

  put(url, data, config) {
    return this.instance.put(url, data, config)
  }

  delete(url, data, config) {
    return this.instance.delete(url, { params: data, ...config })
  }

  patch(url, data, config) {
    return this.instance.patch(url, data, config)
  }
}
