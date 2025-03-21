import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
    const navigate = useNavigate();

    return (
        <header className="header">
            <h1 onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Analytics</h1>
            <div className="header-actions">
                <button 
                    className="admin-panel-btn"
                    onClick={() => navigate('/admin')}
                    title="لوحة التحكم"
                >
                    ⚙️ لوحة التحكم
                </button>
                {/* ...existing buttons... */}
            </div>
        </header>
    );
};

export default Header;