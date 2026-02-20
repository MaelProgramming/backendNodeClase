import express from 'express';
import cors from 'cors';
import admin from 'firebase-admin';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Ajoute celle-là pour être sûr

// Initialisation Firebase
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Le split/join est la méthode la plus robuste pour Vercel + Local
      privateKey: process.env.FIREBASE_PRIVATE_KEY 
        ? process.env.FIREBASE_PRIVATE_KEY.split(String.raw`\n`).join('\n') 
        : undefined,
    }),
  });
}

const db = admin.firestore();

// Endpoint de test (pour humilier le 404)
app.get('/api/test', (req, res) => {
  res.json({ status: 'online', message: 'Ready to wipe the team' });
});

// Endpoint Wallet
app.post('/api/pay', async (req, res) => {
  const { userId, amount } = req.body;

  if (!userId || !amount) {
    return res.status(400).json({ status: 'error', message: 'Missing data' });
  }

  const userRef = db.collection('users').doc(userId);

  try {
    await db.runTransaction(async (t) => {
      const userDoc = await t.get(userRef);
      if (!userDoc.exists) throw new Error("Usuario no encontrado");

      const currentBalance = userDoc.data().balance || 0;
      const numericAmount = parseFloat(amount);

      if (currentBalance < numericAmount) throw new Error("Saldo insuficiente");

      t.update(userRef, { balance: currentBalance - numericAmount });
    });

    res.status(200).json({ status: 'success', message: 'Transación ok' });
  } catch (e) {
    res.status(400).json({ status: 'error', message: e.message });
  }
});

export default app;