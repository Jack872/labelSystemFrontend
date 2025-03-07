import { PageContainer } from '@ant-design/pro-layout';
import { ProTable } from '@ant-design/pro-table';
import { useModel, history } from 'umi';
import { useRef } from 'react';
import { reqGetTaskList, reqStartMark, reqSubmitTask } from '@/services/taskManage/api.js';
import { Button, message, Popconfirm, Tag, Tooltip } from 'antd';
import { Encrypt, jumpRoutesInNewPage } from '@/utils/utils';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExpandOutlined,
  InfoCircleOutlined,
  MinusCircleOutlined,
  SendOutlined,
  UserOutlined,
} from '@ant-design/icons';

const Category = () => {
  const actionRef = useRef();
  // 多重解构获取当前用户名称
  const {
    initialState: {
      currentState: { currentUser },
    },
  } = useModel('@@initialState');
  const columns = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'indexBorder',
      width: '5%',
      search: false,
      editable: false,
      align: 'center',
      valueType: 'indexBorder',
    },
    {
      disable: true,
      title: '任务名称',
      dataIndex: 'taskname',
      key: 'taskname',
      ellipsis: false,
      // width: '13%',
      align: 'center',
      formItemProps: {
        rules: [
          {
            required: true,
            message: '此项为必填项',
          },
        ],
      },
    },
    {
      title: '受理人',
      dataIndex: 'userArr',
      // width: '12%',
      key: 'useArr',
      align: 'center',
      ellipsis: false,
      render: (_, { userArr }) => {
        return userArr.map(({ userid, username, id }) => {
          return (
            <Tag key={userid} style={{ fontSize: 14 }}>
              <UserOutlined key={id} />
              {username}
            </Tag>
          );
        });
      },
    },
    {
      title: '标注类型',
      dataIndex: 'type',
      valueType: 'select',
      key: 'type',
      ellipsis: false,
      align: 'center',
      search: false,
      formItemProps: {
        rules: [
          {
            required: true,
            message: '此项为必填项',
          },
        ],
      },
      fieldProps: {
        options: [
          {
            label: '目标检测',
            value: '目标检测',
          },
          {
            label: '地物分类',
            value: '地物分类',
          },
        ],
      },
    },
    {
      disable: true,
      // width: '20%',
      align: 'center',
      title: '底图服务',
      ellipsis: false,
      dataIndex: 'mapserver',
      key: 'mapserver',
      search: false,
      editable: false,
    },
    {
      // width: '20%',
      align: 'center',
      title: '任务期限区间',
      dataIndex: 'daterange',
      key: 'daterange',
      ellipsis: false,
      valueType: 'dateRange',
      search: false,
      formItemProps: {
        rules: [
          {
            required: true,
            message: '此项为必填项',
          },
        ],
      },
    // 自定义渲染逻辑，这里假设后端返回的是逗号分隔的字符串
    renderText: (val) => (typeof val === 'string' ? val.split(' ') : val),
    },
    {
      align: 'center',
      title: '状态',
      width: 120,
      key: 'status',
      dataIndex: 'status',
      render: (_, record) => {
        let color, text, icon;
        switch (record.status) {
          case 0:
            text = '审核中';
            color = 'processing';
            icon = <ClockCircleOutlined />;
            break;
          case 1:
            text = '审核通过';
            color = 'success';
            icon = <CheckCircleOutlined />;
            break;
          case 2:
            text = '审核未通过';
            color = 'error';
            icon = <CloseCircleOutlined />;
            break;
          case 3:
            text = '未提交';
            color = '#BDBDBD';
            icon = <MinusCircleOutlined />;
            break;
          default:
            break;
        }
        return (
          <div>
            <Tag color={color} icon={icon} key={'status'} style={{ display: 'inline-block' }}>
              {text == '审核未通过' ? <Tooltip title={record.auditfeedback}>{text}</Tooltip> : text}
            </Tag>
          </div>
        );
      },
    },
    {
      disable: true,
      title: '审核反馈',
      dataIndex: 'auditfeedback',
      key: 'auditfeedback',
      ellipsis: false,
      // width: '13%',
      align: 'center',
      formItemProps: {
        rules: [
          {
            required: true,
            message: '此项为必填项',
          },
        ],
      },
    },
    {
      title: '操作',
      width: '20%',
      align: 'center',
      dataIndex: 'unitid',
      key: 'option',
      valueType: 'option',
      render: (text, record, index, action) => [
        <Button
          onClick={async () => {
            let taskId = Encrypt(record.taskid);
            try {
              window.sessionStorage.setItem('taskId', taskId);
              jumpRoutesInNewPage(`/map`);
            } catch (error) {
              message.error('底图服务加载失败或不存在');
            }
          }}
          key="startDraw"
          disabled={record.status <= 1}
        >
          <ExpandOutlined /> 开始标注
        </Button>,
        <Popconfirm
          title="提交审核中将无法修改"
          disabled={record.status <= 1}
          onConfirm={async () => {
            try {
              const { taskid } = record;
              const result = await reqSubmitTask({ taskid });
              if ((result.code = 200)) {
                message.success('提交成功！');
              }
              actionRef.current.reload();
            } catch (error) {
              message.error('提交失败，请联系管理员！');
            }
          }}
          okText="Yes"
          cancelText="No"
        >
          <Button type="primary" key="submit" disabled={record.status <= 1}>
            <SendOutlined />
            提交任务
          </Button>
        </Popconfirm>,
      ],
    },
  ];
  return (
    <PageContainer>
      <ProTable
        columns={columns}
        actionRef={actionRef}
        request={(params) => {
          return reqGetTaskList({ userArr: currentUser, ...params });
        }}
        rowKey="taskid"
        search={{
          labelWidth: 'auto',
        }}
        pagination={{
          pageSizeOptions: ['5', '10', '15', '20'],
          defaultPageSize: 5,
          showSizeChanger: true,
        }}
        headerTitle="我的任务"
      />
    </PageContainer>
  );
};

export default Category;
