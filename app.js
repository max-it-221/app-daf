require('dotenv').config();
const express = require('express');
const app = express();

// Firebase Admin SDK
const admin = require('firebase-admin');

// Initialise Firebase avec la clé
admin.initializeApp({
  credential: admin.credential.cert(require(process.env.GOOGLE_APPLICATION_CREDENTIALS)),
});

// Exemple de route
app.get('/', (req, res) => {
  res.send('App DAF connectée à Firebase 🔥');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur Express sur le port ${PORT}`);
});
