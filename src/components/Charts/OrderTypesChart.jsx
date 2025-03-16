import React, { useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const OrderTypesChart = ({ orders }) => {
    const processedData = useMemo(() => {
        if (!orders?.length) return null;

        try {
            const summary = {
                games: { count: 0, revenue: 0, label: 'ألعاب', color: '#4CAF50' },
                subscriptions: { count: 0, revenue: 0, label: 'اشتراكات', color: '#2196F3' },
                services: { count: 0, revenue: 0, label: 'خدمات', color: '#FF9800' }
            };

            orders.forEach(order => {
                try {
                    const type = order.serviceType;
                    if (summary[type]) {
                        summary[type].count++;
                        const revenue = Number(order.sellingPrice) || 0;
                        if (!isNaN(revenue)) {
                            summary[type].revenue += revenue;
                        }
                    }
                } catch (err) {
                    console.error("Error processing individual order:", err);
                }
            });

            return summary;
        } catch (err) {
            console.error("Error processing orders data:", err);
            return null;
        }
    }, [orders]);

    if (!processedData) {
        return (
            <div style={{ 
                textAlign: 'center', 
                padding: '20px',
                color: '#666',
                fontFamily: 'Tajawal'
            }}>
                لا توجد بيانات للعرض
            </div>
        );
    }

    const chartData = {
        labels: Object.values(processedData).map(item => item.label),
        datasets: [{
            data: Object.values(processedData).map(item => item.count),
            backgroundColor: Object.values(processedData).map(item => item.color),
            borderWidth: 0,
            borderRadius: 5,
            spacing: 2,
            hoverOffset: 15
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false, // السماح بتغيير النسب
        cutout: window.innerWidth < 768 ? '65%' : '75%', // تقليل حجم الفراغ في المنتصف للموبايل
        layout: {
            padding: {
                top: 20,    // إضافة padding للسماح بالتوسع عند hover
                bottom: 20,
                left: 20,
                right: 20
            }
        },
        plugins: {
            legend: {
                display: false // إخفاء الليجند الافتراضي
            },
            tooltip: {
                enabled: true,
                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                titleColor: '#333',
                bodyColor: '#666',
                borderColor: '#ddd',
                borderWidth: 2,
                cornerRadius: 8,
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                padding: 15,
                rtl: true,
                titleFont: {
                    family: 'Tajawal',
                    size: 14,
                    weight: 'bold'
                },
                bodyFont: {
                    family: 'Tajawal',
                    size: window.innerWidth < 768 ? 11 : 13
                },
                callbacks: {
                    label: (context) => {
                        const data = Object.values(processedData)[context.dataIndex];
                        const percentage = ((data.count / orders.length) * 100).toFixed(1);
                        return [
                            `${data.label}: ${data.count} طلب`,
                            `الإيرادات: ${data.revenue.toLocaleString()} د.ع`,
                            `النسبة: ${percentage}%`
                        ];
                    }
                },
                z: 100, // زيادة z-index للتأكد من ظهورها فوق العناصر الأخرى
                position: 'nearest',
                events: ['mousemove', 'mouseout', 'touchstart', 'touchmove']
            }
        },
        hover: {
            mode: 'nearest',
            intersect: true,
            animationDuration: 200,
            onHover: (event, elements) => {
                if (elements && elements.length) {
                    event.native.target.style.cursor = 'pointer';
                } else {
                    event.native.target.style.cursor = 'default';
                }
            }
        },
        elements: {
            arc: {
                borderWidth: 0,
                borderRadius: 8,
                hoverBorderWidth: 0,
                hoverOffset: 10, // تقليل مسافة الحركة عند hover
                hoverBorderColor: 'transparent'
            }
        },
        animation: {
            animateRotate: true,
            animateScale: true,
            duration: 500
        }
    };

    // حساب الإجماليات والنسب
    const totalOrders = orders.length;
    const totalRevenue = Object.values(processedData)
        .reduce((sum, item) => sum + item.revenue, 0);
    
    // حساب هامش الربح الإجمالي
    const totalCost = orders.reduce((sum, order) => sum + Number(order.costPrice), 0);
    const profitMargin = ((totalRevenue - totalCost) / totalRevenue * 100).toFixed(1);

    return (
        <div style={{
            background: '#fff',
            borderRadius: '15px',
            padding: window.innerWidth < 768 ? '15px 10px' : '20px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minHeight: window.innerWidth < 768 ? '400px' : '500px',
            maxHeight: window.innerWidth < 768 ? '450px' : '600px',
            overflowY: 'auto',
            position: 'relative',
            isolation: 'isolate' // إضافة هذه الخاصية لإنشاء سياق تكديس جديد
        }}>
            <h3 style={{
                fontSize: window.innerWidth < 768 ? '1rem' : '1.1rem',
                color: '#666',
                marginBottom: window.innerWidth < 768 ? '15px' : '20px',
                fontFamily: 'Tajawal',
                fontWeight: 'bold',
                padding: '0 10px',
                textAlign: 'center',
                position: 'relative',
                zIndex: 3 // زيادة z-index للعنوان
            }}>
                توزيع الطلبات حسب النوع
            </h3>

            <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: window.innerWidth < 768 ? '250px' : '300px', // تصغير حجم الدائرة
                height: window.innerWidth < 768 ? '250px' : '300px',
                margin: '0 auto',
                zIndex: 3 // زيادة z-index للرسم البياني
            }}>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2 // جعل الرسم البياني في الطبقة الوسطى
                }}>
                    <Doughnut data={chartData} options={{
                        ...options,
                        plugins: {
                            ...options.plugins,
                            tooltip: {
                                ...options.plugins.tooltip,
                                z: 4 // جعل التلميحات دائماً في الأعلى
                            }
                        }
                    }} />
                </div>

                {/* الإحصائيات في المنتصف */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    fontFamily: 'Tajawal',
                    width: '100%',
                    maxWidth: window.innerWidth < 768 ? '120px' : '150px',
                    zIndex: 1, // تقليل z-index للإحصائيات في المنتصف
                    pointerEvents: 'none' // إضافة هذه الخاصية لمنع التفاعل مع العناصر الداخلية
                }}>
                    <div style={{
                        fontSize: window.innerWidth < 768 ? '1.5rem' : '2rem',
                        fontWeight: '800',
                        color: '#333',
                        marginBottom: window.innerWidth < 768 ? '3px' : '5px'
                    }}>
                        {totalOrders}
                    </div>
                    <div style={{
                        fontSize: window.innerWidth < 768 ? '0.8rem' : '0.9rem',
                        color: '#666',
                        marginBottom: window.innerWidth < 768 ? '5px' : '10px'
                    }}>
                        إجمالي الطلبات
                    </div>
                    <div style={{
                        fontSize: window.innerWidth < 768 ? '0.9rem' : '1.1rem',
                        color: '#4CAF50',
                        fontWeight: 'bold'
                    }}>
                        {totalRevenue.toLocaleString()} د.ع
                    </div>
                </div>
            </div>

            {/* الليجند المخصص */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: window.innerWidth < 768 ? '1fr 1fr' : 'repeat(3, 1fr)',
                gap: window.innerWidth < 768 ? '10px' : '20px',
                marginTop: window.innerWidth < 768 ? '15px' : '30px',
                width: '100%',
                padding: '0 10px',
                flexWrap: 'wrap',
                position: 'relative',
                zIndex: 3 // زيادة z-index للتأكد من أنها فوق الرسم البياني
            }}>
                {Object.values(processedData).map((item, index) => (
                    <div key={index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        justifyContent: 'center'
                    }}>
                        <span style={{
                            width: window.innerWidth < 768 ? '10px' : '12px',
                            height: window.innerWidth < 768 ? '10px' : '12px',
                            borderRadius: '50%',
                            backgroundColor: item.color
                        }} />
                        <span style={{
                            fontSize: window.innerWidth < 768 ? '0.8rem' : '0.9rem',
                            color: '#666',
                            fontFamily: 'Tajawal'
                        }}>
                            {item.label}
                        </span>
                    </div>
                ))}
            </div>

            {/* إضافة معلومات إضافية */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr',
                gap: window.innerWidth < 768 ? '10px' : '30px',
                marginTop: window.innerWidth < 768 ? '15px' : '30px',
                padding: window.innerWidth < 768 ? '15px' : '15px',
                background: '#f8f9ff',
                borderRadius: '10px',
                width: '92%', // تقليل العرض لإبعادها عن الحواف
                margin: window.innerWidth < 768 ? '15px auto 0' : '30px auto 0', // توسيط العنصر
                position: 'relative',
                zIndex: 3 // زيادة z-index للمعلومات الإضافية
            }}>
                <div style={{
                    textAlign: 'center',
                    fontFamily: 'Tajawal',
                    padding: window.innerWidth < 768 ? '8px' : '10px'
                }}>
                    <div style={{ color: '#666', fontSize: window.innerWidth < 768 ? '0.8rem' : '0.9rem' }}>هامش الربح</div>
                    <div style={{ 
                        color: profitMargin > 0 ? '#4CAF50' : '#f44336',
                        fontSize: window.innerWidth < 768 ? '1rem' : '1.1rem',
                        fontWeight: 'bold'
                    }}>
                        {profitMargin}%
                    </div>
                </div>
                <div style={{
                    textAlign: 'center',
                    fontFamily: 'Tajawal',
                    padding: window.innerWidth < 768 ? '8px' : '10px'
                }}>
                    <div style={{ color: '#666', fontSize: window.innerWidth < 768 ? '0.8rem' : '0.9rem' }}>متوسط قيمة الطلب</div>
                    <div style={{ 
                        color: '#2196F3',
                        fontSize: window.innerWidth < 768 ? '1rem' : '1.1rem',
                        fontWeight: 'bold'
                    }}>
                        {(totalRevenue / totalOrders).toFixed(0).toLocaleString()} د.ع
                    </div>
                </div>
            </div>
        </div>
    );
};

// إضافة أنماط CSS للتحكم في التفاعلات
const styles = `
    @keyframes scaleIn {
        from { transform: scale(0.95); opacity: 0.7; }
        to { transform: scale(1); opacity: 1; }
    }

    .chart-tooltip {
        animation: scaleIn 0.2s ease-out;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    }
`;

// إضافة الأنماط إلى الصفحة
const styleSheet = document.createElement('style');
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default OrderTypesChart;
