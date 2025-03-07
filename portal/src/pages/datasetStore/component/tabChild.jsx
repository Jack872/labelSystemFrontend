import { Button, Card, Col, Image, Pagination, Popconfirm, Row, Spin, Tag, message } from 'antd';
import '../style.less';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  reqDelDataset,
  reqDownload,
  reqGetDataset,
  reqGetDatasetImg,
  reqSetDatasetStatus,
} from '@/services/dataset/api';
import { DeleteOutlined, DownloadOutlined, ShareAltOutlined } from '@ant-design/icons';
export default function tabChild({
  currentState: { currentUser: username, isAdmin },
  ispublic: isPublic,
}) {
  // 当前样本状态
  const [
    {
      sampleid,
      mapserver,
      taskname,
      type,
      daterange,
      samplename,
      imgArr,
      taskid,
      total,
      userArr,
      ispublic,
    },
    setCurrentSample,
  ] = useState({
    sampleid: null,
  });
  const [sampleArr, setSampleArr] = useState([]);
  const [sampleStatus, setSampleStatus] = useState(ispublic);
  const [pageSize, setPageSize] = useState(32);
  const [current, setCurrent] = useState(1);

  useEffect(async () => {
    console.log('获取样本信息');
    // 获取样本信息
    try {
      const result = await reqGetDataset({ ispublic: isPublic, username, isAdmin });
      if (result.code == 200) {
        setSampleArr(result.data.taskDatasetInfos);
        // 默认点击第一个
        const sampleArr = document.querySelectorAll('.sample');
        sampleArr[0]?.click();
      }
    } catch (error) {
      message.error('样本获取失败，请联系管理员');
      console.log(error);
    }
  }, [isPublic, username, isAdmin]);
  // 点击切换样本
  const changeSample = useCallback(
    async (currentSampleId) => {
      const currentSample = sampleArr.filter(({ sampleid }) => currentSampleId == sampleid);
      const { data } = await reqGetDatasetImg({
        sampleid: currentSampleId,
        pageSize,
        current,
      });
      setCurrentSample({ ...currentSample[0], imgArr: data.imageInfos, total:data.total });
      console.log("用户列表")
      console.log(currentSample)
      console.log(userArr)
      setSampleStatus(currentSample[0].is_public);
    },
    [sampleArr],
  );
  // 分页
  const changePage = useCallback(
    async (page, pageSize) => {
      console.log('分页');
      setCurrent(page);
      const { data } = await reqGetDatasetImg({
        sampleid,
        pageSize,
        current: page,
      });
      setCurrentSample({
        sampleid,
        mapserver,
        taskname,
        type,
        daterange,
        samplename,
        taskid:data.taskDatasetInfos[0].task_id,
        total,
        userArr:data.usernameLists,
        ispublic,
        imgArr: data.imageInfos,
      });
    },
    [
      sampleid,
      pageSize,
      current,
      mapserver,
      taskname,
      type,
      daterange,
      samplename,
      taskid,
      total,
      userArr,
      ispublic,
    ],
  );
  // 设置公开
  const setPublic = useCallback(async (sampleid, ispublic) => {
    console.log('设置状态');
    const result = await reqSetDatasetStatus({ sampleid, ispublic: ispublic ? 1 : 0 });
    if (result.code == 200) {
      message.success('操作成功！');
      setSampleStatus(ispublic);
    }
  }, []);
  console.log('渲染');
  const confirm = useCallback(
    async (sampleid, taskid) => {
      try {
        const result = await reqDelDataset({ taskid, sampleid });
        if (result.code == 200) {
          message.success('删除成功！');
          setSampleArr(sampleArr.filter((item) => item.sampleid != sampleid));
          setCurrentSample({ sampleid: null });
        }
      } catch (error) {
        message.error('删除失败，请联系管理员！');
      }
    },
    [sampleArr],
  );
  const download = async (taskid) => {
    const hide = message.loading('正在请求数据');
    try {
      /*reqDownload({taskId:taskid}).then((res) => {
        hide();
        let link = document.createElement('a');
        link.style.display = 'none';
        link.target = '_blank';
        debugger
        link.href = URL.createObjectURL(res);
        link.download = 'RSCOCO.zip';
        document.body.appendChild(link);
        link.click();
        URL.revokeObjectURL(link.href);
        document.body.removeChild(link);
      });*/
      const result = await reqDownload({taskid});
      if (typeof result.data === 'string') {
        const binaryData = atob(result.data); // 假设data是Base64字符串
        const len = binaryData.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryData.charCodeAt(i);
        }
        const blob = new Blob([bytes], {type: 'application/zip'})
        hide();
        let link = document.createElement('a');
        link.style.display = 'none';
        document.body.appendChild(link);
        link.target = '_blank';
        link.href = URL.createObjectURL(blob);
        link.download = 'RSCOCO.zip';
        link.click();
        URL.revokeObjectURL(link.href);
        document.body.removeChild(link);
      }
    } catch (error) {
      hide();
      message.error('下载失败，请联系管理员');
    }
  };
  return (
    <Row gutter={16}>
      <Col span={4}>
        <Card
          className="card"
          title={'Sample list'}
          headStyle={{ fontSize: 13 }}
          bodyStyle={{ padding: 0 }}
        >
          <div style={{ height: 500, overflowY: 'auto' }}>
            {sampleArr&&sampleArr.length>0
              ? sampleArr.map(({ task_id:taskid, task_name:taskname, sample_names:sampleName, task_type:type, sampleid: sampleId }) => (
                  <div
                    className={sampleid == sampleId ? 'sample currentSample' : 'sample'}
                    onClick={() => {
                      changeSample(sampleId);
                    }}
                    key={taskid}
                  >
                    <div>{taskname}</div>
                    <Tag color={`${type == '目标检测' ? '#2db7f5' : '#87d068'}`}>{type}</Tag>
                  </div>
                ))
              : '暂无数据'}
          </div>
        </Card>
      </Col>
      <Col span={16}>
        <Card
          className="card"
          headStyle={{ fontSize: 13 }}
          bodyStyle={{ padding: 0 }}
          title={'Sample display'}
          extra={
            <div>
              {sampleid && isAdmin ? (
                <span>
                  <span
                    style={{ marginRight: 10, cursor: 'pointer' }}
                    onClick={() => {
                      setPublic(sampleid, !sampleStatus);
                    }}
                  >
                    {' '}
                    <ShareAltOutlined />
                    {sampleStatus ? '下架' : 'publish'}
                  </span>
                  <Popconfirm
                    onConfirm={() => {
                      confirm(sampleid, taskid);
                    }}
                    title="确定要删除吗?"
                    okText="是"
                    cancelText="否"
                  >
                    {' '}
                    <span style={{ marginRight: 10, cursor: 'pointer' }}>
                      <DeleteOutlined />
                      delete
                    </span>
                  </Popconfirm>
                </span>
              ) : (
                ''
              )}
              <span
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  console.log("下载")
                  console.log(sampleArr)
                  //TODO
                  download(sampleArr[0].task_id);
                  // download(taskid);
                }}
              >
                <DownloadOutlined />
                download
              </span>
            </div>
          }
        >
          <div className="container">
            <div
              style={{
                height: 470,
                overflowY: 'auto',
                marginBottom: 10,
                padding: '10px 10px 0 10px',
              }}
            >
              {imgArr ? (
                <Image.PreviewGroup>
                  <Row gutter={[24, 12]}>
                    {imgArr?.map(({ imgSrc, typeName }) => (
                      <Col key={imgSrc} span={3}>
                        <div className="sampleImgContainer">
                          {/* <div className="sampleImg">{sampleImg}</div>
                           */}
                          <Image
                            className="sampleImg"
                            src={`http://localhost:3000/sampleImage?imgsrc=${Number(
                              imgSrc,
                            )}&taskid=${taskid}`}
                          />
                          <p>{typeName}</p>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </Image.PreviewGroup>
              ) : (
                '暂无数据'
              )}
            </div>
            {imgArr && (
              <Pagination
                total={total}
                pageSize={pageSize}
                showSizeChanger={false}
                current={current}
                onChange={changePage}
              />
            )}
          </div>
        </Card>
      </Col>
      <Col span={4}>
        <Card
          className="card"
          title={'Information'}
          bodyStyle={{ padding: 10 }}
          headStyle={{ fontSize: 13 }}
        >
          <div style={{ height: 480 }} className="sampleInfo">
            {userArr ? (
              <section>
                {' '}
                <div>
                  <span>Sample name:</span>
                  <p>{taskname}</p>
                </div>
                <div>
                  <span>Marker:</span>
                  {userArr?.map((item) => (
                    <p key={item}>{item} </p>
                  ))}
                </div>
                <div>
                  <span>Task type:</span>
                  <p>{type}</p>
                </div>
                <div>
                  <span>Image service:</span>
                  <p>{mapserver}</p>
                </div>
                <div>
                  <span>Number of samples:</span>
                  <p>{total}</p>
                </div>
                <div>
                  <span>Sample status:</span>
                  <p>{sampleStatus ? '公开' : 'Unpublished'}</p>
                </div>
              </section>
            ) : (
              '暂无数据'
            )}
          </div>
        </Card>
      </Col>
    </Row>
  );
}
