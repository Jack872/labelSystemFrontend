import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Button, Form, Input, message, Popconfirm, Tag } from 'antd';
import { reqSaveService, reqExportService, reqAuditTask } from '@/services/map/api';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Fill, Stroke, Style } from 'ol/style';
import 'ol-layerswitcher/dist/ol-layerswitcher.css';
import 'ol/ol.css'; //引入css样式才能起作用，比如tooltips等样式
import Draw, { createBox, createRegularPolygon } from 'ol/interaction/Draw';
import { GeoJSON } from 'ol/format';
import './style.less';
import {Modify, Select, Translate} from 'ol/interaction';
import { CheckOutlined, CloseOutlined, DeleteOutlined, RollbackOutlined } from '@ant-design/icons';
import Uploader from './Uploader';
import { Redirect, Access, useAccess, history, useModel } from 'umi';
import { Decrypt } from '@/utils/utils';
import BasicMap from './components/basicMap';
import useMap from '@/hooks/map/useMap';
import CollectionCreateForm from '@/components/CollectionCreateForm';
import { Collection } from 'ol';
import Polygon from 'ol/geom/Polygon';
export default function () {
  const shapeSelect = useRef();
  const layerSelect = useRef();
  const [showUploader, setShowUploader] = useState(false);
  const [showAuditLoader, setShowAuditLoader] = useState(false);
  const [markSource, setMarkSource] = useState(new VectorSource());
  const [auditFeedback, setAuditFeedback] = useState('');
  const [toolbarState, setToolbarState] = useState({
    drawState: false,
    color: '',
    sourceKey: null,
    markSource: new VectorSource(),
    currentLayer: '',
  });
  const {
    initialState: {
      currentState: { currentUser },
    },
  } = useModel('@@initialState');
  //挂载地图并定位服务 hook
  const { typeList, taskInfo, setMap, mapRef, markGeoJsonArr, mapExtent } = useMap();
  const access = useAccess(); // access 实例的成员: canAdmin, canUser
  let select;
  useEffect(async () => {
    // 遍历设定方案动态添加图层
    //用户标注此处不生效，审核时生效
    for (const vector of generateMarkLayer) {
      vector.setZIndex(99);
      mapRef.current.addLayer(vector);
      console.log('添加图层');
      console.log(vector);

    }
  }, [markGeoJsonArr]);
  useEffect(async () => {
    // 当前选择的数据源
    const currentSelectSource = toolbarState.markSource;
    // 添加绘制效果
    let shapeDraw
    const addDrawInteraction = () => {
      let value = shapeSelect.current.value;
      let geometryFunction;
      switch (value) {
        // 正方形
        case 'Square':
          value = 'Circle';
          geometryFunction = createRegularPolygon(4);
          break;
        // 矩形
        case 'Box':
          value = 'Circle';
          geometryFunction = createBox();
          break;
        // 多边形
        case 'Polygon':
          value = 'Polygon';
          break;
      }
      shapeDraw = new Draw({
        source: currentSelectSource,
        type: value,
        geometryFunction: geometryFunction,
      });
      console.log('标注的数据源');
      console.log(currentSelectSource);

      // shapeDraw.on('drawend', function (event) {
      //   var feature = event.feature;
      //   var polygon = feature.getGeometry();
      //   var coords = polygon.getCoordinates()[0];
      //   var squareCoords = [
      //     coords[0],
      //     [coords[0][0], coords[1][1]],
      //     coords[1],
      //     [[coords[1][0], coords[0][1]], coords[0]],
      //   ];
      //   console.log(squareCoords);
      //   // var square = new Polygon([squareCoords]);
      //   // feature.setGeometry(square);
      // });
      shapeDraw.on('drawend', (event) => {
        // 获取绘制的矩形
        const geometry = event.feature.getGeometry();
        // 获取矩形的坐标
        const coordinates = geometry.getExtent();
        // 获取地图分辨率
        const resolution = mapRef.current.getView().getResolution();
        // 获取像素坐标
        // const pixelCoordinates = coordinates.map((coordinate) => {
        //   return mapRef.current.getPixelFromCoordinate(coordinate).map(Math.round);
        // });
        // // 计算像素矩形框
        // const left = Math.min(pixelCoordinates[0][0], pixelCoordinates[2][0]);
        // const right = Math.max(pixelCoordinates[0][0], pixelCoordinates[2][0]);
        // const top = Math.min(pixelCoordinates[0][1], pixelCoordinates[2][1]);
        // const bottom = Math.max(pixelCoordinates[0][1], pixelCoordinates[2][1]);
        // console.log(`像素矩形框: 左: ${left}, 右: ${right}, 上: ${top}, 下: ${bottom}`);
      });
      mapRef.current.addInteraction(shapeDraw);
    };
    // 添加绘制的交互
    select = new Select({
      layers: [toolbarState.currentLayer],
    });
    const translate = new Translate({
      features: new Collection([toolbarState.currentLayer]),
    });
    mapRef.current?.addInteraction(translate);

    mapRef.current?.addInteraction(select);
    const modify = new Modify({ source: toolbarState.markSource });
    //查看修改后的feature信息
    modify.on('modifyend', (event) => {
      // 获取绘制的矩形
      const feature = event.features;

    });
    //对绘制图形进行修改
    mapRef.current?.addInteraction(modify);
    // 标注形状选择
    const onSelect = () => {
      mapRef.current.removeInteraction(shapeDraw);
      mapRef.current.removeInteraction(modify);
      if (shapeSelect.current.value != 'None') {
        addDrawInteraction();
        mapRef.current.addInteraction(modify);
      }
    };
    if (shapeSelect.current) {
      shapeSelect.current.onchange = onSelect;
    }
    // 按下esc取消绘制
    document.onkeydown = (event) => {
      if (event.key == 'Escape') {
        shapeSelect.current.value = 'None';
        onSelect();
      }
    };
    // 选择编辑图层
    const onLayerSelect = () => {
      const key = layerSelect.current.value;
      if (key != 'None') {
        const type = typeList.data.filter((item) => {
          return item.typeId == key;
        });
        setToolbarState({
          color: type[0].typeColor,
          drawState: false,
          sourceKey: key,
          markSource: currentSource(key),
          currentLayer: currentLayer(key),
        });
      } else {
        setToolbarState({
          color: null,
          drawState: true,
          sourceKey: null,
          markSource: new VectorSource(),
        });
        // mapRef.current.removeInteraction(modify);
      }
      mapRef.current.removeInteraction(shapeDraw);
      shapeSelect.current.value = 'None';
    };
    if (layerSelect.current) {
      layerSelect.current.onchange = onLayerSelect;
    }
  }, [markGeoJsonArr, toolbarState.markSource, mapExtent]);

  let featuresList = []; //绘制的要素集合
  // 遍历生成不同目标图层
  const generateMarkLayer = useMemo(() => {
    // 收集所有标签信息，用于渲染其他用户标注的图层
    const currentUserTagList = taskInfo.data[0].userArr;
    const totalTypeIdArr = [];
    if (currentUserTagList) {
      for (const { typeArr,username } of currentUserTagList) {
        //开始审理的管理员可以看到所有同一任务下的所有用户的标记
        if (currentUser==='admin'){
          totalTypeIdArr.push(...typeArr);
        }
        //非管理员只能看到自己的标记
        else if (username===currentUser){
          totalTypeIdArr.push(...typeArr);
        }
      }
    }
    let vectorLayerArr = [];
    if (totalTypeIdArr.length) {
      //只对当前用户生成标注图形
      vectorLayerArr = totalTypeIdArr.map(({ typeColor, typeName, typeId }) => {
        const typeSource = new VectorSource({
            format:new GeoJSON(),
          projection:"EPSG:3de57"
        });
        typeSource?.set('typeid', typeId);
        for (const item of markGeoJsonArr) {
          if (typeId == item.typeId) {
            let existedFeatures = new GeoJSON().readFeatures(item.markGeoJson);
            let map = existedFeatures.map(existedFeaturesItem=>{
              existedFeaturesItem.set('markId', item.markId);
              return existedFeaturesItem;
            });
            typeSource.addFeatures(map);
          }
        }
        const vectorLayer = new VectorLayer({
          title: typeName,
          source: typeSource,
          style: new Style({
            //填充
            fill: new Fill({
              color: 'rgba(255, 255, 255, 0.2)',
            }),
            //边框
            stroke: new Stroke({
              color: typeColor,
              // color: '#6699ff',
              width: 3,
            }),
          }),
        });
        vectorLayer.set('typeid', typeId);
        return vectorLayer;
      });
    }
    /*// const vectorLayerArr = markGeoJsonArr.map(({ typecolor, typename, typeid, markGeoJson }) => {
    //   const typeSource = new VectorSource();
    //   typeSource?.set('typeid', typeid);
    //   typeSource.addFeatures(new GeoJSON().readFeatures(markGeoJson));
    //   const vectorLayer = new VectorLayer({
    //     title: typename,
    //     source: typeSource,
    //     style: new Style({
    //       //填充
    //       fill: new Fill({
    //         color: 'rgba(255, 255, 255, 0.2)',
    //       }),
    //       //边框
    //       stroke: new Stroke({
    //         color: typecolor,
    //         // color: '#6699ff',
    //         width: 3,
    //       }),
    //     }),
    //   });
    //   vectorLayer.set('typeid', typeid);
    //   return vectorLayer;
    // });
    //#region
    // if (typeList.data) {
    //   vectorLayerArr = typeList.data.map(({ typecolor, typename, typeid }) => {
    //     const typeSource = new VectorSource();
    //     typeSource?.set('typeid', typeid);
    //     for (const item of markGeoJsonArr) {
    //       if (typeid == item.typeid) {
    //         typeSource.addFeatures(new GeoJSON().readFeatures(item.markGeoJson));
    //       }
    //     }
    //     const vectorLayer = new VectorLayer({
    //       title: typename,
    //       source: typeSource,
    //       style: new Style({
    //         //填充
    //         fill: new Fill({
    //           color: 'rgba(255, 255, 255, 0.2)',
    //         }),
    //         //边框
    //         stroke: new Stroke({
    //           color: typecolor,
    //           // color: '#6699ff',
    //           width: 3,
    //         }),
    //       }),
    //     });
    //     vectorLayer.set('typeid', typeid);
    //     return vectorLayer;
    //   });
    // }
    //#endregion*/
    return vectorLayerArr;
  }, [markGeoJsonArr, taskInfo]);
  // 获取当前标注的数据源
  const currentSource = useCallback(
    (typeid) => {
      for (const layer of generateMarkLayer) {
        if (layer.getSource().get('typeid') == typeid) {
          return layer.getSource();
        }
      }
    },
    [generateMarkLayer],
  );
  // 获取当前标注的图层
  const currentLayer = useCallback(
    (typeid) => {
      for (const layer of generateMarkLayer) {
        if (layer.get('typeid') == typeid) {
          //TODO
          return layer;
        }
      }
    },
    [generateMarkLayer],
  );
  // 回滚
  const undo = useCallback(() => {
    try {
      let features = toolbarState.currentLayer.getSource().getFeatures();
      let feature = features.pop();
      if (feature) {
        toolbarState.currentLayer.getSource().removeFeature(feature);
        featuresList.push(feature);
      }
    } catch (error) {
      message.warn('请选择图层');
    }
  }, [toolbarState.currentLayer]);
  // 恢复
  const recover = useCallback(() => {
    let feature;
    feature = featuresList.pop();
    if (feature) {
      toolbarState.currentLayer.getSource().addFeature(feature);
    }
  }, [toolbarState.currentLayer]);
  const getTaskId = useMemo(() => {
    let TASKID = window.sessionStorage.getItem('taskId');
    // let TASKID=taskInfo.data[0].taskname
    let taskId=Decrypt(TASKID)
    return taskId;
  }, []);
  const save = async () => {
    let taskId = getTaskId;
    const jsondataArr = [];
    for (const layer of generateMarkLayer) {
      const features = layer.getSource().getFeatures();
      const typeId = layer.getSource().get('typeid');
      let extentArr = [];
      if (features.length) {
        for (const feature of features) {
          extentArr.push({feature:feature?.getGeometry().getCoordinates(),
            markId:feature?.get('markId')});
        }
      }
      // 矩形顺时针，旋转正方形是以开始的点顺时针，多边形是以开始的点逆时针
      console.log(extentArr, 'extentArr');
      jsondataArr.push({ extentArr, typeId });
    }
    if (jsondataArr.length != 0) {
      // 保存标注结果，传任务id和标注数据
      console.log('保存的数据', { id: Number(taskId), jsondataArr });
      try {
        const hide = message.loading('正在保存');
        let result = await reqSaveService({
          userid: taskInfo.data[0].userArr.filter(({ username }) => username == currentUser)[0]
            .userid,
          id: taskId,
          jsondataArr,
          typeArr: taskInfo.data[0].userArr.filter(({ username }) => username == currentUser)[0]
            .typeArr,
        });
        if (result) {
          hide();
          message.success('保存成功！');
        } else {
          message.error('保存失败！');
        }
      } catch (error) {
        message.error('后台异常，请稍后重试！');
      }
    } else {
      message.warn('不能保存空数据！');
    }
  };
  // 删除要素
  const deleteFeature = useCallback(() => {
    let selectFeasuresList = select.getFeatures().getArray();
    if (selectFeasuresList.length > 0) {
      try {
        selectFeasuresList.forEach((item) => {
          toolbarState.currentLayer.getSource().removeFeature(item);
        });
      } catch (error) {
        message.error('标注未完成！');
      }
    } else {
      message.warn('未标注或未选中图形！');
    }
    select.getFeatures().clear();
  }, [select, toolbarState.currentLayer]);
  // 导出获得数据并发送请求
  const onExport = async (JsonObj) => {
    const hide = message.loading('正在导出样本数据');
    let data = { jsonData: JsonObj };
    try {
      reqExportService(data).then((res) => {
        hide();
        let link = document.createElement('a');
        link.style.display = 'none';
        link.target = '_blank';
        link.href = URL.createObjectURL(res);
        link.download = '标注数据.zip';
        document.body.appendChild(link);
        link.click();
        URL.revokeObjectURL(link.href);
        document.body.removeChild(link);
      });
    } catch (e) {
      hide();
      message.error('导出失败，请稍后重试！');
      return false;
    }
    return true;
  };
  const handleGetShp = (shp) => {
    //直接转化成对象，加入地图，如下
    const importJson = JSON.parse(shp);
    setMarkSource(markSource.addFeatures(new GeoJSON().readFeatures(importJson)));
  };
  // 导出
  const exportFile = useCallback(() => {
    let features = toolbarState.currentLayer.getSource().getFeatures();
    let jsonobj = new GeoJSON().writeFeatures(features);
    if (JSON.parse(jsonobj).features.length != 0) {
      onExport(JSON.parse(jsonobj));
    } else {
      message.warn('不能导出空的数据');
    }
  }, [toolbarState.currentLayer]);
  // 不通过确认
  const confirm = useCallback(() => {
    console.log(11);
  }, []);
  // 通过审核
  const passAudit = useCallback(async () => {
    let taskid = getTaskId;
    try {
      const hide = message.loading('正在提交');
      const result = await reqAuditTask({ taskid, status: 1 });
      if (result.code == 200) {
        hide();
        message.success('提交成功！');
        history.push('/taskmanage');
      } else {
        message.error('提交失败！');
      }
    } catch (error) {
      message.error('后台异常，请稍后重试！');
    }
  }, []);
  const onCreate = useCallback(async ({ auditfeedback }) => {
    let taskid = getTaskId;
    try {
      const hide = message.loading('正在提交');
      const result = await reqAuditTask({ taskid, status: 2, auditfeedback });
      if (result.code == 200) {
        hide();
        message.success('提交成功！');
        history.push('/taskmanage');
      } else {
        message.error('提交失败！');
      }
      setShowAuditLoader(false);
    } catch (error) {
      message.error('后台异常，请稍后重试！');
      setShowAuditLoader(false);
    }
  }, []);
  const onCancel = useCallback(() => {
    setShowAuditLoader(false);
  }, []);
  return (
    <>
      <BasicMap setMap={setMap} />
      <div className="tools">
        <div className="taskInfo">
          任务名称：<span className="taskName">{taskInfo?.data[0].taskname}</span>
          任务类型：<span>{taskInfo?.data[0].type}</span>
        </div>

        {access.canUser ? (
          <>
            <div className="layerSelect">
              当前图层：
              <select className="select" ref={layerSelect} defaultValue={'None'}>
                <option value={'None'}>无</option>
                {/* 遍历标注人员标签方案 */}
                {/* {taskInfo.data[0].userArr &&
                  taskInfo.data[0].userArr[0].typeArr.map((item) => {
                    return (
                      <option value={item.typeid} key={item.typeid}>
                        {item.typename}
                      </option>
                    );
                  })} */}
                {taskInfo.data[0].userArr &&
                  taskInfo.data[0].userArr
                    .filter(({ username }) => username == currentUser)[0]
                    .typeArr.map((item) => {
                      return (
                        <option value={item.typeId} key={item.typeId}>
                          {item.typeName}
                        </option>
                      );
                    })}
              </select>
            </div>
            <Tag color={toolbarState.color} className="tag" />
            <div className="draw">
              标注：
              <select
                disabled={toolbarState.drawState}
                className="select"
                ref={shapeSelect}
                defaultValue={'None'}
              >
                <option value="None">无</option>
                {/* <option value="Point">点</option>
            <option value="LineString">直线</option> */}
                <option value="Box">矩形</option>
                <option value="Square">正方形</option>
                <option value="Polygon">多边形</option>
              </select>
            </div>
            <button id="delete" onClick={deleteFeature}>
              <DeleteOutlined style={{ marginRight: 4 }} />
              删除
            </button>
            <button id="undo" onClick={undo}>
              <RollbackOutlined />
            </button>
            <button id="recover" onClick={recover}>
              <RollbackOutlined className="recover" />
            </button>
            <button onClick={save}>
              <CheckOutlined style={{ marginRight: 4 }} />
              保存
            </button>
          </>
        ) : (
          <>
            <button
              id="passOrNot"
              onClick={() => {
                setShowAuditLoader(true);
              }}
            >
              <CloseOutlined style={{ marginRight: 4 }} />
              不通过
            </button>
            <button id="passOrNot" onClick={passAudit}>
              {' '}
              <CheckOutlined style={{ marginRight: 4 }} />
              通过审核
            </button>
          </>
        )}
        {showAuditLoader && (
          <CollectionCreateForm
            visible={showAuditLoader}
            onCreate={onCreate}
            onCancel={onCancel}
            title="审核反馈"
            formItemList={() => {
              return (
                <Form.Item
                  label="未通过原因"
                  name="auditfeedback"
                  rules={[{ required: true, message: '必须输入未通过原因！' }]}
                >
                  <Input placeholder="边界、框不贴合/标注类别不符..."
                         onChange={(e) => setAuditFeedback(e.target.value)}
                  />
                </Form.Item>
              );
            }}
          />
        )}
        {showUploader && (
          <Uploader
            onUploadStatusChange={(flag) => {
              setShowUploader(flag);
            }}
            getShp={handleGetShp}
          />
        )}
        {/* <button
          className="button"
          id="upload"
          onClick={() => {
            setShowUploader(true);
          }}
        >
          <CloudUploadOutlined style={{ marginRight: 4 }} />
          导入
        </button> */}
        {/* <button className="button" id="export" onClick={exportFile}>
          <ShareAltOutlined style={{ marginRight: 4 }} />
          导出
        </button> */}
      </div>
    </>
  );
}
