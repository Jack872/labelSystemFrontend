import { Modal, Form, Input, Select, DatePicker } from 'antd';
import moment from 'moment';
import UserTransfer from './UserTransfer';
import { useEffect, useState } from 'react';
const { RangePicker } = DatePicker;

// 封装模态框表单
export default ({
  visible,
  onCreate,
  onCancel,
  renderUserList,
  renderServiceList,
  defaultValue,
  renderTypeList,
}) => {
  const [form] = Form.useForm();
  const [userList, setUserList] = useState([]);
  const [typeList, setTypeList] = useState(renderTypeList);
  const [selectedItems, setSelectedItems] = useState([]);
  const filteredOptions = typeList?.filter(({ typename }) => !selectedItems.includes(typename));
  const [mode, setMode] = useState('');

  let { taskid, taskname, type, mapserver, daterange, userArr } = defaultValue;

  useEffect(() => {
    if (renderTypeList.length) {
      setTypeList(renderTypeList);
    }
    // 设置标签默认值;
    console.log(userArr);
    setUserList(
      userArr?.map(({ username, typeArr }) => {
        return {
          userName: username,
          //只保留数组中的类型名称用于显示
          typestring: typeArr.map(item =>{
            return item.typeName;
          }),
        };
      }),
    );
  }, [renderTypeList]);

  let userArrId = [];
  let defaultUserArr = [];
  if (userArr) {
    // 设置多人初始值
    defaultUserArr = userArr.map(({ username, id }) => {
      userArrId.push(id);
      return username;
    });
  }
  // 转换时间
  if (daterange) {
    daterange=daterange.split(' ');
    daterange = {
      startValue: moment(daterange[0], 'YYYY-MM-DD'),
      endValue: moment(daterange[1], 'YYYY-MM-DD'),
      endOpen: false,
    };
  }
  const onChange = (value) => {
    console.log(`selected ${value}`);
  };
  const onSearch = (value) => {
    console.log('search:', value);
  };
  return (
    <Modal
      open={visible}
      title="任务管理"
      okText="提交"
      cancelText="取消"
      onCancel={onCancel}
      // width={800}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            // form.resetFields();
            onCreate(values);
          })
          .catch((info) => {
            console.log('Validate Failed:', info);
          });
      }}
    >
      <Form
        form={form}
        layout="ho"
        name="form_in_modal"
        initialValues={{
          modifier: 'public',
        }}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 16 }}
      >
        {taskid && (
          <Form.Item
            label="任务id"
            name="taskid"
            hidden={true}
            initialValue={taskid}
            rules={[{ required: true, message: '必须输入任务id！' }]}
          >
            <Input disabled={true} />
          </Form.Item>
        )}
        <Form.Item
          label="任务名称"
          name="taskname"
          initialValue={taskname}
          rules={[{ required: true, message: '必须输入任务名称！' }]}
        >
          <Input placeholder="请输入任务名称" />
        </Form.Item>
        <Form.Item
          label="标注类型"
          name="type"
          initialValue={type}
          rules={[{ required: true, message: '必须选择标注类型！' }]}
        >
          <Select placeholder="请选择标注类型" optionFilterProp="children" onChange={onChange}>
            <Select.Option value="目标检测" key="1">
              目标检测
            </Select.Option>
            <Select.Option value="地物分类" key="2">
              地物分类
            </Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          label="底图服务"
          name="mapserver"
          initialValue={mapserver}
          rules={[{ required: true, message: '必须选择底图服务！' }]}
        >
          <Select
            showSearch
            placeholder="底图服务"
            optionFilterProp="children"
            onChange={onChange}
            onSearch={onSearch}
            filterOption={(input, option) =>
              option.value.toLowerCase().includes(input.toLowerCase())
            }
          >
            {renderServiceList}
          </Select>
        </Form.Item>
        <Form.Item
          label="任务期限"
          name="daterange"
          initialValue={[daterange?.startValue, daterange?.endValue]}
          rules={[{ required: true, message: '必须输入任务期限！' }]}
        >
          <RangePicker
            onChange={(date, dateString) => {
              console.log(date, dateString);
            }}
          />
        </Form.Item>

        {/* <Form.Item
          label="是否多人协同"
          name="isMultiple"
          rules={[{ required: true }]}
          initialValue={false}
        >
          <Select
            placeholder="是否多人协同"
            onChange={(checked) => {
              if (checked) {
                setMode('multiple');
                message.info('多人协同模式下，成员的设定标签不可重复');
              } else {
                setMode('');
                setUserList([]);
              }
            }}
          >
            <Select.Option value={true} key="1">
              是
            </Select.Option>
            <Select.Option value={false} key="2">
              否
            </Select.Option>
          </Select>
        </Form.Item> */}

        <Form.Item
          label="任务受理人"
          name={'userArr'}
          tooltip="多人协同模式下，各成员分配的标签不可重复"
          initialValue={defaultUserArr}
          rules={[{ required: true, message: '必须选择任务受理人！' }]}
        >
          <Select
            showSearch
            mode={'multiple'}
            // mode={mode}
            showArrow
            // value={userList}
            allowClear
            placeholder="请选择任务受理人"
            optionFilterProp="children"
            onChange={(value) => {
              console.log(value);
              // if (mode) {
              //   setUserList(
              //     value.map((item) => {
              //       return { userName: item, typestring: [] };
              //     }),
              //   );
              // }
              setUserList(
                value.map((item) => {
                  return { userName: item, typestring: [] };
                }),
              );
            }}
            onSearch={onSearch}
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
            options={renderUserList}
           />
        </Form.Item>
        {userList?.map(({ userName, typestring }) => {
          return (
            <Form.Item
              key={userName}
              label={userName}
              name={userName}
              initialValue={typestring}
              rules={[{ required: true, message: '必须指定标签！' }]}
            >
              <Select
                mode="multiple"
                showArrow
                allowClear
                value={selectedItems}
                onChange={(value) => {
                  console.log(value);
                  // setSelectedItems(value);
                }}
                options={filteredOptions.map((item) => ({
                  value: item.typeId,
                  label: item.typeName,
                }))}
               />
            </Form.Item>
          );
        })}
        {taskid && (
          <Form.Item
            label="更新id"
            name="userArrId"
            initialValue={userArrId}
            hidden={true}
            rules={[{ required: true, message: '必须选择关系id！' }]}
          >
            <Select
              showSearch
              mode="multiple"
              showArrow
              allowClear
              placeholder="请选择关系id！"
              optionFilterProp="children"
              onChange={onChange}
              onSearch={onSearch}
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
             />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};
