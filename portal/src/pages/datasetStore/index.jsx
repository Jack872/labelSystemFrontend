import { Card, Tabs } from 'antd';
import tabChild from './component/tabChild';
import { useModel } from 'umi';
import { useEffect, useState } from 'react';

export default function datasetStore() {
  const {
    initialState: { currentState },
  } = useModel('@@initialState');
  const [activeKey, setActiveKey] = useState('1');
  // const [first, setfirst] = useState(second);
  const onChange = (key) => {
    setActiveKey(key);
  };
  const items = !currentState.isAdmin
    ? [
        {
          key: '1',
          label: `我的样本集`,
          children: tabChild({ currentState }),
        },
        {
          key: '2',
          label: `共享样本集`,
          children: tabChild({ currentState, ispublic: 1 }),
        },
      ]
    : [
        {
          key: '1',
          label: 'Sample set',
          children: tabChild({ currentState }),
        },
      ];
  return (
    <Card
      style={{
        height: 660,
      }}
      // bordered={false}
    >
      <Tabs activeKey={activeKey} items={items} onChange={onChange} />
    </Card>
  );
}
