import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, getDocs, deleteDoc, doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import './AdminPanel.css';

const AdminPanel = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [data, setData] = useState({
        orders: [],
        capital: []
    });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('orders');
    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === 'MJ') {
            setIsAuthenticated(true);
            setError('');
            fetchData();
        } else {
            setError('رمز الدخول غير صحيح');
        }
    };

    const fetchData = async () => {
        try {
            const [ordersSnapshot, capitalSnapshot, usersSnapshot] = await Promise.all([
                getDocs(collection(db, 'orders')),
                getDocs(collection(db, 'capital')),
                getDocs(collection(db, 'users'))
            ]);

            setData({
                orders: ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
                capital: capitalSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            });
            setUsers(usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    const formatDate = (timestamp) => {
        try {
            if (timestamp?.seconds) {
                return new Date(timestamp.seconds * 1000).toLocaleDateString();
            }
            if (timestamp instanceof Date) {
                return timestamp.toLocaleDateString();
            }
            return '-';
        } catch (error) {
            console.error("Error formatting date:", error);
            return '-';
        }
    };

    const handleDelete = async (id, collectionName) => {
        try {
            if (window.confirm('هل أنت متأكد من حذف هذا العنصر؟')) {
                // جلب البيانات قبل الحذف
                const docRef = doc(db, collectionName, id);
                const docSnap = await getDoc(docRef);
                
                if (!docSnap.exists()) {
                    throw new Error('العنصر غير موجود');
                }

                // حذف العنصر
                await deleteDoc(docRef);

                // تحديث واجهة المستخدم
                if (collectionName === 'capital') {
                    setData(prev => ({
                        ...prev,
                        capital: prev.capital.filter(item => item.id !== id)
                    }));
                } else if (collectionName === 'orders') {
                    setData(prev => ({
                        ...prev,
                        orders: prev.orders.filter(item => item.id !== id)
                    }));
                }

                // إظهار رسالة نجاح
                showSuccessMessage('تم الحذف بنجاح');
                
                // تحديث البيانات مباشرة
                await fetchData();
            }
        } catch (error) {
            console.error('Error deleting document:', error);
            showErrorMessage('حدث خطأ أثناء الحذف');
        }
    };

    // إضافة دالة لإظهار رسائل النجاح
    const showSuccessMessage = (message) => {
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.textContent = message;
        document.body.appendChild(successMessage);
        
        setTimeout(() => {
            successMessage.remove();
        }, 3000);
    };

    // إضافة دالة لإظهار رسائل الخطأ
    const showErrorMessage = (message) => {
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.textContent = message;
        document.body.appendChild(errorMessage);
        
        setTimeout(() => {
            errorMessage.remove();
        }, 3000);
    };

    const handleUpdateUser = async (userId, userData) => {
        try {
            await updateDoc(doc(db, 'users', userId), userData);
            await fetchData();
            setEditingUser(null);
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    const handleAddUser = async (userData) => {
        try {
            const newUserRef = doc(collection(db, 'users'));
            await setDoc(newUserRef, {
                ...userData,
                createdAt: new Date()
            });
            await fetchData();
        } catch (error) {
            console.error('Error adding user:', error);
        }
    };

    const UserForm = ({ user, onSubmit, onCancel }) => {
        const [formData, setFormData] = useState(user || {
            name: '',
            email: '',
            role: 'user',
            status: 'active'
        });

        return (
            <div className="user-form-overlay">
                <div className="user-form">
                    <h3>{user ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}</h3>
                    <input
                        type="text"
                        placeholder="الاسم"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                    <input
                        type="email"
                        placeholder="البريد الإلكتروني"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                    <select
                        value={formData.role}
                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                    >
                        <option value="admin">مدير</option>
                        <option value="user">مستخدم</option>
                    </select>
                    <select
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                    >
                        <option value="active">نشط</option>
                        <option value="inactive">غير نشط</option>
                    </select>
                    <div className="form-buttons">
                        <button onClick={() => onSubmit(formData)} className="save-btn">
                            {user ? 'تحديث' : 'إضافة'}
                        </button>
                        <button onClick={onCancel} className="cancel-btn">
                            إلغاء
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (!isAuthenticated) {
        return (
            <div className="admin-login">
                <div className="login-container">
                    <h2>لوحة التحكم</h2>
                    {error && <div className="error-message">{error}</div>}
                    <form onSubmit={handleLogin}>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="ادخل رمز الدخول"
                        />
                        <button type="submit">دخول</button>
                    </form>
                </div>
            </div>
        );
    }

    if (loading) {
        return <div className="loading">جاري التحميل...</div>;
    }

    return (
        <div className="admin-panel">
            <div className="admin-header">
                <h1>لوحة التحكم</h1>
                <button onClick={() => setIsAuthenticated(false)} className="logout-btn">
                    تسجيل خروج
                </button>
            </div>

            <div className="admin-tabs">
                <button 
                    className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
                    onClick={() => setActiveTab('orders')}
                >
                    <span className="tab-icon">📦</span>
                    <span>الطلبات</span>
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'capital' ? 'active' : ''}`}
                    onClick={() => setActiveTab('capital')}
                >
                    <span className="tab-icon">💰</span>
                    <span>رأس المال</span>
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                >
                    <span className="tab-icon">👥</span>
                    <span>المستخدمين</span>
                </button>
            </div>

            <div className="admin-content">
                {activeTab === 'users' ? (
                    <div className="users-section">
                        <div className="section-header">
                            <h2>إدارة المستخدمين</h2>
                            <button 
                                className="add-btn"
                                onClick={() => setEditingUser({})}
                            >
                                إضافة مستخدم جديد
                            </button>
                        </div>
                        <div className="users-grid">
                            {users.map(user => (
                                <div key={user.id} className="user-card">
                                    <div className="user-info">
                                        <div className="user-avatar">
                                            {user.name?.charAt(0) || '?'}
                                        </div>
                                        <div className="user-details">
                                            <h3>{user.name}</h3>
                                            <p>{user.email}</p>
                                            <span className={`user-status ${user.status}`}>
                                                {user.status === 'active' ? 'نشط' : 'غير نشط'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="user-actions">
                                        <button 
                                            onClick={() => setEditingUser(user)}
                                            className="edit-btn"
                                        >
                                            تعديل
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(user.id, 'users')}
                                            className="delete-btn"
                                        >
                                            حذف
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : activeTab === 'orders' ? (
                    <div className="orders-section">
                        <h2>الطلبات ({data.orders.length})</h2>
                        <div className="data-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>المنتج</th>
                                        <th>النوع</th>
                                        <th>السعر</th>
                                        <th>التاريخ</th>
                                        <th>الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.orders.map(order => (
                                        <tr key={order.id}>
                                            <td>{order.productName}</td>
                                            <td>{order.serviceType}</td>
                                            <td>{order.sellingPrice}</td>
                                            <td>{new Date(order.timestamp.seconds * 1000).toLocaleDateString()}</td>
                                            <td>
                                                <button 
                                                    onClick={() => handleDelete(order.id, 'orders')}
                                                    className="delete-btn"
                                                >
                                                    حذف
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="capital-section">
                        <h2>رأس المال ({data.capital.length})</h2>
                        <div className="data-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>المبلغ</th>
                                        <th>الملاحظات</th>
                                        <th>التاريخ</th>
                                        <th>الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.capital.map(item => {
                                        // التحقق من وجود البيانات وتنسيقها
                                        const amount = typeof item.amount === 'number' ? 
                                            item.amount.toLocaleString() : 
                                            Number(item.amount)?.toLocaleString() || '0';

                                        return (
                                            <tr key={item.id}>
                                                <td>{amount} د.ع</td>
                                                <td>{item.note || '-'}</td>
                                                <td>{formatDate(item.date)}</td>
                                                <td>
                                                    <button 
                                                        onClick={() => handleDelete(item.id, 'capital')}
                                                        className="delete-btn"
                                                    >
                                                        حذف
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {editingUser && (
                <UserForm 
                    user={editingUser.id ? editingUser : null}
                    onSubmit={(formData) => {
                        if (editingUser.id) {
                            handleUpdateUser(editingUser.id, formData);
                        } else {
                            handleAddUser(formData);
                        }
                    }}
                    onCancel={() => setEditingUser(null)}
                />
            )}
        </div>
    );
};

export default AdminPanel;
