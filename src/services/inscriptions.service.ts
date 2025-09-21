import { API_ROUTES, API_HEADERS } from '@/config/api';
import { ApiError, ApiException } from '@/types/api';

export interface Inscription {
    idInscription: number;
    dateInscription: string;
    statut: 'En attente' | 'Confirmé' | 'Annulé';
    droitInscription: number;
    paiements: {
        idPaiement: number;
        datePaiement: string;
        montant: number;
        modePaiement: string;
        module: string;
    }[];
    montantTotalPaye: number;
    montantRestant: number;
}

export interface CreateInscriptionDto {
    apprenantId: number;
    formationId: number;
    droitInscription?: number;
}

export interface UpdateInscriptionDto {
    droitInscription?: number;
    statut?: 'En attente' | 'Confirmé' | 'Annulé';
}

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        console.error('API Response:', {
            status: response.status,
            statusText: response.statusText,
            url: response.url,
            headers: Object.fromEntries(response.headers.entries())
        });

        if (response.status === 0) {
            throw new ApiException(
                0,
                'Erreur CORS ou serveur non accessible',
                'Vérifiez que le backend est en cours d\'exécution et que CORS est correctement configuré.'
            );
        }

        try {
            const errorText = await response.text();
            let errorMessage: string;
            let errorDetails: string | undefined;

            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || `Erreur HTTP: ${response.status}`;
                errorDetails = errorData.details;
            } catch {
                // Si ce n'est pas du JSON, utiliser le texte directement
                errorMessage = errorText || `Erreur HTTP: ${response.status}`;
            }

            throw new ApiException(response.status, errorMessage, errorDetails);
        } catch (e) {
            if (e instanceof ApiException) {
                throw e;
            }
            
            // Erreurs par défaut
            const defaultErrors: Record<number, ApiError> = {
                404: { status: 404, message: 'Inscription non trouvée' },
                400: { status: 400, message: 'Données invalides' },
                403: { status: 403, message: 'Accès non autorisé' },
                500: { status: 500, message: 'Erreur serveur interne', details: 'Vérifiez les logs du backend' }
            };

            const defaultError = defaultErrors[response.status] || {
                status: response.status,
                message: `Erreur inattendue: ${response.status}`
            };

            throw new ApiException(
                defaultError.status,
                defaultError.message,
                defaultError.details
            );
        }
    }

    // Pour DELETE qui retourne 204 No Content
    if (response.status === 204) {
        return null;
    }

    return response.json();
};

export const InscriptionsService = {
    // Récupérer toutes les inscriptions
    getAll: async (): Promise<Inscription[]> => {
        try {
            const response = await fetch(API_ROUTES.inscriptions.getAll, {
                headers: API_HEADERS
            });
            return handleResponse(response);
        } catch (error) {
            console.error('Erreur lors de la récupération des inscriptions:', error);
            throw error instanceof ApiException ? error : new ApiException(500, 'Erreur lors de la récupération des inscriptions');
        }
    },

    // Récupérer une inscription par ID
    getById: async (id: number): Promise<Inscription> => {
        if (typeof id !== 'number' || isNaN(id)) {
            throw new ApiException(400, 'ID d\'inscription invalide');
        }

        try {
            const response = await fetch(API_ROUTES.inscriptions.getById(id), {
                headers: API_HEADERS
            });
            return handleResponse(response);
        } catch (error) {
            console.error(`Erreur lors de la récupération de l'inscription ${id}:`, error);
            throw error instanceof ApiException ? error : new ApiException(500, `Erreur lors de la récupération de l'inscription ${id}`);
        }
    },

    // Créer une nouvelle inscription
    create: async (data: CreateInscriptionDto): Promise<Inscription> => {
        try {
            const response = await fetch(API_ROUTES.inscriptions.create, {
                method: 'POST',
                headers: API_HEADERS,
                body: JSON.stringify(data)
            });
            return handleResponse(response);
        } catch (error) {
            console.error('Erreur lors de la création de l\'inscription:', error);
            throw error instanceof ApiException ? error : new ApiException(500, 'Erreur lors de la création de l\'inscription');
        }
    },

    // Mettre à jour une inscription
    update: async (id: number, data: UpdateInscriptionDto): Promise<Inscription> => {
        if (typeof id !== 'number' || isNaN(id)) {
            throw new ApiException(400, 'ID d\'inscription invalide');
        }

        try {
            const response = await fetch(API_ROUTES.inscriptions.update(id), {
                method: 'PUT',
                headers: API_HEADERS,
                body: JSON.stringify(data)
            });
            return handleResponse(response);
        } catch (error) {
            console.error(`Erreur lors de la mise à jour de l'inscription ${id}:`, error);
            throw error instanceof ApiException ? error : new ApiException(500, `Erreur lors de la mise à jour de l'inscription ${id}`);
        }
    },

    // Confirmer une inscription
    confirm: async (id: number): Promise<Inscription> => {
        if (typeof id !== 'number' || isNaN(id)) {
            throw new ApiException(400, 'ID d\'inscription invalide');
        }

        try {
            const response = await fetch(API_ROUTES.inscriptions.confirm(id), {
                method: 'PUT',
                headers: API_HEADERS
            });
            return handleResponse(response);
        } catch (error) {
            console.error(`Erreur lors de la confirmation de l'inscription ${id}:`, error);
            throw error instanceof ApiException ? error : new ApiException(500, `Erreur lors de la confirmation de l'inscription ${id}`);
        }
    },

    // Annuler une inscription
    cancel: async (id: number): Promise<Inscription> => {
        if (typeof id !== 'number' || isNaN(id)) {
            throw new ApiException(400, 'ID d\'inscription invalide');
        }

        try {
            const response = await fetch(API_ROUTES.inscriptions.cancel(id), {
                method: 'PUT',
                headers: API_HEADERS
            });
            return handleResponse(response);
        } catch (error) {
            console.error(`Erreur lors de l'annulation de l'inscription ${id}:`, error);
            throw error instanceof ApiException ? error : new ApiException(500, `Erreur lors de l'annulation de l'inscription ${id}`);
        }
    },

    // Supprimer une inscription
    delete: async (id: number): Promise<void> => {
        if (typeof id !== 'number' || isNaN(id)) {
            throw new ApiException(400, 'ID d\'inscription invalide');
        }

        try {
            const response = await fetch(API_ROUTES.inscriptions.delete(id), {
                method: 'DELETE',
                headers: API_HEADERS
            });
            await handleResponse(response);
        } catch (error) {
            console.error(`Erreur lors de la suppression de l'inscription ${id}:`, error);
            throw error instanceof ApiException ? error : new ApiException(500, `Erreur lors de la suppression de l'inscription ${id}`);
        }
    }
};