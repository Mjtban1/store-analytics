const serviceAccount = {
  type: "service_account",
  project_id: "app-anylasis",
  private_key_id: "65bde090ffab508ebe24f810f89e88f561368df6",
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: "firebase-adminsdk-fbsvc@app-anylasis.iam.gserviceaccount.com",
  client_id: "107141982311361889473",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40app-anylasis.iam.gserviceaccount.com"
};

module.exports = serviceAccount;
