import { useState } from 'react';
import {
  Menu,
  Input,
  Select,
  Checkbox,
  Button,
  Table,
  Pagination,
  Descriptions,
  Divider,
} from 'antd';
import { CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import { clusters, info, tableData } from '../../mock/data';
import styles from './index.less';

const { Search } = Input;
// scheduler
export default function IndexPage() {
  const [isHover, setHover] = useState(0);
  const [checkKeys, setCheck] = useState([]);

  const columns = [
    {
      title: '主机名',
      dataIndex: 'name',
      align: 'left',
      key: 'name',
    },
    {
      title: 'IP',
      dataIndex: 'ip',
      align: 'left',
      key: 'ip',
    },
    {
      title: 'VIP',
      dataIndex: 'vip',
      align: 'left',
      key: 'vip',
    },
    {
      title: 'SN',
      dataIndex: 'sn',
      align: 'left',
      key: 'sn',
    },
    {
      title: 'ServerPort',
      dataIndex: 'serverport',
      align: 'left',
      key: 'serverport',
    },
    {
      title: '操作',
      dataIndex: 'name',
      align: 'left',
      width: '20%',
      render: (t: number, r: any, i: number) => {
        return (
          <div className={styles.operation}>
            <Button type="text">修改</Button>
            <Divider type="vertical" />
            <Button type="text">禁用</Button>
            <Divider type="vertical" />
            <Button type="text">删除</Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className={styles.main}>
      <h1 className={styles.title}>Scheduler配置</h1>
      <div className={styles.content}>
        <div className={styles.left}>
          <Search
            placeholder={'请输入集群名称'}
            style={{
              width: 160,
              marginBottom: 12,
            }}
          />
          <Button
            className={styles.newBtn}
            type="text"
            style={{
              marginRight: 16,
              fontSize: 12,
            }}
          >
            <CopyOutlined />
            添加集群
          </Button>
          <Button
            type="text"
            className={styles.newBtn}
            style={{
              fontSize: 12,
            }}
          >
            <CopyOutlined />
            批量更新
          </Button>
          <div className={styles.clusters}>
            <Checkbox.Group
              style={{ width: '100%' }}
              onChange={(v: any) => {
                setCheck(v);
              }}
            >
              {clusters.map((sub: any) => {
                return (
                  <Checkbox
                    key={sub.value}
                    value={sub.value}
                    onMouseEnter={() => {
                      setHover(sub.value);
                    }}
                    onMouseLeave={() => {
                      setHover(0);
                    }}
                    style={{
                      position: 'relative',
                      width: '100%',
                      margin: 0,
                      height: 32,
                      lineHeight: '32px',
                    }}
                  >
                    {sub.label}
                    {isHover === sub.value ? (
                      <div className={styles.activeButton}>
                        <Button
                          type="text"
                          className={styles.newBtn}
                          style={{
                            marginRight: 4,
                          }}
                        >
                          <CopyOutlined />
                        </Button>
                        <Button type="text" className={styles.newBtn}>
                          <DeleteOutlined />
                        </Button>
                      </div>
                    ) : (
                      <div />
                    )}
                  </Checkbox>
                );
              })}
            </Checkbox.Group>
          </div>
        </div>
        <div className={styles.right}>
          <Descriptions title="属性信息">
            {info.map((sub: any, idx: number) => {
              return (
                <Descriptions.Item
                  label={sub.label}
                  key={idx}
                  labelStyle={{
                    width: '120px',
                  }}
                >
                  {sub.value}
                </Descriptions.Item>
              );
            })}
          </Descriptions>
          {/* <div className={styles.infoTitle}>属性信息</div>
          <div className={styles.info}>
            {info.map((sub, idx) => {
              return (
                <div className={styles.subInfo} key={idx}>
                  <div className={styles.label}>{sub.label}:</div>
                  <div className={styles.value}>{sub.value}</div>
                </div>
              );
            })}
          </div> */}
          <div className={styles.divideLine} />
          <div className={styles.infoTitle}>Scheduler实例</div>
          <Table dataSource={tableData} columns={columns} primaryKey="name" />
          {/* <Pagination
            style={{
              marginTop: 12,
              float: 'right',
            }}
          /> */}
        </div>
      </div>
    </div>
  );
}
