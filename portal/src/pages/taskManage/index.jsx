import {
  CheckCircleOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  ExpandOutlined,
  MinusCircleOutlined,
  PlusOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import { ProTable, TableDropdown } from '@ant-design/pro-table';
import { useModel } from 'umi';
import { Button, message, Popconfirm, Select, Tag } from 'antd';
import { useRef, useState } from 'react';
import {
  reqGetTaskList,
  reqNewTask,
  reqDeleteTask,
  reqEditTask,
} from '@/services/taskManage/api.js';
// 引入封装的跳转方法
import { Encrypt, jumpRoutesInNewPage } from '@/utils/utils.js';

// 引入封装模态框表单
import CollectionCreateForm from './components/index.jsx';
import { reqGenerateDataset } from '@/services/map/api.js';
// #region

const taskManage = () => {
  const actionRef = useRef();
  // 控制模态框显示影藏
  const [visible, setVisible] = useState(false);
  const [defaultValue, setDefaultValue] = useState({});
  //获取服务列表
  const { serverList, getServerList } = useModel('serverModel');
  const { userList, getUserList } = useModel('userModel');
  const { getTypeInfo, typeList } = useModel('typeModel');

  // 新建参数收集
  const onCreate = async (values) => {
    let { daterange,taskid,taskname,userArr,type,mapserver } = values;
    let requestValues= {};
    //拼接用户名和分配的type
    userArr=userArr.map(item => {
      let userName=item;
      let typeIdArr = values[userName].map(typeItem=>{
        var n = Number(typeItem);
        if (!isNaN(n))
        {
          return typeItem;
        }
        else {
          let typeObj = typeList.find(Obj=>{
            return Obj.typeName===typeItem;
          }
          );
          return typeObj.typeId;
        }
      });
      let typeStr = typeIdArr.join(",");
      return userName+','+typeStr;
    })
    let map = daterange.map(item =>{
      return item.format('YYYY-MM-DD');
    });
    //删除以用户名为key的键值对
    requestValues["daterange"]=map;
    requestValues["taskname"]=taskname;
    requestValues["userArr"]=userArr;
    requestValues["type"]=type;
    requestValues["mapserver"]=mapserver;
    requestValues["taskid"]=taskid;
    values = {
      ...values,
      daterange: [daterange[0].format('YYYY-MM-DD'), daterange[1].format('YYYY-MM-DD')],
    };
    const hide = message.loading('正在添加');
    try {
      let result;
      setVisible(false);
      setDefaultValue({});
      if (taskid) {
        console.log('编辑');
        result = await reqEditTask(requestValues);
      } else {
        result = await reqNewTask(requestValues);
      }
      hide();
      if (result.code == 200) {
        message.success('操作成功！');
        actionRef.current.reload();
      }
    } catch (error) {
      hide();
      message.error('操作失败！');
      // setVisible(false);
      return false;
    }
  };
  // 控制机构列表数据展示
  const newOrEditTask = async () => {
    setVisible(true);
    // 获取用户的名称
    getTypeInfo();
    getUserList({ isAdmin: 0 });
    getServerList();
  };
  const confirm = async (id) => {
    try {
      await reqDeleteTask(id);
      // 修改数据数量，不然会报错
      actionRef.current.pageInfo.total -= 1;
      actionRef.current.reloadAndRest();
      message.success('删除成功！');
    } catch (error) {
      message.error('删除失败！');
    }
  };
  // 新建任务获取机构下拉框
  const renderUserList = userList.map(({ userid, username }) => {
    return {
      value: username,
      label: username,
    };
  });
  // 新建任务获取服务下拉框
  let renderServiceList = serverList.map((service) => {
    return (
      <Select.Option value={service.serName} key={service.serName}>
        {service.serName}
      </Select.Option>
    );
  });
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
      width: '15%',
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
      align: 'center',
      // ellipsis: false,
      render: (_, { userArr }) => {
        return userArr.map(({ userid, username }) => {
          return (
            <Tag key={userid} icon={<UserOutlined />} style={{ fontSize: 14 }}>
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
      width: '10%',
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
      editable: false,
      search: false,
      dataIndex: 'isfinished',
      render: (_, record) => {
        let color, text, icon;
        console.log(record.status)
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
          <Tag color={color} icon={icon}>
            {text}
          </Tag>
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
      width: '10%',
      align: 'center',
      // dataIndex: 'unitid',
      valueType: 'option',
      render: (text, record, index, action) => [
        <a
          key="editable"
          onClick={() => {
            setDefaultValue(record);
            newOrEditTask();
          }}
        >
          编辑
        </a>,
        <Popconfirm
          title="你确定要删除吗?"
          onConfirm={() => {
            confirm(record.taskid);
          }}
          okText="是"
          cancelText="否"
          key={'confirm'}
        >
          <a key="delete">删除</a>
        </Popconfirm>,
        record.status == 1 ? (
          <Button
            type="primary"
            key={'generateDataset'}
            onClick={async () => {
              try {
                const { taskid } = record;
                const hide = message.loading('后台生成样本集中，请稍后查看');
                const result = await reqGenerateDataset({ taskid });
                if (result.code == 200) {
                  hide();
                  message.success('样本已生成，请前往样本库查看！');
                } else if (result.code == 409) {
                  hide();
                  message.info('样本库中已有该样本集');
                } else {
                  hide();
                  message.error('样本生成失败，请联系管理员！');
                }
              } catch (error) {
                message.error('样本生成失败，请联系管理员！');
              }
            }}
          >
            <CheckCircleOutlined />
            生成样本
          </Button>
        ) : (
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
            key="startAudit"
            type="primary"
            disabled={record.status > 1}
          >
            <ExpandOutlined /> 开始审核
          </Button>
        ),
      ],
    },
  ];
  const editable = {
    type: 'multiple',
    // 保存的回调
    onSave: async (key, row, originRow) => {
      console.log("修改");
      console.log(row);
      try {
        let result = await reqEditTask(row);
        if (result) {
          message.success('修改成功！');
          actionRef.current.reload();
        }
      } catch (error) {
        message.error('修改失败,请检查数据是否存在！');
        row = originRow;
        actionRef.current.reload();
        return false;
      }
    },
    onDelete: async (_, row, index, action) => {
      console.log(row.taskid);
      try {
        let result = await reqDeleteTask(row.taskid);
        // 修改数据数量，不然会报错
        actionRef.current.pageInfo.total -= 1;
        actionRef.current.reloadAndRest();
        message.success('删除成功！');
        console.log(actionRef.current);
      } catch (error) {
        message.error('删除失败！');
      }
    },
  };
  return (
    <PageContainer>
      <ProTable
        rowKey="taskid" // 设置唯一标识符
        columns={columns}
        actionRef={actionRef}
        request={reqGetTaskList}
        editable={editable}
        search={{
          labelWidth: 'auto',
        }}
        pagination={{
          pageSizeOptions: ['5', '10', '15', '20'],
          defaultPageSize: 5,
          showSizeChanger: true,
        }}
        headerTitle="任务管理"
        toolBarRender={() => [
          <Button key="button" icon={<PlusOutlined />} type="primary" onClick={newOrEditTask}>
            新建
          </Button>,
        ]}
      />
      {visible && (
        <CollectionCreateForm
          visible={visible}
          defaultValue={defaultValue}
          onCreate={onCreate}
          onCancel={() => {
            setVisible(false);
            setDefaultValue({});
          }}
          renderUserList={renderUserList}
          renderServiceList={renderServiceList}
          renderTypeList={typeList}
        />
      )}
      ,
    </PageContainer>
  );
};

export default taskManage;
