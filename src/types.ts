export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  status: 'active' | 'inactive';
  enrollmentDate: string;
  createdAt: string;
  registration: string;
  fees: number;
}