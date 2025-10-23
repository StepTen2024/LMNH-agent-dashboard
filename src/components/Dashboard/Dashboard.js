import React, { useState, useEffect, useRef } from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef(null);
  const dashboardRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      setIsScrolling(true);
      
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    const dashboardElement = dashboardRef.current;
    if (dashboardElement) {
      dashboardElement.addEventListener('scroll', handleScroll, { passive: true });
      
      return () => {
        dashboardElement.removeEventListener('scroll', handleScroll);
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
      };
    }
  }, []);

  useEffect(() => {
    const preventBounce = (e) => {
      const element = e.target;
      const scrollTop = element.scrollTop;
      const scrollHeight = element.scrollHeight;
      const clientHeight = element.clientHeight;
      
      if (scrollTop === 0 && e.deltaY < 0) {
        e.preventDefault();
      }
      
      if (scrollTop + clientHeight >= scrollHeight && e.deltaY > 0) {
        e.preventDefault();
      }
    };

    const dashboardElement = dashboardRef.current;
    if (dashboardElement) {
      dashboardElement.addEventListener('wheel', preventBounce, { passive: false });
      
      return () => {
        dashboardElement.removeEventListener('wheel', preventBounce);
      };
    }
  }, []);

  const scrollToTop = () => {
    if (dashboardRef.current) {
      dashboardRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div 
      ref={dashboardRef}
      className={`dashboard-container ${isScrolling ? 'scrolling' : ''}`}
    >
      <div ref={contentRef} className="dashboard-content">
        <header className="dashboard-header">
          <h1>Dashboard</h1>
          <nav className="dashboard-nav">
            <button className="nav-item">Overview</button>
            <button className="nav-item">Analytics</button>
            <button className="nav-item">Reports</button>
            <button className="nav-item">Settings</button>
          </nav>
        </header>

        <main className="dashboard-main">
          <section className="stats-section">
            <div className="stat-card">
              <h3>Total Users</h3>
              <p className="stat-number">12,345</p>
            </div>
            <div className="stat-card">
              <h3>Revenue</h3>
              <p className="stat-number">$98,765</p>
            </div>
            <div className="stat-card">
              <h3>Orders</h3>
              <p className="stat-number">3,456</p>
            </div>
            <div className="stat-card">
              <h3>Growth</h3>
              <p className="stat-number">+23%</p>
            </div>
          </section>

          <section className="charts-section">
            <div className="chart-container">
              <h3>Performance Chart</h3>
              <div className="chart-placeholder">Chart goes here</div>
            </div>
            <div className="chart-container">
              <h3>Analytics Overview</h3>
              <div className="chart-placeholder">Chart goes here</div>
            </div>
          </section>

          <section className="data-table-section">
            <h3>Recent Activity</h3>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 50 }, (_, index) => (
                    <tr key={index}>
                      <td>{1000 + index}</td>
                      <td>Item {index + 1}</td>
                      <td>Active</td>
                      <td>2024-01-{String(index % 30 + 1).padStart(2, '0')}</td>
                      <td>${(Math.random() * 1000).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>

      <button 
        className="scroll-to-top"
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        ↑
      </button>
    </div>
  );
};

export default Dashboard;