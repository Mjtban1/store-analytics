import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore';
import './Dashboard.css';

const Dashboard = () => {
    const [activeSection, setActiveSection] = useState('orders');
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [customProductName, setCustomProductName] = useState('');
    const [customProducts, setCustomProducts] = useState({
        games: [],
        subscriptions: [],
        services: []
    });
    const [formData, setFormData] = useState({
        productName: '',
        costPrice: '',
        sellingPrice: '',
        description: '',
        serviceType: 'games', // القيمة الافتراضية
        subType: '' // نوع المنتج الفرعي
    });
    const [capitalHistory, setCapitalHistory] = useState([]);
    const [newCapital, setNewCapital] = useState({
        amount: '',
        note: '',
        date: new Date().toISOString().split('T')[0]
    });
    const [totalCapital, setTotalCapital] = useState(0);
    const [capitalFilter, setCapitalFilter] = useState({
        startDate: '',
        endDate: ''
    });

    // إضافة حالة جديدة لإدارة نافذة التأكيد
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        itemId: null
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

    // إضافة useEffect لجلب المنتجات المخصصة عند تحميل المكون
    useEffect(() => {
        const fetchCustomProducts = async () => {
            try {
                const customProductsRef = collection(db, 'customProducts');
                const querySnapshot = await getDocs(customProductsRef);
                const products = {
                    games: [],
                    subscriptions: [],
                    services: []
                };

                querySnapshot.forEach((doc) => {
                    const product = { id: doc.id, ...doc.data() };
                    products[product.category].push(product);
                });

                setCustomProducts(products);
            } catch (error) {
                console.error("Error fetching custom products:", error);
            }
        };

        fetchCustomProducts();
    }, []);

    useEffect(() => {
        fetchCapitalHistory();
    }, []);

    const fetchCapitalHistory = async () => {
        try {
            const capitalRef = collection(db, 'capital');
            const q = query(capitalRef, orderBy('date', 'desc'));
            const querySnapshot = await getDocs(q);
            
            const history = [];
            let total = 0;
            
            querySnapshot.forEach((doc) => {
                const data = { id: doc.id, ...doc.data() };
                history.push(data);
                total += Number(data.amount);
            });
            
            setCapitalHistory(history);
            setTotalCapital(total);
        } catch (error) {
            console.error("Error fetching capital history:", error);
        }
    };

    const handleAddCapital = async (e) => {
        e.preventDefault();
        if (!newCapital.amount || !newCapital.date) return;

        try {
            await addDoc(collection(db, 'capital'), {
                amount: Number(newCapital.amount),
                note: newCapital.note,
                date: newCapital.date,
                timestamp: new Date()
            });

            setNewCapital({
                amount: '',
                note: '',
                date: new Date().toISOString().split('T')[0]
            });

            await fetchCapitalHistory();
        } catch (error) {
            console.error("Error adding capital:", error);
        }
    };

    // تعديل دالة handleDeleteCapital
    const handleDeleteCapital = async (id) => {
        setDeleteModal({
            isOpen: true,
            itemId: id
        });
    };

    // إضافة دالة confirmDelete
    const confirmDelete = async () => {
        try {
            await deleteDoc(doc(db, 'capital', deleteModal.itemId));
            await fetchCapitalHistory();
            setDeleteModal({ isOpen: false, itemId: null });
        } catch (error) {
            console.error("Error deleting capital:", error);
        }
    };

    // إضافة مكون DeleteConfirmModal
    const DeleteConfirmModal = () => {
        if (!deleteModal.isOpen) return null;

        return (
            <div className="delete-modal-overlay" onClick={() => setDeleteModal({ isOpen: false, itemId: null })}>
                <div className="delete-modal" onClick={e => e.stopPropagation()}>
                    <span className="delete-modal-emoji">🗑️</span>
                    <h3 className="delete-modal-title">تأكيد الحذف</h3>
                    <p className="delete-modal-message">
                        هل أنت متأكد من حذف هذا المبلغ؟
                        <br />
                        لا يمكن التراجع عن هذا الإجراء.
                    </p>
                    <div className="delete-modal-buttons">
                        <button
                            className="delete-modal-btn confirm"
                            onClick={confirmDelete}
                        >
                            حذف
                        </button>
                        <button
                            className="delete-modal-btn cancel"
                            onClick={() => setDeleteModal({ isOpen: false, itemId: null })}
                        >
                            إلغاء
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const getFilteredCapital = () => {
        if (!capitalFilter.startDate && !capitalFilter.endDate) {
            return capitalHistory;
        }

        return capitalHistory.filter(item => {
            const itemDate = new Date(item.date);
            const start = capitalFilter.startDate ? new Date(capitalFilter.startDate) : null;
            const end = capitalFilter.endDate ? new Date(capitalFilter.endDate) : null;

            if (start && end) {
                return itemDate >= start && itemDate <= end;
            } else if (start) {
                return itemDate >= start;
            } else if (end) {
                return itemDate <= end;
            }
            return true;
        });
    };

    const handleCustomProductAdd = async () => {
        if (customProductName.trim()) {
            try {
                // إضافة المنتج إلى Firestore
                const customProductsRef = collection(db, 'customProducts');
                const newProduct = {
                    name: customProductName.trim(),
                    category: formData.serviceType,
                    createdAt: new Date()
                };

                const docRef = await addDoc(customProductsRef, newProduct);
                
                // تحديث state المحلي
                setCustomProducts(prev => ({
                    ...prev,
                    [formData.serviceType]: [
                        ...prev[formData.serviceType],
                        { id: docRef.id, ...newProduct }
                    ]
                }));

                setCustomProductName('');
                setShowCustomInput(false);
            } catch (error) {
                console.error("Error adding custom product:", error);
            }
        }
    };

    const handleCustomProductDelete = async (productId) => {
        try {
            // حذف المنتج من Firestore
            await deleteDoc(doc(db, 'customProducts', productId));

            // تحديث state المحلي
            setCustomProducts(prev => ({
                ...prev,
                [formData.serviceType]: prev[formData.serviceType].filter(p => p.id !== productId)
            }));

            // إعادة تعيين القيم إذا كان المنتج المحذوف هو المحدد حالياً
            if (formData.subType === productId) {
                setFormData({
                    ...formData,
                    subType: '',
                    productName: ''
                });
            }
        } catch (error) {
            console.error("Error deleting custom product:", error);
        }
    };

    const handleSubTypeClick = (subType, customName = '') => {
        // إذا تم الضغط على زر "منتج مخصص"
        if (subType === 'custom' && !customName) {
            setShowCustomInput(true);
            // إعادة تعيين القيم عند الضغط على زر المنتج المخصص
            setFormData({
                ...formData,
                subType: '',
                productName: ''
            });
            return;
        }
    
        setShowCustomInput(false);
        
        if (customName) {
            // عند الضغط على منتج مخصص موجود
            setFormData({
                ...formData,
                subType: customName,
                productName: customName
            });
        } else {
            // للأزرار الأساسية
            setFormData({
                ...formData,
                subType,
                productName: subType === 'crew' ? 'كرو' :
                            subType === 'vbucks' ? 'فيبوكس' :
                            subType === 'netflix' ? 'نتفلكس' :
                            subType === 'shahid' ? 'شاهد' :
                            subType === 'prime' ? 'برايم' :
                            subType === 'promotion' ? 'ترويج' :
                            subType === 'video' ? 'فيديو إعلاني' : ''
            });
        }
    };

    const getSubTypeButtons = () => {
        switch(formData.serviceType) {
            case 'games':
                return (
                    <div className="sub-type-buttons">
                        {/* الأزرار الأساسية */}
                        <button
                            type="button"
                            className={`sub-type-btn ${formData.subType === 'crew' ? 'active' : ''}`}
                            onClick={() => handleSubTypeClick('crew')}
                        >
                            <span>👥</span>
                            <span>كرو</span>
                        </button>
                        <button
                            type="button"
                            className={`sub-type-btn ${formData.subType === 'vbucks' ? 'active' : ''}`}
                            onClick={() => handleSubTypeClick('vbucks')}
                        >
                            <span>💎</span>
                            <span>فيبوكس</span>
                        </button>
                        {/* المنتجات المخصصة */}
                        {customProducts.games.map(product => (
                            <button
                                key={product.id}
                                type="button"
                                className={`sub-type-btn custom-product ${formData.subType === product.name ? 'active' : ''}`}
                                onClick={() => handleSubTypeClick('custom', product.name)}
                            >
                                <span>🎮</span>
                                <span>{product.name}</span>
                                <span 
                                    className="delete-custom-product"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCustomProductDelete(product.id);
                                        // إذا كان هذا المنتج المخصص هو المحدد حالياً، قم بإعادة تعيين الحقول
                                        if (formData.subType === product.name) {
                                            setFormData({
                                                ...formData,
                                                subType: '',
                                                productName: ''
                                            });
                                        }
                                    }}
                                >
                                    ×
                                </span>
                            </button>
                        ))}
                        {/* زر المنتج المخصص */}
                        <button
                            type="button"
                            className={`sub-type-btn ${formData.subType === 'custom' ? 'active' : ''}`}
                            onClick={() => handleSubTypeClick('custom')}
                        >
                            <span>✨</span>
                            <span>منتج مخصص</span>
                        </button>
                        {/* حقل إدخال المنتج المخصص */}
                        {showCustomInput && (
                            <div className="custom-product-input">
                                <input
                                    type="text"
                                    value={customProductName}
                                    onChange={(e) => setCustomProductName(e.target.value)}
                                    placeholder="اسم المنتج المخصص"
                                    className="form-input"
                                />
                                <button
                                    type="button"
                                    onClick={handleCustomProductAdd}
                                    className="add-custom-btn"
                                >
                                    إضافة
                                </button>
                            </div>
                        )}
                    </div>
                );
            case 'subscriptions':
                return (
                    <div className="sub-type-buttons">
                        <button
                            type="button"
                            className={`sub-type-btn ${formData.subType === 'netflix' ? 'active' : ''}`}
                            onClick={() => handleSubTypeClick('netflix')}
                        >
                            <span>🎬</span>
                            <span>نتفلكس</span>
                        </button>
                        <button
                            type="button"
                            className={`sub-type-btn ${formData.subType === 'shahid' ? 'active' : ''}`}
                            onClick={() => handleSubTypeClick('shahid')}
                        >
                            <span>📺</span>
                            <span>شاهد</span>
                        </button>
                        <button
                            type="button"
                            className={`sub-type-btn ${formData.subType === 'prime' ? 'active' : ''}`}
                            onClick={() => handleSubTypeClick('prime')}
                        >
                            <span>🛒</span>
                            <span>برايم</span>
                        </button>
                        {/* المنتجات المخصصة للاشتراكات */}
                        {customProducts.subscriptions.map(product => (
                            <button
                                key={product.id}
                                type="button"
                                className={`sub-type-btn custom-product ${formData.subType === product.name ? 'active' : ''}`}
                                onClick={() => handleSubTypeClick('custom', product.name)}
                            >
                                <span>🎯</span>
                                <span>{product.name}</span>
                                <span 
                                    className="delete-custom-product"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCustomProductDelete(product.id);
                                        if (formData.subType === product.name) {
                                            setFormData({
                                                ...formData,
                                                subType: '',
                                                productName: ''
                                            });
                                        }
                                    }}
                                >
                                    ×
                                </span>
                            </button>
                        ))}
                        <button
                            type="button"
                            className={`sub-type-btn ${formData.subType === 'custom' ? 'active' : ''}`}
                            onClick={() => handleSubTypeClick('custom')}
                        >
                            <span>✨</span>
                            <span>منتج مخصص</span>
                        </button>
                        {showCustomInput && (
                            <div className="custom-product-input">
                                <input
                                    type="text"
                                    value={customProductName}
                                    onChange={(e) => setCustomProductName(e.target.value)}
                                    placeholder="اسم المنتج المخصص"
                                    className="form-input"
                                />
                                <button
                                    type="button"
                                    onClick={handleCustomProductAdd}
                                    className="add-custom-btn"
                                >
                                    إضافة
                                </button>
                            </div>
                        )}
                    </div>
                );
            case 'services':
                return (
                    <div className="sub-type-buttons">
                        <button
                            type="button"
                            className={`sub-type-btn ${formData.subType === 'promotion' ? 'active' : ''}`}
                            onClick={() => handleSubTypeClick('promotion')}
                        >
                            <span>📢</span>
                            <span>ترويج</span>
                        </button>
                        <button
                            type="button"
                            className={`sub-type-btn ${formData.subType === 'video' ? 'active' : ''}`}
                            onClick={() => handleSubTypeClick('video')}
                        >
                            <span>🎥</span>
                            <span>فيديو إعلاني</span>
                        </button>
                        {/* المنتجات المخصصة للخدمات */}
                        {customProducts.services.map(product => (
                            <button
                                key={product.id}
                                type="button"
                                className={`sub-type-btn custom-product ${formData.subType === product.name ? 'active' : ''}`}
                                onClick={() => handleSubTypeClick('custom', product.name)}
                            >
                                <span>⚡</span>
                                <span>{product.name}</span>
                                <span 
                                    className="delete-custom-product"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCustomProductDelete(product.id);
                                        if (formData.subType === product.name) {
                                            setFormData({
                                                ...formData,
                                                subType: '',
                                                productName: ''
                                            });
                                        }
                                    }}
                                >
                                    ×
                                </span>
                            </button>
                        ))}
                        <button
                            type="button"
                            className={`sub-type-btn ${formData.subType === 'custom' ? 'active' : ''}`}
                            onClick={() => handleSubTypeClick('custom')}
                        >
                            <span>✨</span>
                            <span>منتج مخصص</span>
                        </button>
                        {showCustomInput && (
                            <div className="custom-product-input">
                                <input
                                    type="text"
                                    value={customProductName}
                                    onChange={(e) => setCustomProductName(e.target.value)}
                                    placeholder="اسم المنتج المخصص"
                                    className="form-input"
                                />
                                <button
                                    type="button"
                                    onClick={handleCustomProductAdd}
                                    className="add-custom-btn"
                                >
                                    إضافة
                                </button>
                            </div>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    // إضافة هذه الدوال المساعدة المحسنة
    const getMonthlyGrowth = (history) => {
        if (history.length < 2) return 0;
        
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const thisMonthTotal = history
            .filter(item => {
                const date = new Date(item.date);
                return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
            })
            .reduce((sum, item) => sum + Number(item.amount), 0);

        const lastMonthTotal = history
            .filter(item => {
                const date = new Date(item.date);
                return date.getMonth() === (currentMonth - 1) && date.getFullYear() === currentYear;
            })
            .reduce((sum, item) => sum + Number(item.amount), 0);

        if (lastMonthTotal === 0) return 0;
        return (((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100).toFixed(1);
    };

    const getAverageAddition = (history) => {
        if (history.length === 0) return 0;
        
        const monthlyTotals = {};
        
        history.forEach(item => {
            const date = new Date(item.date);
            const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
            monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + Number(item.amount);
        });

        const totalMonths = Object.keys(monthlyTotals).length;
        const totalAmount = Object.values(monthlyTotals).reduce((sum, val) => sum + val, 0);
        
        return Math.round(totalAmount / totalMonths);
    };

    // تعديل renderCapitalSection
    const renderCapitalSection = () => {
        const filteredHistory = getFilteredCapital();
        const filteredTotal = filteredHistory.reduce((acc, curr) => acc + Number(curr.amount), 0);
        const growthRate = getMonthlyGrowth(capitalHistory);
        const avgAddition = getAverageAddition(capitalHistory);

        return (
            <div className="capital-section">
                <header className="capital-header">
                    <i className="section-icon">💰</i>
                    <h2>إدارة وتحليل رأس المال</h2>
                </header>
                
                <div className="capital-grid">
                    <div className="capital-card primary">
                        <div className="capital-card-content">
                            <h3>
                                <i className="fas fa-wallet"></i>
                                إجمالي رأس المال
                            </h3>
                            <div className="amount">
                                {totalCapital.toLocaleString()}
                                <span>د.ع</span>
                            </div>
                            <div className="card-footer">
                                مجموع كل الإضافات
                            </div>
                        </div>
                    </div>

                    <div className={`capital-card ${growthRate >= 0 ? 'secondary' : 'danger'}`}>
                        <div className="capital-card-content">
                            <h3>
                                <i className="fas fa-chart-line"></i>
                                النمو الشهري
                            </h3>
                            <div className="amount">
                                {growthRate}
                                <span>%</span>
                            </div>
                            <div className="card-footer">
                                مقارنة بالشهر السابق
                            </div>
                        </div>
                    </div>

                    <div className="capital-card warning">
                        <div className="capital-card-content">
                            <h3>
                                <i className="fas fa-coins"></i>
                                معدل الإضافات
                            </h3>
                            <div className="amount">
                                {avgAddition.toLocaleString()}
                                <span>د.ع / شهرياً</span>
                            </div>
                            <div className="card-footer">
                                متوسط الإضافات الشهرية
                            </div>
                        </div>
                    </div>
                </div>

                <div className="capital-form-container">
                    <h3>إضافة رأس مال جديد</h3>
                    <form className="capital-form" onSubmit={handleAddCapital}>
                        <div className="capital-input-group">
                            <label>المبلغ المضاف</label>
                            <input
                                type="number"
                                className="capital-input"
                                value={newCapital.amount}
                                onChange={(e) => setNewCapital({...newCapital, amount: e.target.value})}
                                placeholder="أدخل المبلغ"
                                required
                            />
                        </div>

                        <div className="capital-input-group">
                            <label>التاريخ</label>
                            <input
                                type="date"
                                className="capital-input"
                                value={newCapital.date}
                                onChange={(e) => setNewCapital({...newCapital, date: e.target.value})}
                                required
                            />
                        </div>

                        <div className="capital-input-group">
                            <label>ملاحظات</label>
                            <input
                                type="text"
                                className="capital-input"
                                value={newCapital.note}
                                onChange={(e) => setNewCapital({...newCapital, note: e.target.value})}
                                placeholder="إضافة ملاحظة (اختياري)"
                            />
                        </div>

                        <button type="submit" className="capital-submit-btn">
                            إضافة رأس مال
                        </button>
                    </form>
                </div>

                <div className="capital-history-section">
                    <h3>سجل رأس المال</h3>
                    
                    <div className="history-filters">
                        <div className="date-filter">
                            <label>من تاريخ</label>
                            <input
                                type="date"
                                className="capital-input"
                                value={capitalFilter.startDate}
                                onChange={(e) => setCapitalFilter({...capitalFilter, startDate: e.target.value})}
                            />
                        </div>
                        <div className="date-filter">
                            <label>إلى تاريخ</label>
                            <input
                                type="date"
                                className="capital-input"
                                value={capitalFilter.endDate}
                                onChange={(e) => setCapitalFilter({...capitalFilter, endDate: e.target.value})}
                            />
                        </div>
                        {(capitalFilter.startDate || capitalFilter.endDate) && (
                            <div className="filtered-total">
                                المجموع المصفى: {filteredTotal.toLocaleString()} د.ع
                            </div>
                        )}
                    </div>

                    <div className="history-list">
                        {filteredHistory.map(item => (
                            <div key={item.id} className="history-row">
                                <div className="history-details">
                                    <span className="amount-cell">{Number(item.amount).toLocaleString()} د.ع</span>
                                    <span className="date-cell">{new Date(item.date).toLocaleDateString('ar-IQ')}</span>
                                    {item.note && <span className="note-cell">{item.note}</span>}
                                </div>
                                <button
                                    className="delete-row-btn"
                                    onClick={() => handleDeleteCapital(item.id)}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    // تعديل renderContent لإضافة مكون DeleteConfirmModal
    const renderContent = () => {
        return (
            <>
                {deleteModal.isOpen && <DeleteConfirmModal />}
                {/* باقي الكود بدون تغيير */}
                {(() => {
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
                            return renderCapitalSection();
                        case 'analytics':
                            return <div className="analytics-section">
                                <h2>تحليل الطلبات</h2>
                                <div className="analytics-cards">
                                    <div class="stat-card">
                                        <h3>عدد الطلبات اليوم</h3>
                                        <p>25</p>
                                    </div>
                                    <div class="stat-card">
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
                })()}
            </>
        );
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
