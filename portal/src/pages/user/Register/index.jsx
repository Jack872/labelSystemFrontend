import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { message, Tabs } from 'antd';
import React, { useState } from 'react';
import { history } from 'umi';
// import { register } from '@/services/ant-design-pro/api';
import styles from './index.less';
import { LoginForm, ProFormText } from '@ant-design/pro-form';
import logo from '@/assets/logo.png';
import logoSVG from '@/assets/LUUlogo.svg';
import { register } from '@/services/register/api';
const Register = () => {
  const [type, setType] = useState('account');

  // 表单提交
  const handleSubmit = async (values) => {
    const { userName, userPassword, checkPassword } = values;
    // 校验
    if (userPassword != checkPassword) {
      message.error('两次输入的密码不一致');
      return;
    }
    try {
      // 注册
      const result = await register({ userName, userPassword });
      if (result) {
        const defaultLoginSuccessMessage = result.message;
        if (result.code != 200) {
          message.error(defaultLoginSuccessMessage);
        } else {
          message.success(defaultLoginSuccessMessage);
          /** 此方法会跳转到 redirect 参数所在的位置 */
          if (!history) return;
          const { query } = history.location;
          history.push({
            pathname: '/user/login',
            query,
          });
          return;
        }
      }
    } catch (error) {
      const defaultLoginFailureMessage = '注册失败，请重试！';
      message.error(defaultLoginFailureMessage);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <LoginForm
          submitter={{
            searchConfig: {
              submitText: '注册',
            },
          }}
          logo={<img alt="logo" src={logoSVG} />}
          title="LUU Platform"
          subTitle={' LUU Platform 是一个遥感样本在线标注平台'}
          initialValues={{
            autoLogin: true,
          }}
          onFinish={async (values) => {
            await handleSubmit(values);
          }}
        >
          <Tabs
            activeKey={type}
            onChange={setType}
            items={[{ label: '账号密码注册', key: 'account' }]}
          >
            {/* // <Tabs.items key="account" tab={'账号密码注册'} /> */}
          </Tabs>
          {type === 'account' && (
            <>
              <ProFormText
                name="userName"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined className={styles.prefixIcon} />,
                }}
                placeholder="请输入账号"
                rules={[
                  {
                    required: true,
                    message: '账号是必填项！',
                  },
                ]}
              />
              <ProFormText.Password
                name="userPassword"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined className={styles.prefixIcon} />,
                }}
                placeholder="请输入密码"
                rules={[
                  {
                    required: true,
                    message: '密码是必填项！',
                  },
                  {
                    min: 3,
                    // type: 'string',
                    message: '长度不能小于 3',
                  },
                ]}
              />
              <ProFormText.Password
                name="checkPassword"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined className={styles.prefixIcon} />,
                }}
                placeholder="请再次输入密码"
                rules={[
                  {
                    required: true,
                    message: '确认密码是必填项！',
                  },
                  //TODO
                  {
                    min: 3,
                    // type: 'string',
                    message: '长度不能小于 3',
                  },
                ]}
              />
            </>
          )}
        </LoginForm>
      </div>
    </div>
  );
};

export default Register;
