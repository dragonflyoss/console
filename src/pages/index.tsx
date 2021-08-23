import { useState } from 'react';
import {
  Breadcrumb,
  Menu,
  Search,
  Select,
  Checkbox,
  Button,
  Icon,
  Table,
  Pagination,
} from '@alicloudfe/components';
import { clusters, info } from '../../mock/data';
import styles from './index.less';

const { Group: CheckboxGroup } = Checkbox;
const { CheckboxItem, Divider } = Menu;

// scheduler
export default function IndexPage() {
  const [isHover, setHover] = useState(0);
  const [checkKeys, setCheck] = useState([]);
  return (
    <div className={styles.main}>
      <Breadcrumb>
        <Breadcrumb.Item link="/">配置管理</Breadcrumb.Item>
        <Breadcrumb.Item link="/scheduler">Scheduler配置</Breadcrumb.Item>
      </Breadcrumb>
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
            text
            type="primary"
            style={{
              marginRight: 16,
            }}
          >
            <Icon type="add" />
            添加集群
          </Button>
          <Button text type="primary">
            <Icon type="list" />
            批量更新
          </Button>
          <div className={styles.clusters}>
            <Menu className="my-menu">
              {clusters.map((sub) => {
                return (
                  <CheckboxItem
                    key={sub.value}
                    onMouseEnter={() => {
                      setHover(sub.value);
                    }}
                    onMouseLeave={() => {
                      setHover(0);
                    }}
                    checked={checkKeys.indexOf(sub.value) > -1}
                    onChange={(check, e) => {
                      console.log(e, check);
                      // const index = checkKeys.indexOf(v);
                      // if (check && index === -1) {
                      //   setCheck(pre => {
                      //     return pre.push(v);
                      //   });
                      // } else if (!check && index > -1) {
                      //   setCheck(pre => {
                      //     return [
                      //       ...pre.slice(0, index),
                      //       ...pre.slice(index + 1),
                      //     ]
                      //   })
                      // }
                    }}
                  >
                    {sub.label}
                    {isHover === sub.value ? (
                      <div className={styles.activeButton}>
                        <Button text>
                          <Icon type="copy" />
                        </Button>
                        <Button text>
                          <Icon type="ashbin" />
                        </Button>
                      </div>
                    ) : (
                      <div />
                    )}
                  </CheckboxItem>
                );
              })}
            </Menu>
          </div>
        </div>
        <div className={styles.right}>
          <div className={styles.infoTitle}>属性信息</div>
          <div className={styles.info}>
            {info.map((sub) => {
              return (
                <div className={styles.subInfo}>
                  <div className={styles.label}>{sub.label}:</div>
                  <div className={styles.value}>{sub.value}</div>
                </div>
              );
            })}
          </div>
          <div className={styles.divideLine} />
          <div className={styles.infoTitle}>Scheduler实例</div>
          <Table />
          <Pagination />
        </div>
      </div>
    </div>
  );
}
