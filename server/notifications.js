const admin = require('firebase-admin');
const serviceAccount = require('../src/server/serviceAccount');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id
});

const sendNotification = async (req, res) => {
  try {
    const { title, body } = req.body;
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    
    if (!idToken) {
      throw new Error('No auth token provided');
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Get user's FCM token from database
    const userDoc = await admin.firestore()
      .collection('notification_tokens')
      .where('uid', '==', uid)
      .limit(1)
      .get();

    if (userDoc.empty) {
      throw new Error('No FCM token found for user');
    }

    const token = userDoc.docs[0].data().token;

    await admin.messaging().send({
      token: token,
      notification: {
        title: title,
        body: body
      },
      android: {
        priority: 'high'
      },
      apns: {
        headers: {
          'apns-priority': '5'
        }
      }
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error sending notification:', error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { sendNotification };
