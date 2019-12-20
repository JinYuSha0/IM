import styles from './index.less';
import { Link } from 'umi'

export default function() {
  return (
    <div className={styles.container}>
      <p>
        <Link to={'/user'}>user</Link>
      </p>

      <p>
        <Link to={'/staff'}>staff</Link>
      </p>
    </div>
  );
}
