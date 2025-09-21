import { API_ROUTES, API_HEADERS } from '@/config/api';
import { ApiException } from '@/types/api';

export interface Paiement {
    idPaiement: number;
    inscriptionId: number;
    datePaiement: string;
    montant: number;
    modePaiement: string;
    module: string;
}

export interface CreatePaiementDto {
    inscriptionId: number;
    montant: number;
    modePaiement: string;
    module: string;
}

export interface UpdatePaiementDto {
    montant?: number;
    modePaiement?: string;
    module?: string;
}

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorMessage = await response.text();
        throw new ApiException(
            response.status,
            errorMessage || `Erreur HTTP: ${response.status}`
        );
    }
    return response.json();
};

export const PaiementsService = {
    getAll: async (): Promise<Paiement[]> => {
        try {
            const response = await fetch(`${API_ROUTES.paiements.getAll}`, {
                headers: API_HEADERS
            });
            return handleResponse(response);
        } catch (error) {
            console.error('Erreur lors de la récupération des paiements:', error);
            throw error;
        }
    },

    getById: async (id: number): Promise<Paiement> => {
        try {
            const response = await fetch(`${API_ROUTES.paiements.getById(id)}`, {
                headers: API_HEADERS
            });
            return handleResponse(response);
        } catch (error) {
            console.error('Erreur lors de la récupération du paiement:', error);
            throw error;
        }
    },

    getByInscription: async (inscriptionId: number): Promise<Paiement[]> => {
        try {
            const response = await fetch(`${API_ROUTES.paiements.getByInscription(inscriptionId)}`, {
                headers: API_HEADERS
            });
            return handleResponse(response);
        } catch (error) {
            console.error('Erreur lors de la récupération des paiements de l\'inscription:', error);
            throw error;
        }
    },

    create: async (data: CreatePaiementDto): Promise<Paiement> => {
        try {
            const response = await fetch(`${API_ROUTES.paiements.create}`, {
                method: 'POST',
                headers: API_HEADERS,
                body: JSON.stringify(data)
            });
            return handleResponse(response);
        } catch (error) {
            console.error('Erreur lors de la création du paiement:', error);
            throw error;
        }
    },

    update: async (id: number, data: UpdatePaiementDto): Promise<Paiement> => {
        try {
            const response = await fetch(`${API_ROUTES.paiements.update(id)}`, {
                method: 'PUT',
                headers: API_HEADERS,
                body: JSON.stringify(data)
            });
            return handleResponse(response);
        } catch (error) {
            console.error('Erreur lors de la mise à jour du paiement:', error);
            throw error;
        }
    },

    delete: async (id: number): Promise<void> => {
        try {
            const response = await fetch(`${API_ROUTES.paiements.delete(id)}`, {
                method: 'DELETE',
                headers: API_HEADERS
            });
            if (!response.ok) {
                throw new ApiException(
                    response.status,
                    await response.text() || 'Erreur lors de la suppression du paiement'
                );
            }
        } catch (error) {
            console.error('Erreur lors de la suppression du paiement:', error);
            throw error;
        }
    }
};