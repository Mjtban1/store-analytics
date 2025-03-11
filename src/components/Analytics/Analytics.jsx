import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { getDeviceId } from '../../utils/deviceId';
import './Analytics.css';

const Analytics = () => {
    const [name, setName] = useState('');
    const [savedName, setSavedName] = useState('');
    const [docId, setDocId] = useState(null);
    const deviceId = getDeviceId();

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

    const getWelcomeMessage = (name) => {
        const lowerName = name.toLowerCase();
        if (['شمس', 'شموس', 'shams', 'shmoos'].includes(lowerName)) {
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
        } else if (['بنين', 'بنونه', 'baneen'].includes(lowerName)) {
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
        } else if (['علي', 'على', 'ali'].includes(lowerName)) {
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
        }
        return <h1>مرحباً {name}!</h1>;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
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
            ) : (
                <div className="welcome-container">
                    {getWelcomeMessage(savedName)}
                    <button onClick={handleRemove} className="remove-btn">إزالة الاسم</button>
                </div>
            )}
        </div>
    );
};

export default Analytics;