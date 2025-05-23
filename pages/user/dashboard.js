// pages/user/dashboard.js
import { useState, useEffect } from 'react';
import { useRouter }       from 'next/router';
import Layout              from '../../components/Layout';
import { useUserContext }  from '../../lib/UserContext';
import Link                from 'next/link';
import styles              from '../../styles/user-dashboard.module.css';

export default function Dashboard() {
  const router            = useRouter();
  const { user, loading } = useUserContext();
  const [orders, setOrders]     = useState([]);
  const [error, setError]       = useState('');
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (user === null) {
        router.replace('/signin');
      } else if (user.role === 'admin') {
        router.replace('/admin/dashboard');
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && user && user.role === 'user') {
      (async () => {
        try {
          const res = await fetch('/api/orders_api', { credentials: 'include' });
          if (!res.ok) throw new Error();
          const { orders } = await res.json();
          setOrders(orders);
        } catch {
          setError('Failed to load order history');
        } finally {
          setFetching(false);
        }
      })();
    }
  }, [user, loading]);

  if (loading || !user || user.role !== 'user') return null;

  return (
    <Layout>
      <div className={styles.container}>
        <h2>User Dashboard</h2>
        <p style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>
         Welcome back, <strong>{user.name}</strong>!
        </p>
        {fetching && <p>Loading order history…</p>}
        {!fetching && error && <p className={styles.error}>{error}</p>}
        {!fetching && !error && (
          orders.length === 0
            ? <p>No orders yet.</p>
            : <ul className={styles.list}>
                {orders.map(o => (
                  <li key={o.id} className={styles.item}>
                    <div>
                      <strong>Order #{o.id}</strong><br/>
                      Date: {o.createdAt}<br/>
                      Status: {o.status}<br/>
                      Total: ${Number(o.totalPrice).toFixed(2)}
                    </div>
                    <Link href={`/user/order-details?orderId=${o.id}`}>
                      <button className={styles.viewBtn}>View Details</button>
                    </Link>
                  </li>
                ))}
              </ul>
        )}
        <div style={{ textAlign:'center', marginTop:'2rem' }}>
          <Link href="/user/profile">
            <button
              className={styles.manageBtn}
              style={{ marginLeft: '12px' }}
            >
              View Profile
            </button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
