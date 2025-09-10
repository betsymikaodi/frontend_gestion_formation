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

export interface Course {
  id: string;
  name: string;
  description: string;
  fee: number;
  duration: string;
  status: 'active' | 'inactive';
  createdAt: string;
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