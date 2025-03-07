import { ProList } from '@ant-design/pro-components';
import { DeleteTwoTone, CheckCircleOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import { Tag, Popconfirm, Button, Drawer, message, Image } from 'antd';
import { useModel } from 'umi';
import { useState, useEffect, useRef } from 'react';
import { reqServiceList, reqDeleteService, reqDelGeoserver } from '@/services/serviceManage/api';
import MyDrawer from './components/MyDrawer.jsx';
import './css.css';
export default () => {
  const [currentService, setCurrentService] = useState([]);
  const [visible, setVisible] = useState(false);
  const { serverList, getServerList } = useModel('serverModel');
  const actionRef = useRef();
  // 创建变量控制页面重载
  const [total, setTotal] = useState(10); // 重载数据
  const reload = () => {
    setTotal((pre) => pre + 1);
  };
  // 展示预览抽屉
  const showEditModal = (item) => {
    setVisible(true);
    setCurrentService(item);
  };
  useEffect(async () => {
    getServerList();
    // 在此执行发请求
    // try {
    //   let result = await reqServiceList();
    //   //用户列表
    //   if (result.success) {
    //     setServiceList(result.data);
    //     console.log(result.data);
    //   }
    // } catch (error) {
    //   message.error('服务加载失败！');
    //   console.log(error);
    // }
  }, [total]);
  // let data2 = serviceList.map(
  let data2 = serverList.map(
    (item) => {
      return {
        // title: item.sername,
        content: (
          <div style={{ display: 'flex', width: '100%', height: 180 }}>
            <div
              style={{
                width: 350,
                height: '105%',
                border: '1px solid #ccc',
              }}
            >
              <Image
                width={'100%'}
                height={'100%'}
                alt={item.serName}
                src={`http://localhost:3000/image/${item.serName}.jpeg`}
                // src={`http://localhost:8060/geoserver/LUU/wms?service=WMS&version=1.1.0&request=GetMap&layers=LUU%3Aairport&bbox=1.1951082E7%2C3057481.2%2C1.3518959E7%2C3842642.2&width=768&height=384&srs=EPSG%3A3857&styles=&format=image%2Fjpeg`}
                fallback=""
              />
            </div>
            <div style={{ marginTop: 30, marginLeft: 10, flex: 1 }} className="head">
              <p className="servicename">{item.serName}</p>
              <div className="serviceInfo">
                <p>服务描述：{item.serDesc}</p>
                <p>影像年份：{item.serYear}</p>
                <p>发布人：{item.publisher}</p>{' '}
                <p className="publish">发布时间：{item.publishTime}</p>
                <p className="publishUrl">发布地址：...</p>
              </div>

              <div className="delete">
                <Popconfirm
                  title="确定要删除吗？"
                  onConfirm={async () => {
                    try {
                      //TODO 后期再完善，现在先注释
                      /*let result2 = await reqDelGeoserver(item.serName);
                      console.log(result2);*/
                      let result = await reqDeleteService(item.serName);
                      if (result) {
                        message.success('删除成功！');
                        reload();
                      }
                      console.log(item, 'item');
                    } catch (error) {
                      message.error('删除失败!');
                      console.log(error);
                    }
                  }}
                >
                  <DeleteTwoTone twoToneColor="#cd201f" style={{ fontSize: 15 }} />
                </Popconfirm>
              </div>
              <div>
                <Button
                  type="primary"
                  style={{ position: 'absolute', right: 12, bottom: 10 }}
                  onClick={() => {
                    showEditModal(item);
                  }}
                >
                  详情
                </Button>
              </div>
            </div>
          </div>
        ),
      };
    },
    // ],
  );
  return (
    <PageContainer>
      <div
        style={{
          backgroundColor: '#f0f2f5',
          margin: -24,
          padding: 24,
        }}
      >
        <ProList
          pagination={{
            defaultPageSize: 8,
            showSizeChanger: false,
          }}
          showActions="always"
          actionRef={actionRef}
          grid={{ gutter: 16, column: 2 }}
          /* onItem={(record) => {
          return {
            onMouseEnter: () => {
              console.log(record);
            },
            onClick: () => {
              console.log(record);
            },
          };
        }} */
          metas={{
            title: {},
            content: {},
          }}
          headerTitle="服务列表"
          dataSource={data2}
         />
        <MyDrawer
          content={currentService}
          visible={visible}
          onClose={() => {
            setVisible(false);
          }}
        />
      </div>
    </PageContainer>
  );
};
