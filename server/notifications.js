const admin = require('firebase-admin');

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'your-project-id'
});

const sendNotification = async (token, title, body) => {
    try {
        await admin.messaging().send({
            token: token,
            notification: {
                title: title,
                body: body
            }
        });
    } catch (error) {
        console.error('Error sending notification:', error);
    }
};
