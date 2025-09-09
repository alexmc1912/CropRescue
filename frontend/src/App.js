import React, { useState, useEffect, useContext } from 'react';
import Dashboard from './components/Dashboard';
import SurplusForm from './components/SurplusForm';
import Notifications from './components/Notifications';
import ImpactTracker from './components/ImpactTracker';
import Login from './components/Login';
import Register from './components/Register';
import { AuthContext, AuthProvider } from './components/AuthContext';
import BottomNav from './components/BottomNav';
import axios from 'axios';
import './components/styles.css';

function AppContent() {
  const [surplusItems, setSurplusItems] = useState([]);
  const [notification, setNotification] = useState('');
  const [page, setPage] = useState('Dashboard');
  const [showRegister, setShowRegister] = useState(false);

  const { token, userRole, userId, logout } = useContext(AuthContext);

  const fetchSurplusItems = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/surplus/');
      setSurplusItems(res.data);
      // console.log('Surplus Items:', res.data); // Uncomment to debug
    } catch (err) {
      console.error('Failed to fetch surplus items:', err);
    }
  };

  useEffect(() => {
    fetchSurplusItems();
  }, []);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 4000);
  };

  const renderPage = () => {
    switch (page) {
      case 'Dashboard':
        return (
          <main className="app-main">
            <section className="left-panel">
              {token && userRole === 'donator' ? (
                <SurplusForm
                  onSuccess={() => {
                    fetchSurplusItems();
                    showNotification('New surplus item posted!');
                  }}
                />
              ) : token ? (
                <p>
                  Logged in as <strong>{userRole}</strong>. Only donators can post surplus.
                </p>
              ) : (
                <p>Please log in to post surplus.</p>
              )}
              <Notifications message={notification} />
            </section>

            <div className="dashboard-wrapper">
              <section className="right-panel">
                <Dashboard items={surplusItems} refreshItems={fetchSurplusItems} />
              </section>
              <section className="impact-panel">
                <ImpactTracker items={surplusItems} />
              </section>
            </div>
          </main>
        );

      case 'Discover':
        return (
          <main className="app-main">
            <div className="dashboard-wrapper">
              <section className="right-panel">
                <Dashboard items={surplusItems} refreshItems={fetchSurplusItems} />
              </section>
              <section className="impact-panel">
                <ImpactTracker items={surplusItems} />
              </section>
            </div>
          </main>
        );

      case 'Profile':
        return (
          <main className="app-main">
            <section className="right-panel">
              <div className="profile-header">
                <h2>Profile</h2>
                {token && (
                  <button className="logout-button" onClick={logout}>
                    Logout ({userRole})
                  </button>
                )}
              </div>

              {!token ? (
                <>
                  {showRegister ? (
                    <>
                      <Register />
                      <p>
                        Already have an account?{' '}
                        <button className="link-button" onClick={() => setShowRegister(false)}>
                          Login
                        </button>
                      </p>
                    </>
                  ) : (
                    <>
                      <Login />
                      <p>
                        Don't have an account?{' '}
                        <button className="link-button" onClick={() => setShowRegister(true)}>
                          Register
                        </button>
                      </p>
                    </>
                  )}
                </>
              ) : (
                <>
                  <h3>Your History</h3>
                  {surplusItems
                    .filter((item) => {
                      if (userRole === 'donator') return item.donator === userId;
                      if (userRole === 'collector' || userRole === 'volunteer') return item.claimed_by === userId;
                      return false;
                    })
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                    .map((item) => (
                      <div key={item.id} className="surplus-item">
                        <h3>{item.restaurant}</h3>
                        <p>{item.description}</p>
                        <p>Address: {item.address}</p>
                        <p className="quantity">Qty: {item.quantity}</p>
                        <p className="timestamp">
                          {item.picked_up_at
                            ? `Picked up at: ${new Date(item.picked_up_at).toLocaleString()}`
                            : item.claimed_at
                            ? `Claimed at: ${new Date(item.claimed_at).toLocaleString()}`
                            : item.created_at
                            ? `Created at: ${new Date(item.created_at).toLocaleString()}`
                            : item.timestamp
                            ? `Timestamp: ${new Date(item.timestamp).toLocaleString()}`
                            : 'Date unavailable'}
                        </p>
                      </div>
                    ))}

                  {userRole === 'volunteer' && (
                    <p>You’re logged in as a volunteer. Thank you for being part of the community!</p>
                  )}
                </>
              )}
            </section>
          </main>
        );

      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>CropRescue</h1>
        <p>Reducing food waste, one meal at a time.</p>
      </header>

      {renderPage()}

      <BottomNav currentPage={page} onChangePage={setPage} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
