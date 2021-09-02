import { useState, useEffect } from 'react';
import { request } from 'umi';
import { Input, Form, Button } from 'antd';
import { loginSchema, signSchema } from '../../mock/data';
import styles from './index.less';

// login
export default function IndexPage() {
  const [hasAccount, setAccount] = useState(true);
  useEffect(() => {}, []);

  const login = async (params: any) => {
    const res = await request('/user/signin', {
      method: 'post',
      data: params,
    });
    console.log(res);
  };

  const signup = async (params: any) => {
    const res = await request('/user/signup', {
      method: 'post',
      data: params,
    });
    console.log(res);
  };

  return (
    <div className={styles.main}>
      <div className={styles.left} />
      <div className={styles.right}>
        <div className={styles.header}>
          <div className={styles.title}>
            <div className={styles.logo} />
            蜻蜓-文件分发
          </div>
          <div className={styles.i18n}>English</div>
        </div>
        <div className={styles.content}>
          <div className={styles.welcome}>
            {hasAccount ? 'Hello, Welcome to Dragonfly' : 'Sign up'}
          </div>
          <Form
            labelAlign="left"
            layout="vertical"
            onFinish={(v) => {
              if (hasAccount) {
                login(v);
              } else {
                signup(v);
              }
              window.location.assign('/scheduler');
            }}
          >
            {hasAccount
              ? loginSchema.map((sub: any) => {
                  return (
                    <Form.Item
                      label={sub.label}
                      key={sub.name}
                      name={sub.name}
                      {...sub.formprops}
                    >
                      <Input />
                    </Form.Item>
                  );
                })
              : signSchema.map((sub: any) => {
                  return (
                    <Form.Item
                      label={sub.label}
                      key={sub.name}
                      name={sub.name}
                      {...sub.formprops}
                    >
                      <Input />
                    </Form.Item>
                  );
                })}
            {hasAccount ? (
              <div className={styles.check}>
                has not Account ?
                <Button type="link" onClick={() => setAccount(false)}>
                  Register
                </Button>
              </div>
            ) : (
              <div className={styles.check}>
                has Account ?
                <Button type="link" onClick={() => setAccount(true)}>
                  Login
                </Button>
              </div>
            )}
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                style={{
                  width: '100%',
                }}
              >
                {hasAccount ? 'Login' : 'Register'}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
}
