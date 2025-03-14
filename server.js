const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const serviceAccount = require('./src/server/serviceAccount');

const app = express();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id
});

app.use(cors());
app.use(express.json());

// Middleware to verify Firebase auth token
const verifyToken = async (req, res, next) => {
  try {
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Endpoint for sending notifications
app.post('/api/notifications/send', verifyToken, async (req, res) => {
  try {
    const { title, body } = req.body;
    const { uid } = req.user;

    // Get user's FCM token
    const tokenDoc = await admin.firestore()
      .collection('notification_tokens')
      .where('uid', '==', uid)
      .limit(1)
      .get();

    if (tokenDoc.empty) {
      return res.status(404).json({ error: 'No FCM token found for user' });
    }

    const token = tokenDoc.docs[0].data().token;

    await admin.messaging().send({
      token,
      notification: { title, body },
      android: { priority: 'high' },
      apns: { 
        headers: { 'apns-priority': '5' },
        payload: {
          aps: {
            alert: { title, body },
            sound: 'default'
          }
        }
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
