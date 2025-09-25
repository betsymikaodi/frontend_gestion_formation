import { API_ROUTES, API_HEADERS, Statistics } from '@/config/api';

export class StatisticsService {
  // Statistiques générales du tableau de bord
  static async getDashboardStats(): Promise<Statistics> {
    const response = await fetch(API_ROUTES.stats.dashboard, {
      headers: API_HEADERS,
    });
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des statistiques du tableau de bord');
    }
    return await response.json();
  }

  // Statistiques des formations
  static async getFormationsStats() {
    const response = await fetch(API_ROUTES.stats.formations, {
      headers: API_HEADERS,
    });
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des statistiques des formations');
    }
    return await response.json();
  }

  static async getPopularFormations(limit: number = 3) {
    const response = await fetch(`${API_ROUTES.formations.search.populaires}?limit=${limit}`, {
      headers: API_HEADERS,
    });
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des formations populaires');
    }
    return await response.json();
  }

  // Statistiques des inscriptions par période
  static async getInscriptionsStats() {
    const response = await fetch(API_ROUTES.stats.inscriptions, {
      headers: API_HEADERS,
    });
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des statistiques des inscriptions');
    }
    return await response.json();
  }

  // Statistiques des paiements
  static async getPaiementsStats() {
    const response = await fetch(API_ROUTES.stats.paiements, {
      headers: API_HEADERS,
    });
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des statistiques des paiements');
    }
    return await response.json();
  }

  // Activités récentes
  static async getRecentActivities() {
    const response = await fetch(API_ROUTES.stats.activities, {
      headers: API_HEADERS,
    });
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des activités récentes');
    }
    return await response.json();
  }

  // Total des étudiants
  static async getStudentCount(): Promise<number> {
    const response = await fetch('http://localhost:8080/api/apprenants/count', {
      headers: API_HEADERS,
    });
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération du nombre d\'étudiants');
    }
    return await response.json();
  }
}