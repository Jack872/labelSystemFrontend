//引入自定义请求库，方便权限管理
import request from '@/utils/request';
// 获取用户list
export async function reqGetTaskList(params = {}) {
  return request('/wegismarkapi/task/getTaskInfo', {
    method: 'GET',
    params,
  });
}
// 新建任务
export async function reqNewTask(params) {
  return request('/wegismarkapi/task/publishTask', {
    method: 'post',
    data: params,
  });
}
// 删除任务
export async function reqDeleteTask(id) {
  return request(`/wegismarkapi/task/deleteTask/${id}`, {
    method: 'delete',
  });
}
// 修改任务
export async function reqEditTask(params) {
  return request('/wegismarkapi/task/updateTask', {
    method: 'put',
    data: params,
    skipErrorHandler: true,
  });
}
/*// 开始标注请求标注地图服务地图
export async function reqStartMark(id) {
  return request(`/wegismarkapi/task/${id}`, {
    method: 'get',
    skipErrorHandler: true,
    timeout: 6000,
  });
}*/

// 开始标注请求标注地图服务地图
export async function reqStartMark(params = {}) {
  return request(`/wegismarkapi/task/getTaskInfo`, {
    method: 'get',
    params,
    skipErrorHandler: true,
    timeout: 6000,
  });
}
//用户提交任务
export async function reqSubmitTask(data) {
  return request(`/wegismarkapi/task/submitTask`, {
    method: 'post',
    data,
    skipErrorHandler: true,
    timeout: 6000,
  });
}
