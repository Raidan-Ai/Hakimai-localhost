/**
 * Hakim AI - Global Types
 */

export enum UserRole {
  DOCTOR = 'DOCTOR',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  clinicId?: string;
}

export interface Patient {
  id: string;
  name: string;
  dateOfBirth: string;
  encryptedMedicalHistory: string;
}

export interface Case {
  id: string;
  patientId: string;
  doctorId: string;
  aiModelUsed: string;
  summary: string;
  status: 'OPEN' | 'REVIEWED' | 'CLOSED';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  timestamp: string;
}

export enum Priority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: Date;
  priority: Priority;
}
