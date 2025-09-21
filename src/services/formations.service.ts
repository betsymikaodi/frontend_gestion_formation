import { Course } from '@/types';
import { ApiError, ApiException } from '@/types/api';
import { API_ROUTES, API_HEADERS } from '@/config/api';

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
            const errorData: ApiError = await response.json();
            console.error('API Error Data:', errorData);
            throw new ApiException(
                response.status,
                errorData.message || `Erreur HTTP: ${response.status}`,
                errorData.details
            );
        } catch (e) {
            if (e instanceof ApiException) {
                throw e;
            }
            
            // Erreurs par défaut si on ne peut pas parser l'erreur du serveur
            const defaultErrors: Record<number, ApiError> = {
                404: { status: 404, message: 'Formation non trouvée' },
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
    return response.json();
};

export const FormationsService = {
    // Récupérer toutes les formations
    getAll: async (): Promise<Course[]> => {
        try {
            const response = await fetch(API_ROUTES.formations.getAll, {
                headers: API_HEADERS,
                method: 'GET'
            });
            return handleResponse(response);
        } catch (error) {
            console.error('Erreur lors de la récupération des formations:', error);
            throw error instanceof ApiException ? error : new ApiException(500, 'Erreur lors de la récupération des formations');
        }
    },

    // Récupérer une formation par son ID
    getById: async (id: number): Promise<Course> => {
        if (!id) {
            throw new ApiException(400, 'ID de formation manquant');
        }

        try {
            const response = await fetch(API_ROUTES.formations.getById(id), {
                headers: API_HEADERS
            });
            return handleResponse(response);
        } catch (error) {
            console.error(`Erreur lors de la récupération de la formation ${id}:`, error);
            throw error instanceof ApiException ? error : new ApiException(500, `Erreur lors de la récupération de la formation ${id}`);
        }
    },

    // Créer une nouvelle formation
    create: async (formation: Omit<Course, 'id_formation'>): Promise<Course> => {
        try {
            const response = await fetch(API_ROUTES.formations.create, {
                method: 'POST',
                headers: API_HEADERS,
                body: JSON.stringify(formation),
            });
            return handleResponse(response);
        } catch (error) {
            console.error('Erreur lors de la création de la formation:', error);
            throw error instanceof ApiException ? error : new ApiException(500, 'Erreur lors de la création de la formation');
        }
    },

    // Mettre à jour une formation
    update: async (id: number | undefined, formation: Omit<Course, 'id_formation'>): Promise<Course> => {
        if (typeof id !== 'number' || isNaN(id)) {
            console.error('ID invalide:', id);
            throw new ApiException(400, 'ID de formation invalide ou manquant');
        }

        try {
            const url = API_ROUTES.formations.update(id);
            console.log('FormationsService.update - Requête:', {
                url,
                method: 'PUT',
                headers: API_HEADERS,
                body: formation
            });

            const response = await fetch(API_ROUTES.formations.update(id), {
                method: 'PUT',
                headers: API_HEADERS,
                body: JSON.stringify(formation),
            });

            console.log('FormationsService.update - Réponse:', {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries())
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('FormationsService.update - Corps de la réponse d\'erreur:', errorText);
            }

            return handleResponse(response);
        } catch (error) {
            console.error(`Erreur lors de la mise à jour de la formation ${id}:`, error);
            throw error instanceof ApiException ? error : new ApiException(500, `Erreur lors de la mise à jour de la formation ${id}`);
        }
    },

    // Supprimer une formation
    delete: async (id: number): Promise<void> => {
        if (!id) {
            throw new ApiException(400, 'ID de formation manquant');
        }

        try {
            const response = await fetch(API_ROUTES.formations.delete(id), {
                method: 'DELETE',
                headers: API_HEADERS
            });

            // Le backend renvoie 204 No Content pour une suppression réussie
            if (response.status === 204) {
                return;
            }

            // Si la réponse n'est pas 204, on laisse handleResponse gérer l'erreur
            await handleResponse(response);
        } catch (error) {
            console.error(`Erreur lors de la suppression de la formation ${id}:`, error);
            throw error instanceof ApiException ? error : new ApiException(500, `Erreur lors de la suppression de la formation ${id}`);
        }
    },
};