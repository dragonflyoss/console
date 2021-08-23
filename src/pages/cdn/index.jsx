import { Breadcrumb } from '@alicloudfe/components';
import styles from './index.less';

// config
export default function IndexPage() {
  return (
    <div className={styles.main}>
      <Breadcrumb>
        <Breadcrumb.Item link="/">配置管理</Breadcrumb.Item>
        <Breadcrumb.Item link="/config">CDN配置</Breadcrumb.Item>
      </Breadcrumb>
      <h1 className={styles.title}>CDN配置</h1>
      <div className={styles.content}>
        <div className={styles.left}></div>
        <div className={styles.right}></div>
      </div>
    </div>
  );
}
