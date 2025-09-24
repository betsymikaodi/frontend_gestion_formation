export const API_URL = 'http://localhost:8080/api';

// Gestion du token JWT en mémoire (pas de localStorage)
let AUTH_TOKEN: string | null = null;

export function setAuthToken(token: string | null) {
    AUTH_TOKEN = token;
    if (token) {
        (API_HEADERS as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    } else {
        delete (API_HEADERS as Record<string, string>)['Authorization'];
    }
}

export function getAuthToken() {
    return AUTH_TOKEN;
}

// En-têtes communs; l'Authorization est injecté via setAuthToken()
export const API_HEADERS: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
};

// Type des statistiques
export interface Statistics {
    totalFormations: number;
    totalApprenants: number;
    totalInscriptions: number;
    totalRevenue: number;
    moyennePrix: number;
    tauxReussite: number;
    inscriptionsParMois: {
        mois: string;
        nombre: number;
    }[];
    revenusParMois: {
        mois: string;
        montant: number;
    }[];
    formationsPopulaires: {
        nom: string;
        nombreInscrits: number;
    }[];
}

// Routes de l'API
export const API_ROUTES = {
    auth: {
        login: `${API_URL}/auth/login`,
        register: `${API_URL}/auth/register`,
    },
    stats: {
        base: `${API_URL}/stats`,
        dashboard: `${API_URL}/stats/dashboard`,
        formations: `${API_URL}/stats/formations`,
        inscriptions: `${API_URL}/stats/inscriptions`,
        paiements: `${API_URL}/stats/paiements`,
        activities: `${API_URL}/stats/activities`
    },
    formations: {
        base: `${API_URL}/formations`,
        getAll: `${API_URL}/formations`,
        getById: (id: number) => `${API_URL}/formations/${id}`,
        create: `${API_URL}/formations`,
        update: (id: number) => `${API_URL}/formations/${id}`,
        delete: (id: number) => `${API_URL}/formations/${id}`,
        search: {
            byPrix: `${API_URL}/formations/search/prix`,
            byDuree: `${API_URL}/formations/search/duree`,
            populaires: `${API_URL}/formations/populaires`
        },
        stats: {
            moyennePrix: `${API_URL}/formations/stats/moyenne-prix`
        }
    },
    inscriptions: {
        base: `${API_URL}/inscriptions`,
        getAll: `${API_URL}/inscriptions`,
        getById: (id: number) => `${API_URL}/inscriptions/${id}`,
        create: `${API_URL}/inscriptions`,
        update: (id: number) => `${API_URL}/inscriptions/${id}`,
        delete: (id: number) => `${API_URL}/inscriptions/${id}`,
        confirm: (id: number) => `${API_URL}/inscriptions/${id}/confirm`,
        cancel: (id: number) => `${API_URL}/inscriptions/${id}/cancel`,
        enroll: `${API_URL}/inscriptions/enroll`
    },
    paiements: {
        base: `${API_URL}/paiements`,
        getAll: `${API_URL}/paiements`,
        getById: (id: number) => `${API_URL}/paiements/${id}`,
        getByInscription: (inscriptionId: number) => `${API_URL}/paiements/inscription/${inscriptionId}`,
        create: `${API_URL}/paiements`,
        update: (id: number) => `${API_URL}/paiements/${id}`,
        delete: (id: number) => `${API_URL}/paiements/${id}`
    }
};