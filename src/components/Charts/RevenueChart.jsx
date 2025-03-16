import React, { useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const RevenueChart = ({ orders }) => {
    if (!orders || orders.length === 0) {
        return (
            <div className="no-data" style={{ 
                fontFamily: 'Tajawal', 
                fontSize: '1.4rem', 
                color: '#666',
                textAlign: 'center',
                padding: '40px'
            }}>
                لا توجد بيانات للعرض
            </div>
        );
    }

    // تعديل طريقة معالجة البيانات لتجنب الأخطاء
    const processData = () => {
        try {
            const hourlyData = Array(24).fill().map(() => ({
                revenue: 0,
                costs: 0,
                count: 0
            }));

            if (!orders || !Array.isArray(orders)) {
                console.log("No orders data or invalid format");
                return hourlyData;
            }

            orders.forEach(order => {
                try {
                    // تحسين معالجة التاريخ
                    let orderDate;
                    if (order.timestamp?.seconds) {
                        orderDate = new Date(order.timestamp.seconds * 1000);
                    } else if (order.timestamp?._seconds) {
                        orderDate = new Date(order.timestamp._seconds * 1000);
                    } else if (order.timestamp instanceof Date) {
                        orderDate = order.timestamp;
                    } else {
                        console.log("Invalid timestamp for order:", order);
                        return; // تخطي هذا الطلب
                    }

                    if (isNaN(orderDate.getTime())) {
                        console.log("Invalid date for order:", order);
                        return; // تخطي هذا الطلب
                    }

                    const hour = orderDate.getHours();
                    const revenue = Number(order.sellingPrice) || 0;
                    const cost = Number(order.costPrice) || 0;

                    hourlyData[hour].revenue += revenue;
                    hourlyData[hour].costs += cost;
                    hourlyData[hour].count += 1;
                } catch (err) {
                    console.error("Error processing order:", err, order);
                }
            });

            return hourlyData;
        } catch (err) {
            console.error("Error in processData:", err);
            return Array(24).fill().map(() => ({
                revenue: 0,
                costs: 0,
                count: 0
            }));
        }
    };

    const hourlyData = processData();

    const data = {
        labels: Array(24).fill().map((_, i) => `${i}:00`),
        datasets: [
            {
                label: 'الإيرادات',
                data: hourlyData.map(h => h.revenue),
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 3,
                yAxisID: 'y'
            },
            {
                label: 'التكاليف',
                data: hourlyData.map(h => h.costs),
                borderColor: '#f44336',
                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 3,
                yAxisID: 'y'
            },
            {
                label: 'عدد الطلبات',
                data: hourlyData.map(h => h.count),
                borderColor: '#2196F3',
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 3,
                yAxisID: 'count'
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        aspectRatio: window.innerWidth < 768 ? 1 : 2.5,
        elements: {
            line: { tension: 0.3 },
            point: { radius: 3, hitRadius: 8, hoverRadius: 5 }
        },
        plugins: {
            legend: {
                position: 'top',
                align: 'center',
                rtl: true,
                labels: {
                    boxWidth: 12,
                    usePointStyle: true,
                    font: { 
                        size: window.innerWidth >= 1024 ? 13 : 11,
                        family: 'Tajawal',
                        weight: 'bold' // إضافة الخط العريض
                    },
                    padding: window.innerWidth < 768 ? 10 : 20
                }
            },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                titleColor: '#333',
                bodyColor: '#666',
                borderColor: '#ddd',
                borderWidth: 1,
                padding: 10,
                callbacks: {
                    title: (items) => `الساعة ${items[0].label}`,
                    label: (context) => {
                        const hour = parseInt(context.label);
                        const hourData = hourlyData[hour];
                        
                        switch(context.dataset.label) {
                            case 'الإيرادات':
                                return `الإيرادات: ${context.raw.toLocaleString()} د.ع`;
                            case 'التكاليف':
                                return `التكاليف: ${context.raw.toLocaleString()} د.ع`;
                            case 'عدد الطلبات':
                                return `عدد الطلبات: ${context.raw} طلب`;
                            default:
                                return '';
                        }
                    }
                },
                titleFont: {
                    family: 'Tajawal',
                    weight: 'bold',
                    size: 14
                },
                bodyFont: {
                    family: 'Tajawal',
                    weight: 'bold',
                    size: 13
                }
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { 
                    font: { 
                        size: window.innerWidth >= 1024 ? 12 : 10,
                        family: 'Tajawal',
                        weight: 'bold'
                    },
                    maxRotation: 0,
                    maxTicksLimit: window.innerWidth < 768 ? 6 : 12
                }
            },
            y: {
                beginAtZero: true,
                position: 'left',
                grid: {
                    color: 'rgba(0,0,0,0.05)',
                    drawBorder: false
                },
                ticks: {
                    maxTicksLimit: window.innerWidth < 768 ? 5 : 6,
                    font: { 
                        size: window.innerWidth >= 1024 ? 12 : 10,
                        family: 'Tajawal',
                        weight: 'bold'
                    },
                    padding: 10,
                    callback: value => `${(value/1000)}k د.ع`
                }
            },
            count: {
                position: 'right',
                beginAtZero: true,
                grid: { display: false },
                ticks: {
                    maxTicksLimit: 6,
                    font: { 
                        size: window.innerWidth >= 1024 ? 12 : 10,
                        family: 'Tajawal',
                        weight: 'bold'
                    },
                    padding: 10,
                    callback: value => `${value} طلب`
                }
            }
        }
    };

    // حساب الإجماليات
    const totals = hourlyData.reduce((acc, curr) => ({
        revenue: acc.revenue + curr.revenue,
        costs: acc.costs + curr.costs,
        count: acc.count + curr.count
    }), { revenue: 0, costs: 0, count: 0 });

    // إضافة حالة للتحكم في الفلترة والترتيب
    const [filterType, setFilterType] = useState('all');
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');

    // دالة لحساب الربح
    const calculateProfit = (selling, cost) => {
        const sellingPrice = Number(selling);
        const costPrice = Number(cost);
        const commission = sellingPrice * 0.05; // 5% عمولة
        return sellingPrice - costPrice - commission;
    };

    // تحديث معالجة التاريخ في جدول الطلبات
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

            if (isNaN(date.getTime())) {
                return 'تاريخ غير صالح';
            }

            return format(date, 'dd/MM/yyyy HH:mm', { locale: ar });
        } catch (error) {
            console.error("Error formatting date:", error);
            return 'تاريخ غير صالح';
        }
    };

    return (
        <div className="chart-box" style={{
            background: '#fff',
            borderRadius: '12px',
            padding: window.innerWidth < 768 ? '15px 10px' : '20px', // تعديل padding للموبايل
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            height: window.innerWidth < 768 ? '600px' : '500px', // زيادة الارتفاع للموبايل
            minHeight: window.innerWidth < 768 ? '550px' : '500px', // إضافة حد أدنى للارتفاع
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between' // توزيع المساحة بشكل متساوٍ
        }}>
            <div style={{
                marginBottom: window.innerWidth < 768 ? '30px' : '20px',
                textAlign: 'center', // تحسين التوسيط
                fontFamily: 'Tajawal',
                width: '100%',
                display: 'flex', // إضافة flex layout
                flexDirection: 'column',
                alignItems: 'center', // توسيط العناصر أفقياً
                padding: window.innerWidth < 768 ? '10px 15px' : '0',
                boxSizing: 'border-box'
            }}>
                <h3 style={{
                    fontSize: window.innerWidth < 768 ? '1.1rem' : '1.2rem',
                    color: '#666',
                    marginBottom: '15px',
                    fontWeight: 'bold',
                    textAlign: 'center', // تأكيد التوسيط
                    width: '100%' // تأكيد العرض الكامل
                }}>
                    ملخص الإيرادات والتكاليف
                </h3>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center', // توسيط العناصر
                    flexWrap: 'wrap',
                    gap: window.innerWidth < 768 ? '15px' : '20px',
                    fontSize: window.innerWidth < 768 ? '0.9rem' : '1rem',
                    color: '#666',
                    fontWeight: 'bold',
                    width: '100%', // تأكيد العرض الكامل
                    maxWidth: '100%', // منع تجاوز العرض
                    boxSizing: 'border-box',
                    marginBottom: window.innerWidth < 768 ? '20px' : '30px' // زيادة المسافة السفلية
                }}>
                    <span>إجمالي الإيرادات: {hourlyData.reduce((sum, h) => sum + h.revenue, 0).toLocaleString()} د.ع</span>
                    <span>إجمالي التكاليف: {hourlyData.reduce((sum, h) => sum + h.costs, 0).toLocaleString()} د.ع</span>
                    <span>عدد الطلبات: {hourlyData.reduce((sum, h) => sum + h.count, 0)}</span>
                </div>
            </div>
            <div style={{ 
                flex: 1,
                minHeight: window.innerWidth < 768 ? '400px' : '350px', // زيادة الارتفاع الأدنى
                position: 'relative',
                marginBottom: window.innerWidth < 768 ? '20px' : '0'
            }}>
                <Line data={data} options={options} />
            </div>
        </div>
    );
};

