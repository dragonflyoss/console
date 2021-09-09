import { useState, useEffect } from 'react';
import { request } from 'umi';
import { Input, Form, Button, message } from 'antd';
import Cookies from 'js-cookie';
import { decode } from 'jsonwebtoken';
import { loginSchema, signSchema } from '../../mock/data';
import styles from './index.less';

const comsKey = {
  password: Input.Password,
  passwordT: Input.Password,
};
// login
export default function IndexPage({ location }) {
  const [hasAccount, setAccount] = useState(true);
  useEffect(() => {
    const userInfo = decode(Cookies.get('jwt'), 'jwt') || {};
    if (userInfo.id) {
      window.location.assign('/schedulers');
    }
  }, []);

  const signin = async (params: any) => {
    const res = await request('/api/v1/users/signin', {
      method: 'post',
      data: params,
    });
    if (res) {
      message.success('Success');
      window.location.assign('/schedulers');
    } else {
      message.error('Incorrect authentication credentials');
    }
  };

  const signup = async (params: any) => {
    const res = await request('/api/v1/users/signup', {
      method: 'post',
      data: params,
    });
    if (res) {
      message.success('Success');
      setAccount(true);
    } else {
      message.error('Incorrect');
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
                  const Content = comsKey[sub.name] || Input;
                  return (
                    <Form.Item
                      label={sub.label}
                      key={sub.name}
                      name={sub.name}
                      {...sub.formprops}
                    >
                      <Content />
                    </Form.Item>
                  );
                })
              : signSchema.map((sub: any) => {
                  const Content = comsKey[sub.name] || Input;
                  return (
                    <Form.Item
                      label={sub.label}
                      key={sub.name}
                      name={sub.name}
                      {...sub.formprops}
                    >
                      <Content />
                    </Form.Item>
                  );
                })}
            {hasAccount ? (
              <div className={styles.check}>
                Have not account ?
                <Button
                  type="link"
                  onClick={() => {
                    setAccount(false);
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
                    setAccount(true);
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
