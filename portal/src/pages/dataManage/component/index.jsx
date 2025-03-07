import { Modal } from 'antd';
export default ({ visible, onCancel, title, uploadItem }) => {
  return (
    <Modal open={visible} title={title} onCancel={onCancel} footer={null} destroyOnClose={true}>
      {uploadItem}
    </Modal>
  );
};
