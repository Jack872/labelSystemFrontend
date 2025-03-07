import { Modal, Form } from 'antd';
// 封装模态框表单
export default ({ visible, onCreate, onCancel, title, formItemList, info }) => {
  const [form] = Form.useForm();
  return (
    <Modal
      open={visible}
      title={title}
      okText="确定"
      cancelText="取消"
      onCancel={onCancel}
      destroyOnClose={true}
      afterClose={() => {
        form.resetFields();
      }}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            form.resetFields();
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
        {formItemList}
      </Form>
    </Modal>
  );
};
