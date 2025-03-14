import React, { useState } from 'react';
import './Dashboard.css';

const Dashboard = () => {
    const [activeSection, setActiveSection] = useState('orders');
    const [formData, setFormData] = useState({
        productName: '',
        costPrice: '',
        sellingPrice: '',
        description: '',
        serviceType: 'games', // القيمة الافتراضية
        subType: '' // نوع المنتج الفرعي
    });

    const sections = {
        orders: { title: 'تسجيل الطلبات', icon: '📦' },
        capital: { title: 'رأس المال', icon: '💰' },
        analytics: { title: 'تحليل الطلبات', icon: '📊' },
        archive: { title: 'الأرشيف', icon: '📂' }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
    };

    const getSubTypeButtons = () => {
        switch(formData.serviceType) {
            case 'games':
                return (
                    <div className="sub-type-buttons">
                        <button
                            type="button"
                            className={`sub-type-btn ${formData.subType === 'crew' ? 'active' : ''}`}
                            onClick={() => setFormData({...formData, subType: 'crew'})}
                        >
                            <span>👥</span>
                            <span>كرو</span>
                        </button>
                        <button
                            type="button"
                            className={`sub-type-btn ${formData.subType === 'vbucks' ? 'active' : ''}`}
                            onClick={() => setFormData({...formData, subType: 'vbucks'})}
                        >
                            <span>💎</span>
                            <span>فيبوكس</span>
                        </button>
                        <button
                            type="button"
                            className={`sub-type-btn ${formData.subType === 'custom' ? 'active' : ''}`}
                            onClick={() => setFormData({...formData, subType: 'custom'})}
                        >
                            <span>🎮</span>
                            <span>منتج مخصص</span>
                        </button>
                    </div>
                );
            case 'subscriptions':
                return (
                    <div className="sub-type-buttons">
                        <button
                            type="button"
                            className={`sub-type-btn ${formData.subType === 'netflix' ? 'active' : ''}`}
                            onClick={() => setFormData({...formData, subType: 'netflix'})}
                        >
                            <span>🎬</span>
                            <span>نتفلكس</span>
                        </button>
                        <button
                            type="button"
                            className={`sub-type-btn ${formData.subType === 'shahid' ? 'active' : ''}`}
                            onClick={() => setFormData({...formData, subType: 'shahid'})}
                        >
                            <span>📺</span>
                            <span>شاهد</span>
                        </button>
                        <button
                            type="button"
                            className={`sub-type-btn ${formData.subType === 'prime' ? 'active' : ''}`}
                            onClick={() => setFormData({...formData, subType: 'prime'})}
                        >
                            <span>🛒</span>
                            <span>برايم</span>
                        </button>
                        <button
                            type="button"
                            className={`sub-type-btn ${formData.subType === 'custom' ? 'active' : ''}`}
                            onClick={() => setFormData({...formData, subType: 'custom'})}
                        >
                            <span>✨</span>
                            <span>منتج مخصص</span>
                        </button>
                    </div>
                );
            case 'services':
                return (
                    <div className="sub-type-buttons">
                        <button
                            type="button"
                            className={`sub-type-btn ${formData.subType === 'promotion' ? 'active' : ''}`}
                            onClick={() => setFormData({...formData, subType: 'promotion'})}
                        >
                            <span>📢</span>
                            <span>ترويج</span>
                        </button>
                        <button
                            type="button"
                            className={`sub-type-btn ${formData.subType === 'video' ? 'active' : ''}`}
                            onClick={() => setFormData({...formData, subType: 'video'})}
                        >
                            <span>🎥</span>
                            <span>فيديو إعلاني</span>
                        </button>
                        <button
                            type="button"
                            className={`sub-type-btn ${formData.subType === 'custom' ? 'active' : ''}`}
                            onClick={() => setFormData({...formData, subType: 'custom'})}
                        >
                            <span>⚡</span>
                            <span>منتج مخصص</span>
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    const renderContent = () => {
        switch (activeSection) {
            case 'orders':
                return (
                    <div className="orders-section">
                        <div className="section-header">
                            <i className="section-icon">📦</i>
                            <h2>تسجيل المنتجات والطلبات</h2>
                        </div>
                        <form className="order-form" onSubmit={handleSubmit}>
                            <div className="service-types">
                                <button
                                    type="button"
                                    className={`service-btn ${formData.serviceType === 'games' ? 'active' : ''}`}
                                    onClick={() => setFormData({...formData, serviceType: 'games'})}
                                >
                                    <span>🎮</span>
                                    <span>ألعاب</span>
                                </button>
                                <button
                                    type="button"
                                    className={`service-btn ${formData.serviceType === 'subscriptions' ? 'active' : ''}`}
                                    onClick={() => setFormData({...formData, serviceType: 'subscriptions'})}
                                >
                                    <span>🎯</span>
                                    <span>اشتراكات</span>
                                </button>
                                <button
                                    type="button"
                                    className={`service-btn ${formData.serviceType === 'services' ? 'active' : ''}`}
                                    onClick={() => setFormData({...formData, serviceType: 'services'})}
                                >
                                    <span>⚡</span>
                                    <span>خدمات</span>
                                </button>
                            </div>
                            {getSubTypeButtons()}
                            <div className="form-group">
                                <label>اسم المنتج</label>
                                <input
                                    type="text"
                                    name="productName"
                                    className="form-input"
                                    value={formData.productName}
                                    onChange={handleInputChange}
                                    placeholder="أدخل اسم المنتج"
                                />
                            </div>

                            <div className="form-group">
                                <label>سعر التكلفة</label>
                                <input
                                    type="number"
                                    name="costPrice"
                                    className="form-input"
                                    value={formData.costPrice}
                                    onChange={handleInputChange}
                                    placeholder="سعر التكلفة"
                                />
                            </div>

                            <div className="form-group">
                                <label>سعر البيع</label>
                                <input
                                    type="number"
                                    name="sellingPrice"
                                    className="form-input"
                                    value={formData.sellingPrice}
                                    onChange={handleInputChange}
                                    placeholder="سعر البيع"
                                />
                            </div>

                            <div className="form-group description-group">
                                <label>وصف المنتج</label>
                                <textarea
                                    name="description"
                                    className="form-input"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="وصف تفصيلي للمنتج"
                                    rows="4"
                                ></textarea>
                            </div>

                            <button type="submit" className="submit-btn">
                                تسجيل المنتج
                            </button>
                        </form>
                    </div>
                );
            case 'capital':
                return <div className="capital-section">
                    <h2>إدارة رأس المال</h2>
                    <div className="capital-stats">
                        <div className="stat-card">
                            <h3>رأس المال الحالي</h3>
                            <p className="amount">50,000 د.ع</p>
                        </div>
                        <div className="stat-card">
                            <h3>الأرباح</h3>
                            <p className="amount positive">+15,000 د.ع</p>
                        </div>
                    </div>
                </div>;
            case 'analytics':
                return <div className="analytics-section">
                    <h2>تحليل الطلبات</h2>
                    <div className="analytics-cards">
                        <div className="stat-card">
                            <h3>عدد الطلبات اليوم</h3>
                            <p>25</p>
                        </div>
                        <div className="stat-card">
                            <h3>إجمالي المبيعات</h3>
                            <p>150,000 د.ع</p>
                        </div>
                    </div>
                </div>;
            case 'archive':
                return <div className="archive-section">
                    <h2>أرشيف الطلبات</h2>
                    <div className="archive-filters">
                        <input type="date" />
                        <select>
                            <option value="all">كل الطلبات</option>
                            <option value="completed">المكتملة</option>
                            <option value="cancelled">الملغية</option>
                        </select>
                    </div>
                </div>;
            default:
                return <div>اختر قسماً</div>;
        }
    };

    return (
        <div className="dashboard">
            <nav className="dashboard-nav">
                {Object.entries(sections).map(([key, { title, icon }]) => (
                    <button
                        key={key}
                        className={`nav-btn ${activeSection === key ? 'active' : ''}`}
                        onClick={() => setActiveSection(key)}
                    >
                        <span>{icon}</span>
                        <span>{title}</span>
                    </button>
                ))}
            </nav>
            <main className="dashboard-content">
                {renderContent()}
            </main>
        </div>
    );
};

export default Dashboard;
