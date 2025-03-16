import React, { useState } from 'react';

const OrderDetails = ({ orders }) => {
    const [filterType, setFilterType] = useState('all');
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');

    const calculateProfit = (selling, cost) => {
        const sellingPrice = Number(selling);
        const costPrice = Number(cost);
        const commission = sellingPrice * 0.05;
        return sellingPrice - costPrice - commission;
    };

    const formatDate = (timestamp) => {
        try {
            let date;
            if (timestamp?.seconds) {
                date = new Date(timestamp.seconds * 1000);
            } else if (timestamp?._seconds) {
                date = new Date(timestamp._seconds * 1000);
            } else if (timestamp instanceof Date) {
                date = timestamp;
            } else {
                return 'تاريخ غير صالح';
            }

            return date.toLocaleString('ar-SA');
        } catch (error) {
            console.error("Error formatting date:", error);
            return 'تاريخ غير صالح';
        }
    };

    return (
        <div className="orders-details-container" style={{
            background: 'white',
            borderRadius: '20px',
            padding: '25px',
            marginTop: '30px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            overflowX: 'auto'
        }}>
            <div className="section-header" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '15px',
                marginBottom: window.innerWidth < 768 ? '40px' : '20px', // زيادة المسافة في الموبايل
                width: '100%',
                padding: window.innerWidth < 768 ? '0 10px' : '0',
                boxSizing: 'border-box'
            }}>
                <h2 style={{
                    fontSize: window.innerWidth < 768 ? '1rem' : '1.2rem',
                    textAlign: 'center',
                    width: '100%'
                }}>
                    تفاصيل الطلبات
                </h2>
                <div className="filters" style={{
                    display: 'flex',
                    flexDirection: 'column',  // تغيير إلى column في الموبايل
                    gap: '10px',
                    width: '100%',
                    maxWidth: window.innerWidth < 768 ? '100%' : 'none',
                    alignItems: 'center',
                    marginBottom: window.innerWidth < 768 ? '20px' : '0' // إضافة هامش سفلي في الموبايل
                }}>
                    <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1.5px solid #e0e0fe',
                        width: window.innerWidth < 768 ? '100%' : 'auto'
                    }}>
                        <option value="all">الكل</option>
                        <option value="games">الألعاب</option>
                        <option value="subscriptions">الاشتراكات</option>
                    </select>
                    <div style={{
                        display: 'flex',
                        gap: '10px',
                        width: '100%',
                        justifyContent: 'center'
                    }}>
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1.5px solid #e0e0fe',
                            width: window.innerWidth < 768 ? '48%' : 'auto'
                        }}>
                            <option value="date">تاريخ التسجيل</option>
                            <option value="profit">الربح</option>
                            <option value="price">سعر البيع</option>
                        </select>
                        <button 
                            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                            style={{
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: '1.5px solid #e0e0fe',
                                background: '#f0f2ff',
                                width: window.innerWidth < 768 ? '48%' : 'auto'
                            }}
                        >
                            {sortOrder === 'asc' ? '⬆️' : '⬇️'}
                        </button>
                    </div>
                </div>
            </div>
            <table style={{
                width: '100%',
                borderCollapse: 'separate',
                borderSpacing: '0 8px',
                marginTop: '20px'
            }}>
                <thead>
                    <tr>
                        <th style={{ padding: '15px', background: '#f8f9ff', textAlign: 'right', fontWeight: '600' }}>#</th>
                        <th style={{ padding: '15px', background: '#f8f9ff', textAlign: 'right', fontWeight: '600' }}>المنتج</th>
                        <th style={{ padding: '15px', background: '#f8f9ff', textAlign: 'right', fontWeight: '600' }}>النوع</th>
                        <th style={{ padding: '15px', background: '#f8f9ff', textAlign: 'right', fontWeight: '600' }}>التاريخ</th>
                        <th style={{ padding: '15px', background: '#f8f9ff', textAlign: 'right', fontWeight: '600' }}>سعر التكلفة</th>
                        <th style={{ padding: '15px', background: '#f8f9ff', textAlign: 'right', fontWeight: '600' }}>سعر البيع</th>
                        <th style={{ padding: '15px', background: '#f8f9ff', textAlign: 'right', fontWeight: '600' }}>العمولة</th>
                        <th style={{ padding: '15px', background: '#f8f9ff', textAlign: 'right', fontWeight: '600' }}>الربح</th>
                        <th style={{ padding: '15px', background: '#f8f9ff', textAlign: 'right', fontWeight: '600' }}>طريقة الدفع</th>
                        <th style={{ padding: '15px', background: '#f8f9ff', textAlign: 'center', fontWeight: '600' }}>الخيارات</th>
                    </tr>
                </thead>
                <tbody>
                    {orders
                        ?.filter(order => filterType === 'all' ? true : order.serviceType === filterType)
                        .sort((a, b) => {
                            const sortModifier = sortOrder === 'asc' ? 1 : -1;
                            switch(sortBy) {
                                case 'date':
                                    return sortModifier * (b.timestamp.seconds - a.timestamp.seconds);
                                case 'profit':
                                    return sortModifier * (calculateProfit(b.sellingPrice, b.costPrice) - calculateProfit(a.sellingPrice, a.costPrice));
                                case 'price':
                                    return sortModifier * (Number(b.sellingPrice) - Number(a.sellingPrice));
                                default:
                                    return 0;
                            }
                        })
                        .map((order, index) => (
                            <tr key={order.id || index} style={{
                                background: 'white',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                borderRadius: '8px',
                                transition: 'transform 0.2s ease'
                            }}>
                                <td style={{ padding: '15px' }}>{index + 1}</td>
                                <td style={{ padding: '15px' }}>{order.productName}</td>
                                <td style={{ padding: '15px' }}>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '6px',
                                        fontSize: '0.85rem',
                                        backgroundColor: order.serviceType === 'games' ? 'rgba(76, 175, 80, 0.1)' :
                                                      order.serviceType === 'subscriptions' ? 'rgba(33, 150, 243, 0.1)' :
                                                      'rgba(255, 152, 0, 0.1)',
                                        color: order.serviceType === 'games' ? '#4CAF50' :
                                               order.serviceType === 'subscriptions' ? '#2196F3' :
                                               '#FF9800'
                                    }}>
                                        {order.serviceType === 'games' ? 'ألعاب' :
                                         order.serviceType === 'subscriptions' ? 'اشتراكات' : 'خدمات'}
                                    </span>
                                </td>
                                <td style={{ padding: '15px' }}>{formatDate(order.timestamp)}</td>
                                <td style={{ padding: '15px' }}>{Number(order.costPrice).toLocaleString()} د.ع</td>
                                <td style={{ padding: '15px' }}>{Number(order.sellingPrice).toLocaleString()} د.ع</td>
                                <td style={{ padding: '15px' }}>{(Number(order.sellingPrice) * 0.05).toLocaleString()} د.ع</td>
                                <td style={{ 
                                    padding: '15px',
                                    color: calculateProfit(order.sellingPrice, order.costPrice) > 0 ? '#4CAF50' : '#dc3545'
                                }}>
                                    {calculateProfit(order.sellingPrice, order.costPrice).toLocaleString()} د.ع
                                </td>
                                <td style={{ padding: '15px', textAlign: 'right' }}>
                                    <span style={{
                                        padding: '6px 12px',
                                        borderRadius: '6px',
                                        fontSize: '0.9rem',
                                        backgroundColor: 
                                            order.paymentMethod === 'asiacell' ? 'rgba(33, 150, 243, 0.1)' :
                                            order.paymentMethod === 'zain' ? 'rgba(76, 175, 80, 0.1)' :
                                            order.paymentMethod === 'rafidain' ? 'rgba(255, 152, 0, 0.1)' :
                                            'rgba(156, 39, 176, 0.1)',
                                        color: 
                                            order.paymentMethod === 'asiacell' ? '#2196F3' :
                                            order.paymentMethod === 'zain' ? '#4CAF50' :
                                            order.paymentMethod === 'rafidain' ? '#FF9800' :
                                            '#9C27B0'
                                    }}>
                                        {order.paymentMethod === 'asiacell' ? 'آسياسيل' :
                                         order.paymentMethod === 'zain' ? 'زين كاش' :
                                         order.paymentMethod === 'rafidain' ? 'الرافدين' : 'كربتو'}
                                    </span>
                                </td>
                                <td style={{ 
                                    padding: '15px',
                                    display: 'flex',
                                    gap: '8px',
                                    justifyContent: 'center'
                                }}>
                                    <button style={{ border: 'none', background: 'none', cursor: 'pointer' }} title="تعديل">✏️</button>
                                    <button style={{ border: 'none', background: 'none', cursor: 'pointer' }} title="حذف">🗑️</button>
                                    <button style={{ border: 'none', background: 'none', cursor: 'pointer' }} title="إنشاء إيصال">📄</button>
                                    <button style={{ border: 'none', background: 'none', cursor: 'pointer' }} title="أرشفة">📦</button>
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    );
};

