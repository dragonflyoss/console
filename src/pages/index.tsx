import { useState, useEffect } from 'react';
import { request } from 'umi';
import { Input, Form, Button, message, Spin } from 'antd';
import { GithubOutlined, GoogleOutlined } from '@ant-design/icons';
import Cookies from 'js-cookie';
import { decode } from 'jsonwebtoken';
import Particle from '@/components/particle';
import { loginSchema, signSchema } from '../../mock/data';
import styles from './index.less';

const comsKey = {
  password: Input.Password,
  passwordT: Input.Password,
};

// login
const particles = [];
const particleCount = 600;
let tick = 0;
const unit = 30;
const cols = 24;
const rows = 24;
const w = unit * cols;
const h = unit * rows;

export default function IndexPage({ location }) {
  const [hasAccount, setAccount] = useState(true);
  const [loading, setLoading] = useState(true);
  const [oauthInfo, setOauthInfo] = useState({
    hasOauth: false,
    values: {},
  });

  useEffect(() => {
    const userInfo = decode(Cookies.get('jwt'), 'jwt') || {};
    console.log(userInfo);
    if (userInfo.id) {
      // getOauthById(userInfo.id);
      getUserById(userInfo.id);
      //   window.location.assign('/configuration/scheduler-cluster');
    } else {
      setLoading(false);
    }

    // 动效
    const canvas = document.querySelector('#animation-canvas');
    const ctx = canvas.getContext('2d');
    const step = () => {
      if (particles.length < particleCount) {
        particles.push(new Particle(ctx));
      }
      let i = particles.length;
      while (i--) {
        particles[i].step();
      }
      tick++;
    };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      let i = particles.length;
      while (i--) {
        particles[i].draw();
      }
    };
    const requestAnimationFrame =
      window.requestAnimationFrame ||
      ((cb) => {
        setTimeout(cb, 0);
      });
    const loop = () => {
      requestAnimationFrame(loop);
      step();
      draw();
    };
    const init = () => {
      canvas.width = w;
      canvas.height = h;
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineWidth = 2;
      loop();
    };
    init();
  }, []);

  const signin = async (params: any) => {
    const res = await request('/api/v1/users/signin', {
      method: 'post',
      data: params,
    });
    if (res) {
      message.success('Success');
      window.location.assign('/configuration/scheduler-cluster');
    } else {
      message.error('Incorrect authentication credentials');
    }
  };

  const signinByOauth = async (name: string | number) => {
    const res = await request(`/api/v1/user/signin/${name}/callback`, {
      method: 'get',
    });
    if (res) {
      message.success('Success');
      window.location.assign('/configuration/scheduler-cluster');
    } else {
      message.error('Incorrect Oauth');
    }
  };

  const getUserById = async (id: number) => {
    const res = await request(`/api/v1/users/${id}`, {
      method: 'get',
    });
    if (res) {
      signinByOauth(res.name);
    } else {
      message.error('get user info error');
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
    <Spin
      tip="Loading..."
      spinning={loading}
      size="large"
      wrapperClassName={styles.loadingContainer}
    >
      <div className={styles.main}>
        <div className={styles.logo} />
        <div className={styles.left}>
          <canvas
            id="animation-canvas"
            className={styles['animation-canvas']}
          />
        </div>
        <div className={styles.right}>
          <div className={styles.header}>
            <div className={styles.title}>{/* 蜻蜓-文件分发 */}</div>
            {/* <div className={styles.i18n}>简体中文</div> */}
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
              {/* <div className={styles.oauth}>
                <Button
                  type="link"
                  className={styles.newBtn}
                  onClick={() => {
                    window.location.assign(
                      `https://github.com/login/oauth/authorize?client_id=5188822d0fb0d7c149a4&redirect_uri=http://localhost:8000/signin`,
                    );
                    // signinByOauth();
                  }}
                >
                  <GithubOutlined />
                  Github
                </Button>
                <Button
                  type="link"
                  className={styles.newBtn}
                  style={{
                    marginLeft: 16,
                  }}
                >
                  <GoogleOutlined />
                  Google
                </Button>
              </div> */}
              {hasAccount ? (
                <div className={styles.check}>
                  New to Dragonfly ?
                  <Button
                    type="link"
                    onClick={() => {
                      setAccount(false);
                    }}
                  >
                    Create an account.
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
    </Spin>
  );
}
