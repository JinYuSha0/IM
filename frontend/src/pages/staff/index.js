import React, { useState, useEffect } from 'react';
import styles from './index.less';
import UserSideBar from '../../components/UserSideBar'

export default function() {
  const [ users, setUsers ] = useState([]);

  useEffect(() => {
    console.log('didMount');
    return () => {
      console.log('willUnmount');
    }
  });

  return (
    <div className={styles.staffWrapper}>
      <UserSideBar users={users}/>

      <div className={styles.chatRegion}>

      </div>
    </div>
  );
}
