export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  enrollmentDate: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  courseName: string;
  fee: number;
  paymentStatus: 'paid' | 'pending' | 'overdue';
  enrollmentDate: string;
  dueDate: string;
  paidDate?: string;
  createdAt: string;
}


export interface Inscription {
  idInscription: number;
  dateInscription: string;
  statut: string;
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

export interface Course {
  idFormation: number;
  nom: string;
  description: string;
  frais: number;
  duree: number;
  inscriptions: Inscription[];
  nombreInscrits: number;
}

export interface Payment {
  id: string;
  enrollmentId: string;
  studentId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'cash' | 'card' | 'transfer';
  notes?: string;
  createdAt: string;
}