import { request } from 'umi';
// 保存地图服务
//   /wegismarkapi/save
export async function reqSaveService(data) {
  return request('/wegismarkapi/mark/saveMarkInfo', {
    method: 'POST',
    data,
    skipErrorHandler: true,
  });
}
// 审核任务
export async function reqAuditTask(data) {
  return request('/wegismarkapi/task/auditTask', {
    method: 'POST',
    data,
    skipErrorHandler: true,
  });
}
// 生成样本
export async function reqGenerateDataset(data) {
  return request('/wegismarkapi/datasetStore/generateDataset', {
    method: 'POST',
    data,
    skipErrorHandler: true,
  });
}
export async function reqExportService(data) {
  return request('/wegismarkapi/maps/export', {
    method: 'POST',
    data,
    responseType: 'blob',
    skipErrorHandler: true,
  });
}

export async function reqUploadShp(body) {
  return request('/wegismarkapi/maps/upload', {
    method: 'POST',
    data: body,
    /* headers: {
      'Content-Type': 'multipart/form-data'
    }, */
  });
}
