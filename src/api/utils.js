import { ElMessage } from 'element-plus'

/**
 * HTTP请求合并
 * @class MergeRequest
 */
export class MergeRequest {
  constructor() {
    this.requestMap = new Map() // 创建一个Map对象，用于存储请求的键值对
  }

  /**
   * 合并重复请求的通用方法
   * @param {Object} instance - Axios实例对象，用于发起网络请求
   * @param {string} method - HTTP请求方法（get/post/put/delete等）
   * @param {string} url - 请求接口地址
   * @param {Object} data - 请求参数对象（GET请求时自动转为params参数）
   * @param {Object} config - Axios请求配置项（优先级高于axiosConfig）
   * @param {Object} axiosConfig - 基础Axios配置项
   * @returns {Promise} 合并后的Promise对象（已缓存的请求实例或新建的请求）
   */
  merge(instance, method, url, data, config, axiosConfig) {
    // 验证HTTP方法是否合法
    const validMethods = ['get', 'post', 'put', 'delete', 'patch']
    if (!validMethods.includes(method.toLowerCase())) {
      throw new Error(`Invalid HTTP method: ${method}`)
    }

    // 生成唯一缓存键
    const generateCacheKey = (url, data, config, axiosConfig) => {
      const stableStringify = (obj) => JSON.stringify(obj, Object.keys(obj || {}).sort())
      return `${url}-${stableStringify(data)}-${stableStringify(config)}-${stableStringify(axiosConfig)}`
    }

    const key = generateCacheKey(url, data, config, axiosConfig)

    // 检查缓存中是否存在相同请求
    // 使用Map对象来存储正在进行的请求，避免重复请求
    if (this.requestMap.has(key)) {
      // 如果缓存中已经存在相同的请求，则直接返回该请求的Promise对象
      return this.requestMap.get(key)
    } else {
      let promise
      // 根据请求方法类型处理参数格式
      // 对于GET和DELETE请求，参数需要放在params中
      if (['get', 'delete'].includes(method.toLowerCase())) {
        promise = instance[method](url, { params: data, ...config })
      } else {
        // 对于其他请求方法，参数直接放在data中
        promise = instance[method](url, data, config)
      }

      promise.finally(() => {
        this.requestMap.delete(key) // 接口请求完成时删除该键值对
      })

      this.requestMap.set(key, promise) // 将新请求实例存入缓存Map

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
  const rawWhitelist = import.meta.env.VITE_APP_WHITE_LIST || ''
  const whitelist = new Set(
    rawWhitelist
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item),
  )

  // 校验 config.url 是否为有效字符串
  if (typeof config.url !== 'string') {
    console.error('Invalid config.url: Expected a string but got', typeof config.url)
    return config
  }

  // 判断是否在白名单中，使用精确匹配
  const isWhitelisted = Array.from(whitelist).some((item) => {
    const regex = new RegExp(`^${item.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`)
    return regex.test(config.url)
  })

  if (isWhitelisted) config.withCredentials = true // 设置 withCredentials 为 true

  return config
}

/**
 * 设置 HTTP Authorization 请求标头
 * @param {*} config
 * @returns config
 */
export const setHeaderAuthorizationHook = (config) => {
  const AUTH_HEADER = 'Authorization' // 定义头部字段常量
  const BEARER_PREFIX = 'Bearer ' // 定义认证前缀常量

  const token = localStorage.getItem('token')?.trim()
  if (!token || typeof token !== 'string') return config // 提前返回无效情况

  if (!config.headers) config.headers = {}
  let headers = config.headers

  // 仅当不存在时才设置头部
  if (!headers[AUTH_HEADER]) {
    headers[AUTH_HEADER] = `${BEARER_PREFIX}${token}`
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
