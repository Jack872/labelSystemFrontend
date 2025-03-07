import { Drawer } from 'antd';
export default function MyDrawer(props) {
  const { visible, content, onClose } = props;

  return (
    <Drawer title={content.serName} placement="right" onClose={onClose} open={visible} width={600}>
      <div
        style={{
          width: 555,
          height: 400,
          textAlign: 'center',
          // border: '1px solid #ccc',
          overflow: 'hidden',
        }}
      >
        <img
          // src={`http://8.140.162.250:9061/image/tupian/${content.sername}.jpg`}
          src={`http://localhost:3000/image/${content.serName}.jpeg`}
          alt={content.serName}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>
      <p>服务描述：{content.serDesc}</p>
      <p>发布人：{content.publisher}</p>
      <p>地图年份：{content.serYear}</p>
      <p>发布时间：{content.publishTime}</p>
      <p >发布地址：{content.publishUrl}</p>
    </Drawer>
  );
}
