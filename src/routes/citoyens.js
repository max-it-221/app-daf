// routes/citoyens.js
const express = require('express');
const router = express.Router();
const Citoyen = require('../models/Citoyen');
const { validateNCI } = require('../utils/validators');

// GET /api/citoyens/:nci - Récupérer un citoyen par NCI
router.get('/:nci', async (req, res) => {
  try {
    const { nci } = req.params;

    // Validation du format NCI
    if (!validateNCI(nci)) {
      return res.status(400).json({
        error: 'Format NCI invalide',
        message: 'Le NCI doit contenir exactement 13 chiffres'
      });
    }

    // Rechercher le citoyen
    const citoyen = await Citoyen.findByNCI(nci);

    if (!citoyen) {
      return res.status(404).json({
        error: 'Citoyen non trouvé',
        message: `Aucun citoyen trouvé avec le NCI: ${nci}`
      });
    }

    // Retourner les données du citoyen
    res.status(200).json({
      success: true,
      data: {
        id: citoyen.id,
        nom: citoyen.nom,
        prenom: citoyen.prenom,
        pere: citoyen.pere,
        mere: citoyen.mere,
        nci: citoyen.nci,
        photo: citoyen.photo
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du citoyen:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      message: 'Impossible de récupérer les informations du citoyen'
    });
  }
});

// POST /api/citoyens - Créer un nouveau citoyen
router.post('/', async (req, res) => {
  try {
    const citoyenData = req.body;

    // Créer une nouvelle instance de citoyen
    const citoyen = new Citoyen(citoyenData);

    // Sauvegarder
    await citoyen.save();

    res.status(201).json({
      success: true,
      message: 'Citoyen créé avec succès',
      data: {
        id: citoyen.id,
        nom: citoyen.nom,
        prenom: citoyen.prenom,
        pere: citoyen.pere,
        mere: citoyen.mere,
        nci: citoyen.nci,
        photo: citoyen.photo
      }
    });

  } catch (error) {
    console.error('Erreur lors de la création du citoyen:', error);
    
    if (error.message.includes('Données invalides') || 
        error.message.includes('NCI existe déjà')) {
      return res.status(400).json({
        error: 'Données invalides',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Erreur interne du serveur',
      message: 'Impossible de créer le citoyen'
    });
  }
});

// PUT /api/citoyens/:id - Mettre à jour un citoyen
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Vérifier si le citoyen existe
    const existingCitoyen = await Citoyen.findById(id);
    if (!existingCitoyen) {
      return res.status(404).json({
        error: 'Citoyen non trouvé',
        message: `Aucun citoyen trouvé avec l'ID: ${id}`
      });
    }

    // Mettre à jour les données
    Object.assign(existingCitoyen, updateData);
    await existingCitoyen.update();

    res.status(200).json({
      success: true,
      message: 'Citoyen mis à jour avec succès',
      data: {
        id: existingCitoyen.id,
        nom: existingCitoyen.nom,
        prenom: existingCitoyen.prenom,
        pere: existingCitoyen.pere,
        mere: existingCitoyen.mere,
        nci: existingCitoyen.nci,
        photo: existingCitoyen.photo
      }
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du citoyen:', error);
    
    if (error.message.includes('Données invalides')) {
      return res.status(400).json({
        error: 'Données invalides',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Erreur interne du serveur',
      message: 'Impossible de mettre à jour le citoyen'
    });
  }
});

// GET /api/citoyens - Lister tous les citoyens (avec pagination)
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const citoyens = await Citoyen.findAll(limit, offset);

    res.status(200).json({
      success: true,
      data: citoyens.map(citoyen => ({
        id: citoyen.id,
        nom: citoyen.nom,
        prenom: citoyen.prenom,
        pere: citoyen.pere,
        mere: citoyen.mere,
        nci: citoyen.nci,
        photo: citoyen.photo
      })),
      pagination: {
        limit,
        offset,
        count: citoyens.length
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des citoyens:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      message: 'Impossible de récupérer la liste des citoyens'
    });
  }
});

// DELETE /api/citoyens/:id - Supprimer un citoyen
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si le citoyen existe
    const existingCitoyen = await Citoyen.findById(id);
    if (!existingCitoyen) {
      return res.status(404).json({
        error: 'Citoyen non trouvé',
        message: `Aucun citoyen trouvé avec l'ID: ${id}`
      });
    }

    // Supprimer le citoyen
    await Citoyen.deleteById(id);

    res.status(200).json({
      success: true,
      message: 'Citoyen supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du citoyen:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      message: 'Impossible de supprimer le citoyen'
    });
  }
});

module.exports = router;