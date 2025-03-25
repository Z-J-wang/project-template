import Api from './config'

// const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL

export default {
  getProduct(data = {}, axiosConfig, errorConfig) {
    const instance = new Api(axiosConfig, errorConfig)

    return instance.get('/test.xlsx', { params: data })
  },
}
