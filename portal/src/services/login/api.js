import request from '@/utils/request';
// 登录
export async function login(data) {
  return request('/wegismarkapi/user/login', {
    method: 'POST',
    data,
  });
}
// 退出登录
export async function outLogin(options) {
  return request('/wegismarkapi/user/outLogin', {
    method: 'POST',
    ...(options || {}),
  });
}
// 获取当前登录状态
export async function currentState() {
  return request('/wegismarkapi/user/currentState', {
    method: 'get',
  });
}
