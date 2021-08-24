import {
  Menu,
  Input,
  Select,
  Checkbox,
  Button,
  Icon,
  Table,
  Pagination,
} from 'antd';
import styles from './index.less';

const { Search } = Input;
// config
export default function IndexPage() {
  return (
    <div className={styles.main}>
      <h1 className={styles.title}>CDN配置</h1>
      <div className={styles.content}>
        <div className={styles.left}></div>
        <div className={styles.right}></div>
      </div>
    </div>
  );
}
