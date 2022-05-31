import { useState } from 'react'
import { request, history } from 'umi'
import { Button, message, Steps, Divider } from 'antd'
import { UserOutlined, SolutionOutlined, SmileOutlined, FormOutlined } from '@ant-design/icons'
import styles from './index.less'

const { Step } = Steps

export default function Installation({}) {
  const [current, setCurrent] = useState(0)

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
        message.success('Processing complete!')
        history.push('/configuration/scheduler-cluster')
      }
    })
  }

  const signin = async (params: any) => {
    const res = await request('/api/v1/users/signin', {
      method: 'post',
      data: params,
    })
    if (res) {
      setCurrent(current + 1)
    } else {
      message.error('Incorrect authentication credentials')
    }
  }

  const next = () => {
    if (current === 0) {
      signin({
        name: 'root',
        password: 'dragonfly',
      })
    }
    setCurrent(current + 1)
  }

  const prev = () => {
    setCurrent(current - 1)
  }

  const boldStyle = {
    color: '#34dd84',
    fontWeight: 'bold',
  }

  const steps: any = [
    {
      title: 'Introduction',
      description: '',
      actionContent: (
        <>
          Dragonfly is an intelligent P2P-based image and file distribution tool.
          <p>
            It aims to improve the efficiency and success rate of file transferring, and maximize the usage of network
            bandwidth, especially for the distribution of larget amounts of data, such as application distribution,
            cache distribution, log distribution, and image distribution.
          </p>
          <Divider style={{ background: '#fff' }} />
          <p>For the first login, please use the default root user account.</p>
          <p>
            username is&nbsp;
            <span style={boldStyle}>root</span>
            &nbsp; and password is&nbsp;
            <span style={boldStyle}>dragonfly</span>.
          </p>
        </>
      ),
    },
    {
      title: 'Create Seed Peer Cluster',
      description: '',
      actionContent: (
        <>
          <p>A seed peer cluster needs to be created in a P2P network.</p>
          <div className={styles.imgBox}>
            <img src={require('@/public/bg_install_03.png')} width={600} height={300} />
          </div>
          The created seed peer cluster id is&nbsp;
          <span style={boldStyle}>1</span>
          . When deploying a seed peer instance, you need to report the seed peer cluster id associated with the seed peer instance, and
          the manager service address.
          <p>
            For details, refer to the two fields&nbsp;
            <span style={boldStyle}>manager.addr</span>&nbsp; and&nbsp;
            <span style={boldStyle}>manager.seedPeerClusterID</span>&nbsp; in the&nbsp;
            <a href="https://d7y.io/docs/reference/configuration/seed-peer/" target="_blank" style={boldStyle}>
              seed peer configuration
            </a>
            .
          </p>
        </>
      ),
    },
    {
      title: 'Create Scheduler Cluster',
      description: '',
      actionContent: (
        <>
          <p>A scheduler cluster needs to be created in a P2P network.</p>
          <div className={styles.imgBox}>
            <img src={require('@/public/bg_install_05.png')} width={800} height={322} />
          </div>
          <p>
            Seed peer instances in the seed peer cluster associated with the scheduler cluster will become the download root node in
            the P2P network. The seed peer cluster field in the scheduler cluster form is the seed peer cluster associated with the
            scheduler clsuter in the P2P network.
          </p>
          <p>
            The created scheduler cluster id is <span style={boldStyle}>1</span>. When deploying a scheduler instance,
            you need to report the scheduler cluster id associated with the scheduler instance, and the manager service
            address. For details, refer to the two fields&nbsp;
            <span style={boldStyle}>manager.addr</span> and
            <span style={boldStyle}>manager.schedulerClusterID</span> in the
            <a href="https://d7y.io/docs/reference/configuration/scheduler/" target="_blank" style={boldStyle}>
              scheduler configuration
            </a>
            .
          </p>
        </>
      ),
    },
    {
      title: 'Welcome to Dragonfly!',
      description: '',
      actionContent: (
        <>
          <p>
            The P2P network basic information is created. You can deploy scheduler, seed peer and dfdaemon, refer to&nbsp;
            <a href="https://d7y.io/docs/" target="_blank" style={boldStyle}>
              getting-start
            </a>
            .
          </p>
          <div className={styles.imgBox}>
            <img
              src={require('@/public/bg_install_04.png')}
              width={700}
              height={436}
              style={{
                padding: 12,
              }}
            />
          </div>
        </>
      ),
    },
  ]

  const icons: any = [<SmileOutlined />, <SolutionOutlined />, <FormOutlined />, <UserOutlined />]

  return (
    <div className={styles.main}>
      <div className={styles.title}>Dragonfly Guide Page</div>
      <Divider style={{ background: '#fff' }} />
      <div className={styles.container}>
        <Steps
          direction="vertical"
          current={current}
          onChange={(v: number) => {
            setCurrent(v)
          }}
          className={styles.stepContainer}
        >
          {steps.map((item: any, idx: number) => (
            <Step
              key={item.title}
              title={
                <div
                  style={{
                    fontSize: 24,
                    color: idx <= current ? '#44bd7a' : '#fff',
                    textShadow: '4px 4px rgb(0 0 0 / 5%)',
                  }}
                >
                  {item.title}
                </div>
              }
              description={item.description}
              icon={icons[idx]}
            />
          ))}
        </Steps>
        <div className={styles.stepFlex}>
          <div className={styles.stepAction}>
            <div className={styles.stepActionTitle}>{steps[current].title}</div>
            <div className={styles.stepActionContent}>{steps[current].actionContent}</div>
            {current < steps.length - 1 && (
              <Button
                type="primary"
                onClick={() => next()}
                style={{
                  width: 300,
                }}
              >
                Next
              </Button>
            )}
            {current === steps.length - 1 && (
              <Button
                type="primary"
                onClick={() => {
                  createConfig()
                }}
                style={{
                  width: 300,
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
          {/* <div className={styles.stepContent}>{steps[current].content}</div> */}
        </div>
      </div>
    </div>
  )
}
