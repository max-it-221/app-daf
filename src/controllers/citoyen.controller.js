const db = require('../../firebase/firebase.config');

exports.getCitoyenByNci = async (req, res) => {
  const { nci } = req.params;

  try {
    const snapshot = await db.collection('citoyens').where('nci', '==', nci).get();

    if (snapshot.empty) {
      return res.status(404).json({ erreur: `Aucun citoyen trouvé avec le NCI: ${nci}` });
    }

    const doc = snapshot.docs[0];
    return res.status(200).json({ id: doc.id, ...doc.data() });

  } catch (error) {
    return res.status(500).json({ erreur: 'Erreur serveur', details: error.message });
  }
};
