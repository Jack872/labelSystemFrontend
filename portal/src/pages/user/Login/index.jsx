import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Alert, message, Tabs } from 'antd';
import { useState } from 'react';
import { ProFormText, LoginForm, ProFormCheckbox } from '@ant-design/pro-form';
import { useIntl, history, FormattedMessage, useModel, useAccess, SelectLang, Link } from 'umi';
import { login } from '@/services/login/api';
import styles from './index.less';
import logo from '@/assets/logo.png';
import LUUlogo from '@/assets/LUUlogo.png';
import logoSVG from '@/assets/LUUlogo.svg';
const LoginMessage = ({ content }) => (
  <Alert
    style={{
      marginBottom: 24,
    }}
    message={content}
    type="error"
    showIcon
  />
);

const Login = () => {
  const [userLoginState, setUserLoginState] = useState({});
  const [type, setType] = useState('account');
  const { initialState, setInitialState } = useModel('@@initialState');
  const intl = useIntl();
  const fetchUserInfo = async () => {
    try {
    const userInfo = await initialState?.fetchUserInfo?.();
    if (userInfo) {
      await setInitialState((s) => ({ ...s, currentState: userInfo }));
    }
    } catch (error) {
      console.error("获取用户信息时发生错误:", error);
      // 这里还可以根据实际情况处理错误，比如提示用户、重试等
    }
  };

  const handleSubmit = async (values) => {
    try {
      // 登录
      const result = await login({ ...values });
      // const currentAuthority = 1;
      if (result.data.token) {
        const defaultLoginSuccessMessage = intl.formatMessage({
          id: 'pages.login.success',
          defaultMessage: '登录成功！',
        });
        message.success(defaultLoginSuccessMessage);
        await fetchUserInfo();
        /** 此方法会跳转到 redirect 参数所在的位置 */
        if (!history) return;

        // history.push(currentAuthority == 1 ? '/taskmanage' : '/personalTaskList');
        history.push('/home');
        return;
      } else {
        setUserLoginState(result);
      }
    } catch (error) {
      const defaultLoginFailureMessage = '登录失败，请重试！';
      message.error(defaultLoginFailureMessage);
      console.log(error);
    }
  };

  const { code } = userLoginState;
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.loginform} />
        <LoginForm
          title="LUU Platform"
          logo={<img alt="logo" src={logoSVG} />}
          subTitle={'LUU Platform 是一个遥感样本在线标注平台'}
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
            items={[{ label: '账号密码登录', key: 'account' }]}
           />

          {code === 403 && <LoginMessage content={'账户或密码错误'} />}
          {type === 'account' && (
            <>
              <ProFormText
                name="userName"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined className={styles.prefixIcon} />,
                }}
                placeholder={'请输入账号'}
                // initialValue={'wegis'}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.username.required"
                        defaultMessage="请输入用户名!"
                      />
                    ),
                  },
                ]}
              />
              <ProFormText.Password
                name="userPassword"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined className={styles.prefixIcon} />,
                }}
                // initialValue={'123456'}
                placeholder={'请输入密码'}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.password.required"
                        defaultMessage="请输入密码！"
                      />
                    ),
                  },
                ]}
              />
            </>
          )}
          <div
            style={{
              marginBottom: 24,
            }}
          >
            <ProFormCheckbox noStyle name="autoLogin">
              自动登录
            </ProFormCheckbox>
            <Link
              to="/user/register"
              style={{
                float: 'right',
              }}
            >
              新用户注册
            </Link>
          </div>
        </LoginForm>
      </div>
    </div>
  );
};

export default Login;
