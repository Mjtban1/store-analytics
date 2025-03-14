import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { getDeviceId } from '../../utils/deviceId';
import Dashboard from '../Dashboard/Dashboard';
import './Analytics.css';

const Analytics = () => {
    const [name, setName] = useState('');
    const [savedName, setSavedName] = useState('');
    const [docId, setDocId] = useState(null);
    const deviceId = getDeviceId();
    const [showWelcome, setShowWelcome] = useState(true);

    const authorizedUsers = [
        { names: ['شمس', 'شموس', 'shams', 'shmoos'], type: 'shams' },
        { names: ['بنين', 'بنونه', 'baneen'], type: 'baneen' },
        { names: ['علي', 'على', 'ali'], type: 'ali' },
        { names: ['مجتبى', 'مجتبا', 'mojtaba'], type: 'mojtaba' }
    ];

    const isAuthorized = (name) => {
        const lowerName = name.toLowerCase().trim();
        return authorizedUsers.some(user => user.names.includes(lowerName));
    };

    const getUserType = (name) => {
        const lowerName = name.toLowerCase().trim();
        return authorizedUsers.find(user => 
            user.names.includes(lowerName))?.type || 'unauthorized';
    };

    useEffect(() => {
        const fetchName = async () => {
            const q = query(collection(db, 'users'), where('deviceId', '==', deviceId));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                setSavedName(doc.data().name);
                setDocId(doc.id);
            });
        };
        fetchName();
    }, [deviceId]);

    useEffect(() => {
        if (savedName) {
            const timer = setTimeout(() => {
                setShowWelcome(false);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [savedName]);

    const getWelcomeMessage = (name) => {
        if (!isAuthorized(name)) {
            return (
                <div className="welcome-special unauthorized-animation">
                    <h1>⛔ عذراً! أنت غير مصرح لك بالدخول ⛔</h1>
                    <div className="floating-emojis">
                        <span>🚫</span>
                        <span>⛔</span>
                        <span>🚧</span>
                        <span>⚠️</span>
                    </div>
                    <p className="unauthorized-message">
                        هذا التطبيق مخصص فقط للمستخدمين المصرح لهم
                    </p>
                </div>
            );
        }

        const userType = getUserType(name);
        switch (userType) {
            case 'shams':
                return (
                    <div className="welcome-special shams-animation">
                        <h1>✨ شموسسس الغالي اهلا ✨</h1>
                        <div className="floating-emojis">
                            <span>🌟</span>
                            <span>⭐</span>
                            <span>💫</span>
                            <span>🌞</span>
                        </div>
                    </div>
                );
            case 'baneen':
                return (
                    <div className="welcome-special baneen-animation">
                        <h1>💝 هلاوووو بنونه 💝</h1>
                        <div className="floating-emojis">
                            <span>🎀</span>
                            <span>💖</span>
                            <span>✨</span>
                            <span>🦋</span>
                        </div>
                    </div>
                );
            case 'ali':
                return (
                    <div className="welcome-special ali-animation">
                        <h1>🌟 مرحباً علاويييي 🌟</h1>
                        <div className="floating-emojis">
                            <span>💪</span>
                            <span>👑</span>
                            <span>🎉</span>
                            <span>⚡</span>
                        </div>
                    </div>
                );
            case 'mojtaba':
                return (
                    <div className="welcome-special mojtaba-animation">
                        <h1>🌙 أهلاً مجتبى 🌙</h1>
                        <div className="floating-emojis">
                            <span>🌙</span>
                            <span>✨</span>
                            <span>🌟</span>
                            <span>💫</span>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isAuthorized(name)) {
            setSavedName(name); // Still set the name to show unauthorized message
            return;
        }

        try {
            const docRef = await addDoc(collection(db, 'users'), {
                name: name,
                deviceId: deviceId,
                timestamp: new Date()
            });
            setSavedName(name);
            setDocId(docRef.id);
            setName('');
        } catch (error) {
            console.error("Error adding name: ", error);
        }
    };

    const handleRemove = async () => {
        try {
            if (docId) {
                await deleteDoc(doc(db, 'users', docId));
                setSavedName('');
                setDocId(null);
            }
        } catch (error) {
            console.error("Error removing name: ", error);
        }
    };

    return (
        <div className="analytics-container">
            {!savedName ? (
                <form onSubmit={handleSubmit} className="name-form">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="أدخل اسمك هنا"
                        className="name-input arabic-input"
                    />
                    <button type="submit" className="submit-btn">تم</button>
                </form>
            ) : showWelcome ? (
                <div className="welcome-container">
                    {getWelcomeMessage(savedName)}
                </div>
            ) : (
                <Dashboard />
            )}
        </div>
    );
};

export default Analytics;