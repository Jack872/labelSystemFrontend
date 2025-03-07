import { Avatar, Card, Col, List, Skeleton, Row, Statistic, Tag } from 'antd';
// import { Radar } from '@ant-design/charts';

import { Link, useModel } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import moment from 'moment';
// import EditableLinkGroup from './components/EditableLinkGroup';
import styles from './style.less';
import { useEffect, useState } from 'react';
import { reqGetTaskList } from '@/services/taskManage/api';
import { currentState } from '@/services/login/api';
// import type { ActivitiesType, CurrentUser } from './data.d';
// import { queryProjectNotice, queryActivities, fakeChartData } from './service';

const links = [
  {
    title: '操作一',
    href: '',
  },
  {
    title: '操作二',
    href: '',
  },
  {
    title: '操作三',
    href: '',
  },
  {
    title: '操作四',
    href: '',
  },
  {
    title: '操作五',
    href: '',
  },
  {
    title: '操作六',
    href: '',
  },
];

const PageHeaderContent = ({ currentUser }) => {
  const loading = currentUser && Object.keys(currentUser).length;
  if (!loading) {
    return <Skeleton avatar paragraph={{ rows: 1 }} active />;
  }
  return (
    <div className={styles.pageHeaderContent}>
      <div className={styles.avatar}>
        <Avatar size="large" src={currentUser.avatar} />
      </div>
      <div className={styles.content}>
        <div className={styles.contentTitle}>
          你好，
          {currentUser.name}
          ，祝你开心每一天！
        </div>
        <div>
          {currentUser.title} |{currentUser.group}
        </div>
      </div>
    </div>
  );
};

const ExtraContent = () => (
  <div className={styles.extraContent}>
    <div className={styles.statItem}>
      <Statistic title="项目数" value={56} />
    </div>
    <div className={styles.statItem}>
      <Statistic title="团队内排名" value={8} suffix="/ 24" />
    </div>
    <div className={styles.statItem}>
      <Statistic title="项目访问" value={2223} />
    </div>
  </div>
);

