// utils/validators.js

/**
 * Valide le format du NCI (Numéro de Carte d'Identité)
 * @param {string} nci - Le NCI à valider
 * @returns {boolean} True si le NCI est valide
 */
function validateNCI(nci) {
  if (!nci || typeof nci !== "string") {
    return false;
  }

  // Supprimer les espaces
  const cleanNCI = nci.trim();

  // Vérifier que le NCI contient exactement 13 chiffres
  const nciRegex = /^\d{13}$/;
  return nciRegex.test(cleanNCI);
}

/**
 * Valide le nom ou prénom
 * @param {string} name - Le nom à valider
 * @returns {Object} Résultat de la validation
 */
function validateName(name) {
  if (!name || typeof name !== "string") {
    return {
      isValid: false,
      error: "Le nom est requis",
    };
  }

  const cleanName = name.trim();

  if (cleanName.length < 2) {
    return {
      isValid: false,
      error: "Le nom doit contenir au moins 2 caractères",
    };
  }

  if (cleanName.length > 50) {
    return {
      isValid: false,
      error: "Le nom ne peut pas dépasser 50 caractères",
    };
  }

  // Vérifier que le nom ne contient que des lettres, espaces, tirets et apostrophes
  const nameRegex = /^[a-zA-ZÀ-ÿ\s\-']+$/;
  if (!nameRegex.test(cleanName)) {
    return {
      isValid: false,
      error:
        "Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes",
    };
  }

  return {
    isValid: true,
    value: cleanName,
  };
}

/**
 * Valide une photo en base64
 * @param {string} photo - La photo en base64
 * @returns {Object} Résultat de la validation
 */
function validatePhoto(photo) {
  if (!photo) {
    return {
      isValid: true,
      value: "",
    };
  }

  if (typeof photo !== "string") {
    return {
      isValid: false,
      error: "La photo doit être une chaîne de caractères",
    };
  }

  // Vérifier le format base64
  const base64Regex = /^data:image\/(jpeg|jpg|png|gif);base64,/;
  if (!base64Regex.test(photo)) {
    return {
      isValid: false,
      error: "La photo doit être au format base64 valide (JPEG, PNG, GIF)",
    };
  }

  // Vérifier la taille (limite à 5MB)
  const sizeInBytes = photo.length * (3 / 4);
  const maxSizeInBytes = 5 * 1024 * 1024; // 5MB

  if (sizeInBytes > maxSizeInBytes) {
    return {
      isValid: false,
      error: "La photo ne peut pas dépasser 5MB",
    };
  }

  return {
    isValid: true,
    value: photo,
  };
}

/**
 * Valide toutes les données d'un citoyen
 * @param {Object} citoyenData - Les données du citoyen
 * @returns {Object} Résultat de la validation complète
 */
function validateCitoyenData(citoyenData) {
  const errors = [];

  // Validation du nom
  const nomValidation = validateName(citoyenData.nom);
  if (!nomValidation.isValid) {
    errors.push(`Nom: ${nomValidation.error}`);
  }

  // Validation du prénom
  const prenomValidation = validateName(citoyenData.prenom);
  if (!prenomValidation.isValid) {
    errors.push(`Prénom: ${prenomValidation.error}`);
  }

  // Validation du père (optionnel)
  if (citoyenData.pere) {
    const pereValidation = validateName(citoyenData.pere);
    if (!pereValidation.isValid) {
      errors.push(`Père: ${pereValidation.error}`);
    }
  }

  // Validation de la mère (optionnel)
  if (citoyenData.mere) {
    const mereValidation = validateName(citoyenData.mere);
    if (!mereValidation.isValid) {
      errors.push(`Mère: ${mereValidation.error}`);
    }
  }
}
