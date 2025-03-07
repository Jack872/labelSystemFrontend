import {
  EditTwoTone,
  DeleteTwoTone,
  UploadOutlined,
  CloudUploadOutlined,
  FolderOpenFilled,
  FolderAddOutlined,
} from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-table';
import { Button, Popconfirm, message, Upload, Form, Input, DatePicker, Progress, Spin } from 'antd';
import { useModel, request } from 'umi';
import { useRef, useState } from 'react';
import {
  reqGetfileData,
  reqPublishVectorData,
  reqDeleteVectorData,
  reqUploadTifs,
  reqUploadSuccess,
  reqEditfileData,
  reqDeleteFileData,
  reqGetLayers,
} from '@/services/dataManage/api';
import { PageContainer } from '@ant-design/pro-layout';
import CollectionCreateForm from '@/components/CollectionCreateForm';
import UploadModal from '../component/index.jsx';
import { getOrgList } from '@/services/orgManage/api.js';
import { set } from 'lodash';
import styles from '../index.less';
import prettyBytes from 'pretty-bytes';
import { getNowTime } from '@/utils/utils.js';
import {
  reqCreateDataStore,
  reqGetFilePath,
  reqPublishTifServer,
  reqTestGeoserver,
  reqTestGeoserver2,
} from '@/services/serviceManage/api.js';

