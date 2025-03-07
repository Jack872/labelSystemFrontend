import request from '@/utils/request';
// 获取样本集
export async function reqGetDataset(params) {
  return request('/wegismarkapi/datasetStore/getDataSet', {
    method: 'get',
    params,
    skipErrorHandler: true,
  });
}
// 获取样本图片
export async function reqGetDatasetImg(params) {
  return request(`/wegismarkapi/datasetStore/getSampleImageList`, {
    method: 'get',
    params,
    skipErrorHandler: true,
  });
}
// 设置公开
export async function reqSetDatasetStatus(data) {
  return request(`/wegismarkapi/datasetStore/setDatasetStatus`, {
    method: 'post',
    data,
    skipErrorHandler: true,
  });
}
// 删除
export async function reqDelDataset(params) {
  return request(`/wegismarkapi/deleteDataset`, {
    method: 'delete',
    params,
    skipErrorHandler: true,
  });
}
// 下载
export async function reqDownload(params) {
  return request(`/wegismarkapi/datasetStore/download`, {
    method: 'get',
    params,
    skipErrorHandler: true,
    // responseType: 'blob',
  });
}
