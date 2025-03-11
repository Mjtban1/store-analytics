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
                        placeholder="Enter your name"
                        className="name-input"
                    />
                    <button type="submit" className="submit-btn">OK</button>
                </form>
            ) : (
                <div className="welcome-container">
                    <h1>مرحباً {savedName}!</h1>
                    <button onClick={handleRemove} className="remove-btn">إزالة الاسم</button>
                </div>
            )}
        </div>
    );
};

export default Analytics;