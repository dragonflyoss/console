import { useState, useEffect } from 'react';
import { request } from 'umi';
import { Input, Form, Button } from 'antd';
import { loginSchema, signSchema } from '../../mock/data';
import styles from './index.less';

// login
export default function IndexPage({ location }) {
  const [hasAccount, setAccount] = useState(true);
  useEffect(() => {
    if (location.pathname.includes('up')) {
      setAccount(false);
    }
  }, [location.pathname]);

  const signin = async (params: any) => {
    const res = await request('/user/signin', {
      method: 'post',
      data: params,
    });
    if (res) {
      // window.location.assign('/scheduler');
    }
  };

  const signup = async (params: any) => {
    const res = await request('/user/signup', {
      method: 'post',
      data: params,
    });
    if (res) {
      window.location.assign('/signin');
    }
  };

  return (
    <div className={styles.main}>
      {/* <div className={styles.left} /> */}
      <div className={styles.right}>
        <div className={styles.header}>
          <div className={styles.title}>{/* 蜻蜓-文件分发 */}</div>
          {/* <div className={styles.i18n}>简体中文</div> */}
        </div>
        <div className={styles.content}>
          <div className={styles.logo} />
          <div className={styles.welcome}>
            {hasAccount ? 'Hello, Welcome to Dragonfly' : 'Sign up'}
          </div>
          <Form
            labelAlign="left"
            layout="vertical"
            onFinish={(v) => {
              if (hasAccount) {
                signin(v);
              } else {
                signup(v);
              }
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
                Have not account ?
                <Button
                  type="link"
                  onClick={() => {
                    window.location.assign('/signup');
                  }}
                >
                  Sign Up
                </Button>
              </div>
            ) : (
              <div className={styles.check}>
                Already have an account ?
                <Button
                  type="link"
                  onClick={() => {
                    window.location.assign('/signin');
                  }}
                >
                  Sign In
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
                {hasAccount ? 'Sign In' : 'Sign Up'}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
}