const Workplace = () => {
  const {
    initialState: { currentState },
  } = useModel('@@initialState');
  const [taskList, setTaskList] = useState([]);
  const currentUser = currentState ? currentState.currentUser : '';
  const isAdmin = currentState ? currentState.isAdmin : '';
  useEffect(async () => {
    const result = await reqGetTaskList({ userArr: currentUser, isAdmin });
    if (result.code == 200) {
      setTaskList(result.data);
    }
    console.log(result);
  }, []);
  //   const { loading: projectLoading, data: projectNotice = [] } = useRequest(queryProjectNotice);
  //   const { loading: activitiesLoading, data: activities = [] } = useRequest(queryActivities);
  //   const { data } = useRequest(fakeChartData);

  //   const renderActivities = (item) => {
  //     const events = item.template.split(/@\{([^{}]*)\}/gi).map((key) => {
  //       if (item[key]) {
  //         return (
  //           <a href={item[key].link} key={item[key].name}>
  //             {item[key].name}
  //           </a>
  //         );
  //       }
  //       return key;
  //     });
  //     return (
  //       <List.Item key={item.id}>
  //         <List.Item.Meta
  //           avatar={<Avatar src={item.user.avatar} />}
  //           title={
  //             <span>
  //               <a className={styles.username}>{item.user.name}</a>
  //               &nbsp;
  //               <span className={styles.event}>{events}</span>
  //             </span>
  //           }
  //           description={
  //             <span className={styles.datetime} title={item.updatedAt}>
  //               {moment(item.updatedAt).fromNow()}
  //             </span>
  //           }
  //         />
  //       </List.Item>
  //     );
  //   };
  const titles = [
    'Alipay',
    'Angular',
    'Ant Design',
    'Ant Design Pro',
    'Bootstrap',
    'React',
    'Vue',
    'Webpack',
  ];
  const avatars = [
    'https://gw.alipayobjects.com/zos/rmsportal/WdGqmHpayyMjiEhcKoVE.png', // Alipay
    'https://gw.alipayobjects.com/zos/rmsportal/zOsKZmFRdUtvpqCImOVY.png', // Angular
    'https://gw.alipayobjects.com/zos/rmsportal/dURIMkkrRFpPgTuzkwnB.png', // Ant Design
    'https://gw.alipayobjects.com/zos/rmsportal/sfjbOqnsXXJgNCjCzDBL.png', // Ant Design Pro
    'https://gw.alipayobjects.com/zos/rmsportal/siCrBXXhmvTQGWPNLBow.png', // Bootstrap
    'https://gw.alipayobjects.com/zos/rmsportal/kZzEzemZyKLKFsojXItE.png', // React
    'https://gw.alipayobjects.com/zos/rmsportal/ComBAopevLwENQdKWiIn.png', // Vue
    'https://gw.alipayobjects.com/zos/rmsportal/nxkuOJlFJuAUhzlMTCEe.png', // Webpack
  ];
  const projectNotice = [
    {
      id: 'xxx1',
      title: titles[0],
      logo: avatars[0],
      description: '那是一种内在的东西，他们到达不了，也无法触及的',
      updatedAt: new Date(),
      member: '科学搬砖组',
      href: '',
      memberLink: '',
    },
    {
      id: 'xxx2',
      title: titles[1],
      logo: avatars[1],
      description: '希望是一个好东西，也许是最好的，好东西是不会消亡的',
      updatedAt: new Date('2017-07-24'),
      member: '全组都是吴彦祖',
      href: '',
      memberLink: '',
    },
    {
      id: 'xxx3',
      title: titles[2],
      logo: avatars[2],
      description: '城镇中有那么多的酒馆，她却偏偏走进了我的酒馆',
      updatedAt: new Date(),
      member: '中二少女团',
      href: '',
      memberLink: '',
    },
    {
      id: 'xxx4',
      title: titles[3],
      logo: avatars[3],
      description: '那时候我只会想自己想要什么，从不想自己拥有什么',
      updatedAt: new Date('2017-07-23'),
      member: '程序员日常',
      href: '',
      memberLink: '',
    },
    {
      id: 'xxx5',
      title: titles[4],
      logo: avatars[4],
      description: '凛冬将至',
      updatedAt: new Date('2017-07-23'),
      member: '高逼格设计天团',
      href: '',
      memberLink: '',
    },
    {
      id: 'xxx6',
      title: titles[5],
      logo: avatars[5],
      description: '生命就像一盒巧克力，结果往往出人意料',
      updatedAt: new Date('2017-07-23'),
      member: '骗你来学计算机',
      href: '',
      memberLink: '',
    },
  ];
  return (
    <PageContainer
      content={
        <PageHeaderContent
          currentUser={{
            avatar: 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png',
            name: currentUser,
            userid: '00000001',
            email: 'antdesign@alipay.com',
            signature: '海纳百川，有容乃大',
            title: '交互专家',
            group: '蚂蚁金服－某某某事业群－某某平台部－某某技术部－UED',
          }}
        />
      }
      extraContent={<ExtraContent />}
    >
      <Card
        className={styles.projectList}
        style={{ marginBottom: 24 }}
        title="进行中的项目"
        bordered={false}
        // extra={<Link to="/taskmanage">全部项目</Link>}
        extra={<Link>全部项目</Link>}
        bodyStyle={{ padding: 0 }}
      >
        {taskList.map((item) => (
          <Card.Grid className={styles.projectGrid} key={item.taskid}>
            <Card bodyStyle={{ padding: 0 }} bordered={false}>
              <Card.Meta
                title={
                  <div className={styles.cardTitle}>
                    {/* <Avatar size="small" src={item.logo} /> */}
                    <Link to={'/taskmanage'}>{item.taskname}</Link>
                  </div>
                }
                description={
                  <Tag color={`${item.type == '地物分类' ? '#87d068' : '#108ee9'}`}>
                    {item.type}
                  </Tag>
                }
              />
            </Card>
          </Card.Grid>
        ))}
      </Card>
      {/* <Row gutter={24}>
        <Col xl={16} lg={24} md={24} sm={24} xs={24}>
          <Card
            className={styles.projectList}
            style={{ marginBottom: 24 }}
            title="进行中的项目"
            bordered={false}
            extra={<Link to="/">全部项目</Link>}
            loading={projectLoading}
            bodyStyle={{ padding: 0 }}
          >
            {projectNotice.map((item) => (
              <Card.Grid className={styles.projectGrid} key={item.id}>
                <Card bodyStyle={{ padding: 0 }} bordered={false}>
                  <Card.Meta
                    title={
                      <div className={styles.cardTitle}>
                        <Avatar size="small" src={item.logo} />
                        <Link to={item.href}>{item.title}</Link>
                      </div>
                    }
                    description={item.description}
                  />
                  <div className={styles.projectItemContent}>
                    <Link to={item.memberLink}>{item.member || ''}</Link>
                    {item.updatedAt && (
                      <span className={styles.datetime} title={item.updatedAt}>
                        {moment(item.updatedAt).fromNow()}
                      </span>
                    )}
                  </div>
                </Card>
              </Card.Grid>
            ))}
          </Card>
          <Card
            bodyStyle={{ padding: 0 }}
            bordered={false}
            className={styles.activeCard}
            title="动态"
            loading={activitiesLoading}
          >
            <List<ActivitiesType>
              loading={activitiesLoading}
              renderItem={(item) => renderActivities(item)}
              dataSource={activities}
              className={styles.activitiesList}
              size="large"
            />
          </Card>
        </Col>
        <Col xl={8} lg={24} md={24} sm={24} xs={24}>
          <Card
            style={{ marginBottom: 24 }}
            title="快速开始 / 便捷导航"
            bordered={false}
            bodyStyle={{ padding: 0 }}
          >
            <EditableLinkGroup onAdd={() => {}} links={links} linkElement={Link} />
          </Card>
          <Card
            style={{ marginBottom: 24 }}
            bordered={false}
            title="XX 指数"
            loading={data?.radarData?.length === 0}
          >
            <div className={styles.chart}>
              <Radar
                height={343}
                data={data?.radarData || []}
                angleField="label"
                seriesField="name"
                radiusField="value"
                area={{
                  visible: false,
                }}
                point={{
                  visible: true,
                }}
                legend={{
                  position: 'bottom-center',
                }}
              />
            </div>
          </Card>
          <Card
            bodyStyle={{ paddingTop: 12, paddingBottom: 12 }}
            bordered={false}
            title="团队"
            loading={projectLoading}
          >
            <div className={styles.members}>
              <Row gutter={48}>
                {projectNotice.map((item) => (
                  <Col span={12} key={`members-item-${item.id}`}>
                    <Link to={item.href}>
                      <Avatar src={item.logo} size="small" />
                      <span className={styles.member}>{item.member}</span>
                    </Link>
                  </Col>
                ))}
              </Row>
            </div>
          </Card>
        </Col>
      </Row> */}
    </PageContainer>
  );
};

export default Workplace;
