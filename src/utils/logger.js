// utils/logger.js
const { db } = require('../firebase-config');

/**
 * Journalise une requête dans Firestore
 * @param {Object} requestData - Données de la requête
 */
async function logRequest(requestData) {
  try {
    const logEntry = {
      timestamp: requestData.timestamp || new Date(),
      method: requestData.method,
      url: requestData.url,
      statusCode: requestData.statusCode,
      responseTime: requestData.responseTime,
      ip: requestData.ip,
      userAgent: requestData.userAgent,
      requestBody: sanitizeRequestBody(requestData.body),
      success: requestData.statusCode >= 200 && requestData.statusCode < 400,
      level: getLogLevel(requestData.statusCode)
    };

    // Ajouter des informations spécifiques pour les endpoints citoyens
    if (requestData.url.includes('/api/citoyens')) {
      logEntry.service = 'citoyens';
      logEntry.action = getActionFromUrl(requestData.method, requestData.url);
    }

    // Sauvegarder dans Firestore
    await db.collection('logs').add(logEntry);

    // Log console pour le développement
    if (process.env.NODE_ENV === 'development') {
      console.log(`${requestData.method} ${requestData.url} - ${requestData.statusCode} - ${requestData.responseTime}ms`);
    }

  } catch (error) {
    console.error('Erreur lors de la journalisation:', error);
    // Ne pas faire échouer la requête originale en cas d'erreur de log
  }
}

/**
 * Nettoie les données de la requête pour éviter de stocker des informations sensibles
 * @param {Object} body - Corps de la requête
 * @returns {Object} Corps nettoyé
 */
function sanitizeRequestBody(body) {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const sanitized = { ...body };
  
  // Supprimer ou masquer les champs sensibles
  const sensitiveFields = ['password', 'token', 'secret', 'key'];
  
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  }

  // Limiter la taille des photos (base64)
  if (sanitized.photo && sanitized.photo.length > 100) {
    sanitized.photo = sanitized.photo.substring(0, 100) + '...[TRUNCATED]';
  }

  return sanitized;
}

/**
 * Détermine le niveau de log basé sur le code de statut
 * @param {number} statusCode - Code de statut HTTP
 * @returns {string} Niveau de log
 */
function getLogLevel(statusCode) {
  if (statusCode >= 500) return 'error';
  if (statusCode >= 400) return 'warning';
  if (statusCode >= 300) return 'info';
  return 'success';
}

/**
 * Détermine l'action basée sur la méthode et l'URL
 * @param {string} method - Méthode HTTP
 * @param {string} url - URL de la requête
 * @returns {string} Action
 */
function getActionFromUrl(method, url) {
  const urlParts = url.split('/');
  const hasId = urlParts.length > 3 && urlParts[3] !== '';
  
  switch (method) {
    case 'GET':
      return hasId ? 'get_citoyen' : 'list_citoyens';
    case 'POST':
      return 'create_citoyen';
    case 'PUT':
      return 'update_citoyen';
    case 'DELETE':
      return 'delete_citoyen';
    default:
      return 'unknown_action';
  }
}

/**
 * Récupère les logs avec filtres
 * @param {Object} filters - Filtres pour la requête
 * @returns {Array} Liste des logs
 */
async function getLogs(filters = {}) {
  try {
    let query = db.collection('logs');

    // Appliquer les filtres
    if (filters.service) {
      query = query.where('service', '==', filters.service);
    }

    if (filters.level) {
      query = query.where('level', '==', filters.level);
    }

    if (filters.startDate) {
      query = query.where('timestamp', '>=', filters.startDate);
    }

    if (filters.endDate) {
      query = query.where('timestamp', '<=', filters.endDate);
    }

    // Ordonner par timestamp décroissant
    query = query.orderBy('timestamp', 'desc');

    // Limiter les résultats
    const limit = filters.limit || 100;
    query = query.limit(limit);

    const snapshot = await query.get();
    const logs = [];

    snapshot.forEach(doc => {
      logs.push({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate()
      });
    });

    return logs;

  } catch (error) {
    console.error('Erreur lors de la récupération des logs:', error);
    throw new Error('Impossible de récupérer les logs');
  }
}

/**
 * Statistiques des logs
 * @param {Object} filters - Filtres pour les statistiques
 * @returns {Object} Statistiques
 */
async function getLogStats(filters = {}) {
  try {
    const logs = await getLogs(filters);

    const stats = {
      total: logs.length,
      success: logs.filter(log => log.success).length,
      errors: logs.filter(log => log.level === 'error').length,
      warnings: logs.filter(log => log.level === 'warning').length,
      averageResponseTime: 0,
      topActions: {},
      statusCodes: {}
    };

    // Calculer le temps de réponse moyen
    if (logs.length > 0) {
      const totalResponseTime = logs.reduce((sum, log) => sum + (log.responseTime || 0), 0);
      stats.averageResponseTime = Math.round(totalResponseTime / logs.length);
    }

    // Compter les actions et codes de statut
    logs.forEach(log => {
      // Actions
      if (log.action) {
        stats.topActions[log.action] = (stats.topActions[log.action] || 0) + 1;
      }

      // Codes de statut
      if (log.statusCode) {
        stats.statusCodes[log.statusCode] = (stats.statusCodes[log.statusCode] || 0) + 1;
      }
    });

    return stats;

  } catch (error) {
    console.error('Erreur lors du calcul des statistiques:', error);
    throw new Error('Impossible de calculer les statistiques');
  }
}

module.exports = {
  logRequest,
  getLogs,
  getLogStats
};