const Category = () => {
  const actionRef = useRef();
  // 控制模态框显示影藏
  const [visible, setVisible] = useState(false); // 发布服务模态框开关
  const [publishState, setPublishState] = useState(false); //发布服务状态
  const [visible2, setVisible2] = useState(false); // 上传文件模态框开关
  const [fileState, setFileState] = useState(false); // 选择文件开关
  const [uploadState, setUploadState] = useState(false); //控制上传等待状态
  const [fileInfo, setFileInfo] = useState({}); //已上传文件信息
  const [formitemList, setFormitemList] = useState({}); //上传模态框
  const [title, setTitle] = useState(''); //模态框标题
  const { initialState } = useModel('@@initialState');
  // 获取当前用户
  const { currentState } = initialState;
  // 获取文件扩展名
  const getFileExt = (fileName) => {
    try {
      return fileName.substr(fileName.lastIndexOf('.') + 1).toLowerCase();
    } catch (err) {
      return '';
    }
  };
  //文件上传配置
  const props = {
    name: 'tiff',
    // action: 'http://localhost:3000/upload-tif',
    withCredentials: true,
    beforeUpload: (file) => {
      console.log(file);
      const isTif = file.type === 'image/tiff';
      if (!isTif) {
        message.error('只能上传TIF文件!');
      }
      const isLt1G = file.size / 1024 / 1024 < 6000;
      if (!isLt1G) {
        message.error('文件大小不能超过6G!');
      }
      if (!isTif || !isLt1G) {
        return false;
      }
      setFileState(true);
      let suffix = getFileExt(file.name);
      setFileInfo({
        file: file,
        name: file.name,
        size: file.size,
        type: suffix,
      });
      return false;
    },
  };
  //生成上传组件
  const generateUploadList = () => {
    return (
      <div>
        <div className={styles.uploader}>
          <div className={styles.uploadIcon}>
            <p>
              <CloudUploadOutlined style={{ fontSize: '4em' }} />
            </p>
            <p>{'导入光学遥感影像数据'}</p>
          </div>
          <div>
            <Upload {...props} showUploadList={false}>
              <Button type="primary">
                <FolderOpenFilled style={{ color: 'white' }} />
                {'选择文件'}
              </Button>
            </Upload>
          </div>
        </div>
        <div className={styles.limit}>只支持上传 EPSG:3857 的 GeoTIFF 文件，且大小不超过6G</div>
      </div>
    );
  };
  //上传文件方法
  const uploadTif = async (index) => {
    // 每一片大小
    const chunkSize = 1024 * 1024 * 20; //20m
    // 文件名称和扩展名
    const [fname, fext] = fileInfo.file.name.split('.');
    // 获取当前片的起始字节
    const start = index * chunkSize;
    if (start > fileInfo.file.size) {
      // 当超出文件大小，停止递归上传
      const result = await reqUploadSuccess({
        fileName: fileInfo.file.name,
        updatetime: getNowTime(),
        size: prettyBytes(fileInfo.size),
      });
      if (result.code) {
        message.success('上传成功！');
        setUploadState(false);
        setFileState(false);
        setVisible2(false);
        actionRef.current.reload();
      }
      return;
    }
    const blob = fileInfo.file.slice(start, start + chunkSize);
    // 为每片进行命名,文件名.分片索引.扩展名
    const blobName = `${fname}.${index}.${fext}`;
    const blobFile = new File([blob], blobName);
    const formData = new FormData();
    formData.append('file', blobFile);
    reqUploadTifs(formData)
      .then((res) => {
        setUploadState(true);
        // eslint-disable-next-line no-param-reassign
        uploadTif(++index);
      })
      .catch((err) => {
        message.error(err);
        setUploadState(false);
        setFileState(false);
        setVisible2(false);
      });
  };
  // 选中文件组件
  const SubmitFormComp = (
    <Spin tip="上传中...请不要关闭页面" size="large" spinning={uploadState}>
      <div className={styles.form}>
        <div className={styles.fileInfo}>
          <div className={styles.choose}>选择的文件：</div>
          <div className={styles.info}>
            <span>
              <FolderAddOutlined />
              <strong> {fileInfo.name}</strong>
            </span>
            <span>{prettyBytes(fileInfo.size || 0)}</span>
          </div>
        </div>
        <Button
          type="primary"
          onClick={() => {
            uploadTif(0);
          }}
        >
          上传
        </Button>
        <Button
          onClick={() => {
            setFileState(false);
          }}
        >
          取消
        </Button>

        {/* {this.state.progress > 0 && <Progress percent={this.state.progress} />} */}
      </div>
    </Spin>
  );

  // 发布服务表单
  const generateFormList = (fileInfo, currentUser) => {
    return (
      <>
        <Form.Item
          label="文件名称"
          name="filename"
          initialValue={fileInfo.fileName}
          rules={[
            { required: true, message: '必须输入文件名称+扩展名！！' },
            {
              // pattern: /^[0-9a-zA-Z._]{1,}$/,
              // pattern: /^[a-zA-Z0-9]+$/,
              pattern: /\w+/,
              message: '文件名不能包含中文或空格！',
            },
            {
              pattern: /.tiff?$/,
              message: '请检查扩展名是否正确！',
            },
          ]}
        >
          <Input placeholder="请输入文件名称" allowClear disabled />
        </Form.Item>
        <Form.Item
          label="服务描述"
          name="serdesc"
          rules={[{ required: true, message: '必须输入服务描述！' }]}
        >
          <Input placeholder="请输入服务描述" />
        </Form.Item>
        <Form.Item
          label="服务年份"
          name="seryear"
          rules={[{ required: true, message: '必须选择年份！', type: 'object' }]}
        >
          <DatePicker
            picker="year"
            onChange={(date, dateString) => {
              console.log(date, dateString);
            }}
          />
        </Form.Item>
        <Form.Item
          label="发布人"
          name="publisher"
          initialValue={currentUser}
          rules={[{ required: true }]}
        >
          <Input disabled />
        </Form.Item>
      </>
    );
  };
  //  表格内容
  const columns = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'indexBorder',
      width: '10%',
      search: false,
      editable: false,
      align: 'center',
      valueType: 'indexBorder',
    },
    {
      disable: true,
      title: '文件名称',
      dataIndex: 'fileName',
      align: 'center',
      ellipsis: true,
      // width: 280,
      formItemProps: {
        rules: [
          {
            required: true,
            message: '此项为必填项',
          },
          {
            // pattern: /^[a-zA-Z0-9]+$/,
            // pattern: /^[a-zA-Z0-9]+$/,
            pattern: /\w+/,
            message: '文件名不能包含中文或空格！',
          },
          {
            pattern: /.tiff?$/,
            message: '扩展名应为 .tif或 .tiff!',
          },
        ],
      },
    },
    {
      title: '修改时间',
      dataIndex: 'updateTime',
      ellipsis: true,
      align: 'center',
      editable: false,
    },
    {
      title: '大小',
      dataIndex: 'size',
      width: 200,
      ellipsis: true,
      align: 'center',
      editable: false,
    },
    {
      title: '状态',
      align: 'center',
      width: 120,
      dataIndex: 'status',
      editable: false,
      valueEnum: {
        0: { text: '未发布', status: 'Default' },
        1: { text: '已发布', status: 'Success' },
      },
    },
    {
      title: '操作',
      valueType: 'option',
      ellipsis: true,
      width: 280,
      align: 'center',
      render: (text, record, index, action) =>
        !record.status
          ? [
              <EditTwoTone
                key="editable"
                onClick={() => {
                  var _a;
                  (_a = action === null || action === void 0 ? void 0 : action.startEditable) ===
                    null || _a === void 0
                    ? void 0
                    : _a.call(action, record.fileid);
                }}
              />,
              <Popconfirm
                title="确定要删除吗？"
                key="delete"
                onConfirm={async () => {
                  try {
                    let result = await reqDeleteFileData(record.fileName);
                    if (result.code) {
                      message.success('删除成功！');
                      actionRef.current.reload();
                    }
                  } catch (error) {
                    message.error('删除失败！');
                  }
                }}
              >
                <DeleteTwoTone twoToneColor="#cd201f" />
              </Popconfirm>,
              <Button
                type="primary"
                size="small"
                key="fabu"
                onClick={async () => {
                  // setFileInfo(record);
                  setFormitemList(generateFormList(record, currentState?.currentUser));
                  setTitle('发布矢量数据');
                  // setOrg(org1.data);
                  setVisible(true);
                }}
              >
                发布
              </Button>,
            ]
          : ['无'],
    },
  ];
  // 可编辑表格设置
  const editable = {
    type: 'multiple',
    // 保存的回调
    onSave: async (key, row, originRow) => {
      console.log(row, originRow);
      try {
        let result = await reqEditfileData({
          ...row,
          originfilename: originRow.filename,
          updatetime: getNowTime(),
        });
        if (result.code == 200) {
          message.success('修改成功！');
          actionRef.current.reload();
        } else if (result.code == 23505) {
          message.error('文件名重复！');
          actionRef.current.reload();
        }
      } catch (error) {
        message.error('修改失败！');
        row = originRow;
        return;
      }
    },
    // 删除的回调
    onDelete: async (_, row) => {
      try {
        let result = await reqDeleteFileData(row.filename);
        if (result.code) {
          message.success('删除成功！');
        }
      } catch (error) {
        message.error('删除失败！');
      }
    },
  };
  // 发布服务请求回调
  const onCreate = async (values) => {
    // 格式化日期，只要年份
    const dateValue = values['seryear'];
    const sername = values['filename'].split('.')[0];

    let time = new Date();
    console.log(time.toLocaleString());
    time =
      time.toLocaleString().split(' ')[0].split('/').join('-') +
      ' ' +
      time.toLocaleString().split(' ')[1];
    values = {
      ...values,
      seryear: dateValue.format('YYYY'),
      publishtime: time,
      sername,
    };
    const hide = message.loading('正在发布', 0);
    // 需要发送四次请求
    try {
      // 第一次请求，获取文件存储路径
      let pathResult = await reqGetFilePath({ filename: values['filename'] });
      // 第二次请求，新建Geoserver仓库
      const createStoreResult = await reqCreateDataStore(sername, pathResult.data);
      //  第三次请求，发布geoserver服务
      let geoResult = await reqTestGeoserver2(sername);
      const geoserverPath='http://localhost:8060'
      // const geoserverPath='http://10.101.240.70:8060'
      let publishUrl=geoserverPath+"/geoserver/rest/workspaces/LUU/coveragestores/"+sername+"/coverages"
      values = {
        ...values,
        publishUrl,
      };
      // 第四次请求，数据库记录服务
      let result = await reqPublishTifServer(values);
      setVisible(false);
      console.log(result);
      if (result) {
        hide();
        actionRef.current.reload();
        message.success('发布成功！');
      } else {
        message.error('当前服务已存在！');
      }
    } catch (error) {
      hide();
      message.error('发布失败，请联系管理员！');
      console.log(error);
      setVisible(false);
      return false;
    }
  };
  return (
    <PageContainer>
      <ProTable
        columns={columns}
        actionRef={actionRef}
        request={reqGetfileData}
        editable={editable}
        rowKey="fileid"
        search={false}
        // options={false}
        pagination={{
          pageSizeOptions: ['8', '12', '16', '20'],
          defaultPageSize: 8,
          showSizeChanger: true,
        }}
        headerTitle="影像数据管理"
        toolBarRender={() => [
          <Button
            key="button"
            icon={<UploadOutlined />}
            type="primary"
            onClick={() => {
              setVisible2(true);
              setFormitemList(generateUploadList());
              setTitle('上传数据');
            }}
          >
            上传
          </Button>,
          /*           <Button
            onClick={async () => {
              const result = await reqTestGeoserver();
              console.log('测试geo', result);
            }}
          >
            后新tif仓库
          </Button>,
          <Button
            onClick={async () => {
              try {
                const result = await reqCreateDataStore('hainan');
                console.log('测试geo', result);
              } catch (error) {
                console.log(error);
              }
            }}
          >
            前端下载图片
          </Button>, */
        ]}
      />
      <UploadModal
        uploadItem={fileState ? SubmitFormComp : formitemList}
        title={'上传文件'}
        visible={visible2}
        onCancel={() => {
          setVisible2(false);
          setFileState(false);
        }}
      />

      <CollectionCreateForm
        formItemList={formitemList}
        title={title}
        visible={visible}
        onCreate={onCreate}
        onCancel={() => {
          setVisible(false);
        }}
      />
    </PageContainer>
  );
};

export default Category;
