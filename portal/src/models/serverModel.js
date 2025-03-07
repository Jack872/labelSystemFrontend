import { reqServiceList } from '@/services/serviceManage/api';
import { message } from 'antd';
import { useState, useCallback, useEffect } from 'react';

export default function useServerModel() {
  const [serverList, setServiceList] = useState([]);
  const getServerList = useCallback(async () => {
    try {
      let result = await reqServiceList();
      //用户列表
      if (result.code===200) {
        setServiceList(result.data);
      }
    } catch (error) {
      message.error('获取服务列表失败！');
      console.log(error);
    }
  });

  // const signin = useCallback((account, password) => {
  // signin implementation
  // setUser(user from signin API)
  // }, []);

  // const signout = useCallback(() => {
  // signout implementation
  // setUser(null)
  // }, []);

  return {
    // user,
    // signin,
    // signout,
    getServerList,
    serverList,
  };
}
