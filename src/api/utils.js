import { ElMessage } from 'element-plus'

export class MergeRequest {
  constructor() {
    this.requestMap = new Map()
  }

  merge(instance, method, url, data, config, axiosConfig) {
    const key = `${url}-${JSON.stringify(data)}-${JSON.stringify(config)}-${JSON.stringify(axiosConfig)}`
    if (this.requestMap.has(key)) {
      return this.requestMap.get(key)
    } else {
      let promise
      if (['get', 'delete'].includes(method)) {
        promise = instance[method](url, { params: data, ...config })
      } else {
        promise = instance[method](url, data, config)
      }
      promise.finally(() => {
        this.requestMap.delete(key) // 接口请求完成时删除该键值对
      })
      this.requestMap.set(key, promise)

      return promise
    }
  }
}

/**
 * HTTP错误状态码处理钩子函数
 * 根据不同的HTTP状态码执行对应的路由跳转和消息提示
 *
 * @param {number} status - HTTP响应状态码
 * @param {Object} errorConfig - 错误处理配置对象，结构示例：
 *        {
 *          '401': { default: false, message: '自定义提示' },
 *          '403': { message: false }, // 禁用消息提示
 *          ...
 *        }
 * @returns {void}
 */
export const errorFilterHook = (status, errorConfig) => {
  switch (status) {
    case 401: {
      // 未登录，跳转到登录页并给出提示
      const config = errorConfig['401']
      if (!config || config.default !== false) this.$router.push('/login')
      if (config.message !== false)
        ElMessage({ message: config.message || '未登录', type: 'error' })
      break
    }
    case 403: {
      // 无权限，跳转首页并给出提示
      const config = errorConfig['403']
      if (!config || config.default !== false) this.$router.push('/')
      if (config.message !== false)
        ElMessage({ message: config.message || '无权限访问', type: 'error' })
      break
    }
    case 404: {
      // 给出提示
      const config = errorConfig['404']
      if (config.message !== false)
        ElMessage({ message: config.message || '接口不存在', type: 'error' })
      break
    }
    case 500: {
      // 给出提示
      const config = errorConfig['500']
      if (config.message !== false)
        ElMessage({ message: config.message || '服务器错误', type: 'error' })
      break
    }
    default:
      // 处理其他错误，在具体的接口请求代码中根据业务需求进行处理
      break
  }
}

/**
 * 读取域名白名单，根据域名白名单判断是否需要设置跨域
 * @param {*} config
 * @returns config
 */
export const corsHook = (config) => {
  // 读取域名白名单，从环境变量中获取VITE_APP_WHITE_LIST的值，并将其分割成数组
  const whitelist = import.meta.env.VITE_APP_WHITE_LIST.split(',')

  // 判断是否在白名单中
  if (whitelist.some((item) => config.url.startsWith(item))) {
    config.withCredentials = true
  }

  return config
}

/**
 * 设置 HTTP Authorization 请求标头
 * @param {*} config
 * @returns config
 */
export const setHeaderAuthorizationHook = (config) => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}` // 设置 HTTP Authorization 请求标头
  }

  return config
}

/**
 * 设置公共参数
 * @param {*} config
 * @returns config
 */
export const setCommonParamsHook = (config) => {
  const commonParams = {
    // 一些公共参数
  }

  config.params = { ...config.params, ...commonParams }

  return config
}