// إضافة الأنماط
const styles = `
.analytics-wrapper {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.orders-details-section {
    background: white;
    border-radius: 15px;
    padding: 1.5rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.filters {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.filter-select {
    padding: 8px 12px;
    border: 1.5px solid #e0e0fe;
    border-radius: 8px;
    font-family: 'Tajawal', Arial, sans-serif;
    font-size: 0.9rem;
    color: #666;
    background: white;
}

.sort-btn {
    padding: 8px;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 1.2rem;
}

.orders-table-wrapper {
    overflow-x: auto;
}

.orders-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
}

.orders-table th,
.orders-table td {
    padding: 12px;
    text-align: right;
}

.orders-table th {
    background: #f8f9ff;
    font-weight: bold;
    color: #666;
    position: sticky;
    top: 0;
    z-index: 10;
}

.order-row {
    border-bottom: 1px solid #f0f0f0;
    transition: background-color 0.2s;
}

.order-row:hover {
    background-color: #f8f9ff;
}

.type-badge {
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: bold;
}

.type-badge.games { background: rgba(76, 175, 80, 0.1); color: #4CAF50; }
.type-badge.subscriptions { background: rgba(33, 150, 243, 0.1); color: #2196F3; }
.type-badge.services { background: rgba(255, 152, 0, 0.1); color: #FF9800; }

.profit.positive { color: #4CAF50; }
.profit.negative { color: #dc3545; }

.actions {
    display: flex;
    gap: 8px;
    justify-content: center;
}

.action-btn {
    padding: 6px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: transform 0.2s;
    background: none;
}

.action-btn:hover {
    transform: translateY(-2px);
}

@media screen and (max-width: 768px) {
    .section-header {
        flex-direction: column;
        gap: 1rem;
    }

    .filters {
        width: 100%;
        justify-content: space-between;
    }

    .filter-select {
        flex: 1;
    }

    .orders-table {
        font-size: 0.9rem;
    }

    .actions {
        flex-wrap: wrap;
    }
}
`;

// إضافة الأنماط إلى الصفحة
const styleSheet = document.createElement('style');
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default RevenueChart;