// إضافة الأنماط المتحركة
const styles = `.stat-card-animated {
    animation: cardAppear 0.5s ease-out;
}
.stat-card-animated:hover {
    transform: translateY(-5px);
}
.card-pattern {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%),
                      linear-gradient(-45deg, rgba(255,255,255,0.1) 25%, transparent 25%),
                      linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.1) 75%),
                      linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.1) 75%);
    background-size: 20px 20px;
    background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
    animation: patternMove 20s linear infinite;
    opacity: 0.1;
}
.card-icon {
    animation: iconFloat 3s ease-in-out infinite;
}
.floating-particle {
    animation: particleFloat 4s ease-in-out infinite;
}
.particle-0 { top: 20%; right: 10%; animation-delay: 0s; }
.particle-1 { top: 60%; right: 20%; animation-delay: 1s; }
.particle-2 { top: 40%; right: 30%; animation-delay: 2s; }
.trend-icon {
    font-size: 1.2rem;
    animation: trendBounce 1s ease-in-out infinite;
}
.trend-icon.up { color: #4CAF50; }
.trend-icon.down { color: #f44336; }
@keyframes cardAppear {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
@keyframes patternMove {
    from { background-position: 0 0, 0 10px, 10px -10px, -10px 0px; }
    to { background-position: 20px 20px, 20px 30px, 30px 10px, 10px 20px; }
}
@keyframes iconFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}
@keyframes particleFloat {
    0%, 100% { transform: translate(0, 0); opacity: 0.2; }
    50% { transform: translate(-10px, -10px); opacity: 0.4; }
}
@keyframes trendBounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-3px); }
}
@media (max-width: 768px) {
    .stat-card-animated {
        min-height: 160px;
        padding: 20px;
    }
}
.stat-card {
    animation: fadeInUp 0.5s ease-out;
}
.stat-card:hover {
    transform: translateY(-5px);
}

.stat-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%),
                linear-gradient(-45deg, rgba(255,255,255,0.1) 25%, transparent 25%);
    background-size: 20px 20px;
    animation: patternMove 20s linear infinite;
    opacity: 0.1;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes patternMove {
    from {
        background-position: 0 0;
    }
    to {
        background-position: 40px 40px;
    }
}

@media (max-width: 768px) {
    .stat-card {
        min-height: 120px;
    }
}

.analytics-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 20px;
    margin: 20px 0;
    padding: 0 10px;
}

.stat-card {
    position: relative;
    padding: 20px;
    color: white;
    border-radius: 20px;
    min-height: 150px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    gap: 10px;
    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
    transform-style: preserve-3d;
    animation: cardAppear 0.5s ease-out;
}

.stat-card:hover {
    transform: translateY(-5px) scale(1.02);
    box-shadow: 0 12px 30px rgba(0,0,0,0.15);
}

.card-pattern {
    position: absolute;
    inset: 0;
    background-image: 
        radial-gradient(circle at 0% 0%, rgba(255,255,255,0.1) 25%, transparent 25%),
        radial-gradient(circle at 100% 100%, rgba(255,255,255,0.1) 25%, transparent 25%);
    background-size: 50% 50%;
    opacity: 0.1;
    animation: patternMove 20s linear infinite;
}

.main-icon {
    position: absolute;
    top: 15px;
    left: 15px;
    font-size: 2.5rem;
    opacity: 0.2;
    transition: all 0.3s ease;
    animation: iconFloat 3s ease-in-out infinite;
}

.floating-icon {
    position: absolute;
    font-size: 1.2rem;
    opacity: 0.15;
    transition: all 0.3s ease;
}

.icon-0 { top: 20%; right: 10%; animation: float1 4s ease-in-out infinite; }
.icon-1 { top: 40%; right: 25%; animation: float2 4s ease-in-out infinite 1s; }
.icon-2 { top: 60%; right: 15%; animation: float3 4s ease-in-out infinite 2s; }

.card-content {
    position: relative;
    z-index: 1;
    margin-top: auto;
}

.card-content h3 {
    margin: 0;
    font-size: 1.1rem;
    opacity: 0.9;
    font-weight: 500;
}

.card-value {
    font-size: 1.8rem;
    font-weight: bold;
    margin: 10px 0;
}

.card-growth {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
    opacity: 0.9;
}

.growth-icon {
    font-size: 1.2rem;
    animation: bounce 1s ease-in-out infinite;
}

.growth-text {
    font-weight: bold;
}

.growth-period {
    opacity: 0.7;
    font-size: 0.8rem;
}

.positive .growth-icon,
.positive .growth-text { color: #4CAF50; }

.negative .growth-icon,
.negative .growth-text { color: #f44336; }

@keyframes cardAppear {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes patternMove {
    from { background-position: 0% 0%; }
    to { background-position: 100% 100%; }
}

@keyframes iconFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}

@keyframes float1 {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    50% { transform: translate(-10px, -10px) rotate(10deg); }
}

@keyframes float2 {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    50% { transform: translate(10px, -15px) rotate(-10deg); }
}

@keyframes float3 {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    50% { transform: translate(-5px, -12px) rotate(15deg); }
}

@keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-3px); }
}

@media (max-width: 768px) {
    .stat-card {
        padding: 15px;
        min-height: 130px;
    }

    .main-icon {
        font-size: 2rem;
    }

    .card-value {
        font-size: 1.5rem;
    }

    .card-content h3 {
        font-size: 1rem;
    }

    .card-growth {
        font-size: 0.8rem;
    }
}
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

export default OrderDetails;
