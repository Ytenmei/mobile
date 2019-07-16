import axios from 'axios'
import store from '@/store'
import JSONbig from 'json-bigint'
/**
 * axios.create 用于创建一个 axios 实例，该实例和 axios 的功能是一模一样的
 * 说白了就是克隆了一个 axios
 * 为什么要这样做：我们可以拥有多个不同的请求函数，而他们的配置可能是不一样的
 * 例如有些项目中可能会涉及到使用不同的接口路径
 *    http://toutiao.course.itcast.cn
 *    http://a.com
 *    http://b.com
 */
const request = axios.create({
  baseURL: 'http://ttapi.research.itcast.cn/' // 线上接口地址
  // baseURL: 'http://toutiao.course.itcast.cn'
})

request.defaults.transformResponse = [function (data) {
  // data 是未经处理的后端响应数据：JSON 格式字符串
  // Do whatever you want to transform the data

  // JSONbig.parse 类似于 JSON.parse，它的作用也是将 JSON 格式字符串转换为 JavaScript 对象
  // 唯一的区别就是：JSONbig.parse 会检测被转换数据中的数字是否超出了 JavaScript 安全整数范围，如果超出，它会做特殊处理
  // 如果 data 不是一个 JSON 格式字符串，会导致 JSONbig.parse 转换失败并异常
  // 例如我们执行删除操作，后端返回一个 204 状态码，但是没有返回任何数据，也就是空字符串
  // 那这里 JSONbig.parse(空字符串) 就报错了
  // return JSONbig.parse(data)
  try {
    // data 数据可能不是标准的 JSON 格式字符串，否则会导致 JSONbig.parse(data) 转换失败报错
    return JSONbig.parse(data)
  } catch (err) {
    // 无法转换的数据直接原样返回
    return data
  }
}]

// Add a request interceptor
request.interceptors.request.use(function (config) {
  // Do something before request is sent
  const { user } = store.state
  // 如果已登录，则为请求接口同意添加用户 token
  if (user) {
    config.headers.Authorization = `Bearer ${user.token}`
  }
  return config
}, function (error) {
  // Do something with request error
  return Promise.reject(error)
})

// Add a response interceptor
request.interceptors.response.use(function (response) {
  // Do something with response data

  // 如果响应结果对象中有 data，则直接返回这个 data 数据
  // 如果响应结果对象中没有 data，则不作任何处理，直接原样返回这个数据
  return response.data.data || response.data
}, function (error) {
  // Do something with response error
  return Promise.reject(error)
})

export default request
