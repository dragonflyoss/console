import { useState, useEffect } from 'react';
import { request, history } from 'umi';
import { Input, Form, Button, message, Spin, Steps, Select } from 'antd';
import { GithubOutlined, GoogleOutlined } from '@ant-design/icons';
import Cookies from 'js-cookie';
import { decode } from 'jsonwebtoken';
import Particle from '@/components/particle';
import { loginSchema, signSchema, cdnInfo } from '../../mock/data';
import CodeEditor from '@/components/codeEditor';
import styles from './index.less';

const { Step } = Steps;
const comsKey = {
  password: Input.Password,
  passwordT: Input.Password,
  select: Select,
  json: CodeEditor,
  input: Input,
};

// login
const particles: any = [];
const particleCount = 600;
let tick = 0;
const unit = 30;
const cols = 24;
const rows = 24;
const w = unit * cols;
const h = unit * rows;

export default function IndexPage({}) {
  const [hasAccount, setAccount] = useState(true);
  const [loading, setLoading] = useState(true);
  const [oauthInfo, setOauthInfo] = useState({
    hasGithubOauth: false,
    hasGoogleOauth: false,
    githubOauth: {},
    googleOauth: {},
  });
  const [isBoot, setIsBoot] = useState(false);
  const [current, setCurrent] = useState(0);
  const [formInfo, setFormInfo] = useState({});
  const [secGroups, setGroup] = useState([]);

  const formOps = {
    security_group_id: secGroups,
  };

  useEffect(() => {
    getOauth();
    // deleteConfigById(3)
    const userInfo = decode(Cookies.get('jwt'), 'jwt') || {};

    if (userInfo.id) {
      getConfigs();
    }
    setLoading(false);

    // 动效
    const canvas: any = document.querySelector('#animation-canvas');
    const ctx: any = canvas?.getContext('2d');
    if (canvas && ctx) {
      init(canvas, ctx);
    }
  }, []);

  const init = (canvas: any, ctx: any) => {
    canvas.width = w;
    canvas.height = h;
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineWidth = 2;
    loop(ctx);
  };

  const requestAnimationFrame =
    window.requestAnimationFrame ||
    ((cb) => {
      setTimeout(cb, 0);
    });

  const start = Date.now();
  let myReq = undefined;

  const loop = (ctx: any) => {
    myReq = requestAnimationFrame(loop);
    if (myReq > 1000) {
      window.cancelAnimationFrame(myReq);
    }
    if (ctx) {
      step(ctx);
      draw(ctx);
    }
  };

  const step = (ctx: any) => {
    if (particles.length < particleCount) {
      particles.push(new Particle(ctx));
    }
    let i = particles.length;
    while (i--) {
      particles[i].step();
    }
    tick++;
  };

  const draw = (ctx: any) => {
    if (typeof ctx === 'object') {
      ctx?.clearRect(0, 0, w, h);
      let i = particles.length;
      while (i--) {
        particles[i].draw();
      }
    }
  };

  const deleteConfigById = async (id: number) => {
    request(`/api/v1/configs/${id}`, {
      method: 'delete',
    });
  };

  const getConfigs = async () => {
    const res = await request('/api/v1/configs?name=is_boot');
    if (
      res?.length === 0 ||
      (res?.filter((el: any) => el.name === 'is_boot') || [])[0].value === '0'
    ) {
      setIsBoot(true);
    } else if (
      res &&
      (res?.filter((el: any) => el.name === 'is_boot') || [])[0].value === '1'
    ) {
      message.success('Success');
      history.push('/configuration/scheduler-cluster');
    }
  };

  const createConfig = async () => {
    request('/api/v1/configs', {
      method: 'post',
      data: {
        name: 'is_boot',
        value: '1',
        user_id: 1,
      },
    }).then((value: any) => {
      if (value.value === '1') {
        message.success('Processing complete!');
        setIsBoot(false);
      }
    });
  };

  const getSecGroups = async () => {
    const res = await request('/api/v1/security-groups');
    if (res && res.length > 0) {
      setGroup(
        res.map((el: any) => {
          return {
            label: el.name,
            value: el.domain,
          };
        }),
      );
    }
  };

  const signin = async (params: any) => {
    const res = await request('/api/v1/users/signin', {
      method: 'post',
      data: params,
    });
    if (res) {
      getConfigs();
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
      history.push('/configuration/scheduler-cluster');
    } else {
      message.error('Incorrect Oauth');
    }
  };

  const signinByOauthType = (name: string | number) => {
    const res = request(`/api/v1/user/signin/${name}`, {
      method: 'get',
    });
    console.log(res);
    // if (res) {
    //   message.success('Success');
    //   window.location.assign('/configuration/scheduler-cluster');
    // } else {
    //   message.error('Incorrect Oauth');
    // }
  };

  const getOauth = async () => {
    const res = await request('/api/v1/oauth', {
      method: 'get',
    });

    let temp_github = {};
    let temp_google = {};
    let hasGithubOauth = false;
    let hasGoogleOauth = false;

    if (typeof res === 'object') {
      res.forEach((el: any) => {
        if (el.name === 'github') {
          temp_github = el;
          hasGithubOauth = true;
        } else if (el.name == 'google') {
          temp_google = el;
          hasGoogleOauth = true;
        }
      });
    }

    setLoading(false);

    setOauthInfo({
      hasGithubOauth,
      hasGoogleOauth,
      githubOauth: temp_github,
      googleOauth: temp_google,
    });
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

  const next = () => {
    setCurrent(current + 1);
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  const steps = [
    {
      title: 'First',
      description: '',
      content: 'First-content',
    },
    {
      title: 'Second',
      description: 'Create CDN Cluster',
      content: '',
    },
    {
      title: 'Third',
      description: 'Create Scheduler Cluster',
      content: 'Last-content',
    },
    {
      title: 'Forth',
      description: '',
      content: 'Last-content',
    },
  ];

  const createClusters = (config: any) => {
    const res = request('/api/v1/cdn-clusters', {
      method: 'post',
      data: config,
    });
    res.then((r) => {
      message.success('Create Success');
    });
  };

  const createCdnCluster: any = () => {
    return (
      <Form
        labelAlign="left"
        // layout="vertical"
        onValuesChange={(cv, v) => {
          setFormInfo((pre) => {
            return {
              ...pre,
              ...cv,
            };
          });
        }}
      >
        {cdnInfo.map((sub: any) => {
          const Content = comsKey[sub.type || 'input'];
          if (!sub.hide && sub.tab === '1') {
            return (
              <Form.Item
                name={sub.key}
                key={sub.key}
                label={sub.en_US}
                {...(sub.formprops || {})}
              >
                <Content
                  {...sub.props}
                  onClick={() => {
                    if (sub.key === 'security_group_id') {
                      getSecGroups();
                    }
                  }}
                  options={formOps[sub.key] || {}}
                />
              </Form.Item>
            );
          }
        })}
      </Form>
    );
  };

  if (isBoot) {
    return (
      <div className={styles.main}>
        <div className={styles.stepLogo} />
        <div className={styles.overlop} />
        <div className={styles.stepContainer}>
          <Steps current={current}>
            {steps.map((item) => (
              <Step
                key={item.title}
                title={item.title}
                description={item.description}
              />
            ))}
          </Steps>
          <div className={styles.stepContent}>
            {current === 1 && createCdnCluster()}
            {(current !== 1 || current !== 2) && steps[current].content}
          </div>
          <div className={styles.stepAction}>
            {current < steps.length - 1 && (
              <Button type="primary" onClick={() => next()}>
                Next
              </Button>
            )}
            {current === steps.length - 1 && (
              <Button
                type="primary"
                onClick={() => {
                  createConfig();
                }}
              >
                Done
              </Button>
            )}
            {current > 0 && (
              <Button style={{ margin: '0 8px' }} onClick={() => prev()}>
                Previous
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

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
              <div className={styles.oauth}>
                {oauthInfo.hasGithubOauth ? (
                  <Button
                    type="link"
                    className={styles.newBtn}
                    onClick={() => {
                      window.location.assign('/api/v1/users/signin/github');
                    }}
                  >
                    <GithubOutlined />
                    Github
                  </Button>
                ) : null}
                {oauthInfo.hasGoogleOauth ? (
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
                ) : null}
              </div>
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
