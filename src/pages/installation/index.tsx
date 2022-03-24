import { useState, useEffect } from 'react';
import { request, history } from 'umi';
import { Input, Form, Button, message, Steps, Select, Divider } from 'antd';
import { cdnInfo, info, loginSchema } from '../../../mock/data';
import CodeEditor from '@/components/codeEditor';
import styles from './index.less';

const { Step } = Steps;
const comsKey: any = {
  select: Select,
  json: CodeEditor,
  input: Input,
};

export default function Installation({}) {
  const [current, setCurrent] = useState(0);
  const [formInfo, setFormInfo] = useState<any>({});

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
        history.push('/configuration/scheduler-cluster');
      }
    });
  };

  const createClusters = (config: any) => {
    const res = request('/api/v1/cdn-clusters', {
      method: 'post',
      data: config,
    });
    res.then((r) => {
      message.success('Create Success');
      setFormInfo({});
      setCurrent(current + 1);
    });
  };

  const createSchedulerClusters = (config: any) => {
    const res = request('/api/v1/scheduler-clusters', {
      method: 'post',
      data: config,
    });
    res.then((r) => {
      message.success('Create Success');
      setFormInfo({});
      setCurrent(current + 1);
    });
  };

  const signin = async (params: any) => {
    const res = await request('/api/v1/users/signin', {
      method: 'post',
      data: params,
    });
    if (res) {
      message.success('Login Success');
      setFormInfo({});
      setCurrent(current + 1);
    } else {
      message.error('Incorrect authentication credentials');
    }
  };

  const next = () => {
    let temp_scope = formInfo.scopes || {};
    let temp_config = formInfo.config || {};
    let temp_client = formInfo.client_config || {
      load_limit: 100,
    };

    try {
      if (temp_scope && typeof temp_scope === 'string') {
        temp_scope = JSON.parse(formInfo.scopes);
      } else if (temp_config && typeof temp_config === 'string') {
        temp_config = JSON.parse(formInfo.config);
      } else if (temp_client && typeof temp_client === 'string') {
        temp_client = JSON.parse(formInfo.client_config);
      }
    } catch (e) {
      console.log('errors:', e);
    }
    if (current === 0) {
      signin({
        name: 'root',
        password: 'dragonfly',
      });
    } else if (current === 1) {
      createClusters({
        ...formInfo,
        config: temp_config,
      });
    } else if (current === 2) {
      createSchedulerClusters({
        ...formInfo,
        scopes: temp_scope,
        config: temp_config,
        client_config: temp_client,
      });
    } else {
      setCurrent(current + 1);
    }
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  const firstStep = () => {
    return (
      <div className={styles.firstStepContent}>
        <div className={styles.img} />
        <Form
          labelAlign="left"
          prefixCls="custom-form"
          style={{
            padding: 120,
          }}
        >
          {loginSchema.map((sub: any) => {
            const Content = Input;
            return (
              <Form.Item
                label={sub.label}
                key={sub.name}
                name={sub.name}
                prefixCls="custom-form"
                initialValue={sub.name === 'name' ? 'root' : 'dragonfly'}
                colon
              >
                <Content disabled />
              </Form.Item>
            );
          })}
        </Form>
      </div>
    );
  };

  const secondStep = () => {
    return (
      <Form
        labelAlign="left"
        layout="horizontal"
        onValuesChange={(cv, v) => {
          setFormInfo((pre: any) => {
            return {
              ...pre,
              ...cv,
            };
          });
        }}
        prefixCls="custom-form"
      >
        {cdnInfo.map((sub: any) => {
          const Content = comsKey[sub.type || 'input'];
          if (!sub.hide && sub.key !== 'security_group_id') {
            return (
              <Form.Item
                name={sub.key}
                key={sub.key}
                label={sub.en_US}
                {...(sub.formprops || {})}
                prefixCls="custom-form"
                colon
              >
                <Content {...sub.props} />
              </Form.Item>
            );
          }
        })}
      </Form>
    );
  };

  const thirdStep = () => {
    return (
      <Form
        labelAlign="left"
        layout="horizontal"
        onValuesChange={(cv, v) => {
          setFormInfo((pre: any) => {
            return {
              ...pre,
              ...cv,
            };
          });
        }}
        prefixCls="custom-form"
      >
        {info.map((sub: any) => {
          const Content = comsKey[sub.type || 'input'];
          if (
            !sub.hide &&
            sub.key !== 'security_group_id' &&
            sub.key !== 'cdn_cluster_id'
          ) {
            return (
              <Form.Item
                name={sub.key}
                key={sub.key}
                label={sub.en_US}
                {...(sub.formprops || {})}
                prefixCls="custom-form"
                colon
              >
                <Content {...sub.props} />
              </Form.Item>
            );
          }
        })}
      </Form>
    );
  };

  const forthStep = () => {
    return (
      <div className={styles.forthStepContent}>
        <div className={styles.img} />
      </div>
    );
  };

  const steps: any = [
    {
      title: 'First',
      description: 'What Is Dragonfly?',
      content: firstStep(),
      actionContent: (
        <>
          Dragonfly is an intelligent P2P-based image and file distribution
          tool.It aims to improve the efficiency and success rate of file
          transferring, and maximize the usage of network bandwidth, especially
          for the distribution of larget amounts of data, such as application
          distribution, cache distribution, log distribution, and image
          distribution.
          <Divider style={{ background: '#fff' }} />
          <p>Log in with the default account</p>
        </>
      ),
    },
    {
      title: 'Second',
      description: 'Create CDN Cluster',
      content: secondStep(),
    },
    {
      title: 'Third',
      description: 'Create Scheduler Cluster',
      content: thirdStep(),
    },
    {
      title: 'Forth',
      description: 'Validate Dragonfly Console',
      content: forthStep(),
      actionContent: (
        <>
          <p>Please Enter "Done" into Dragonfly Console.</p>
          <p>
            Efficiency: with P2P and CDN technology, reduce image distribution
            time significantly and expedite delivery;
          </p>
          <p>
            Traffic control: with intelligent analysis technology, dynamically
            balance distribution workload and business running, implement
            dynamic traffic control, and guarantee business stability;
          </p>
          <p>
            Security: support HTTPs protocol in private image registry, encrypt
            distribution content, and safeguard data security.
          </p>
        </>
      ),
    },
  ];

  return (
    <div className={styles.main}>
      <div className={styles.stepLogo} />
      {/* <div className={styles.overlop} /> */}
      <div className={styles.stepContainer}>
        <Steps current={current}>
          {steps.map((item: any) => (
            <Step
              key={item.title}
              title={item.title}
              description={item.description}
            />
          ))}
        </Steps>
        <div className={styles.stepFlex}>
          <div className={styles.stepAction}>
            <div className={styles.stepActionTitle}>
              {steps[current].description}
            </div>
            <div className={styles.stepActionContent}>
              {steps[current].actionContent}
            </div>
            {current < steps.length - 1 && (
              <Button
                type="primary"
                onClick={() => next()}
                disabled={!formInfo.name && current !== 0}
              >
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
            {/* {current > 0 && (
              <Button style={{ margin: '8px 0' }} onClick={() => prev()}>
                Previous
              </Button>
            )} */}
          </div>
          <div className={styles.stepContent}>{steps[current].content}</div>
        </div>
      </div>
    </div>
  );
}
