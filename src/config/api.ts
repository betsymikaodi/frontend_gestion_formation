export const API_URL = 'http://localhost:8080/api';
export const API_HEADERS = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
};

// Routes de l'API
export const API_ROUTES = {
    formations: {
        base: `${API_URL}/formations`,
        getAll: `${API_URL}/formations`,
        getById: (id: number) => `${API_URL}/formations/${id}`,
        create: `${API_URL}/formations`,
        update: (id: number) => `${API_URL}/formations/${id}`,
        delete: (id: number) => `${API_URL}/formations/${id}`,
        search: {
            byPrix: `${API_URL}/formations/search/prix`,
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
    }
};