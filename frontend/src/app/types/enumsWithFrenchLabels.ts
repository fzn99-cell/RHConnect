// enumsWithFrenchLabels.ts

import {
  Role,
  Department,
  UserStatus,
  RequestType,
  RequestStatus,
} from './schema.types';

export const RoleLabels: Record<Role, string> = {
  admin: 'Administrateur',
  hr: 'Admin RH',
  tl: "Chef d'équipe",
  employee: 'Employé',
  nurse: 'Infirmier/Infirmière',
};

export const DepartmentLabels: Record<Department, string> = {
  none: 'Aucun',
  hiring: 'Recrutement',
  technical: 'Technique',
  nurse: 'Infirmerie',
  finance: 'Finance',
  operations: 'Opérations',
  marketing: 'Marketing',
};

export const UserStatusLabels: Record<UserStatus, string> = {
  active: 'Actif',
  onLeave: 'En congé',
};

export const RequestTypeLabels: Record<RequestType, string> = {
  payslip: 'Fiche de Paie',
  workCertificate: 'Attestation du Travail',
  leave: 'Congé',
  sickLeave: 'Arrêt Maladie',
  complaint: 'Réclamation',
  medicalFileUpdate: 'Mise à jour Dossier Assurance Médical',
};

export const RequestStatusLabels: Record<RequestStatus, string> = {
  pending: 'En attente',
  approved: 'Approuvé',
  rejected: 'Rejeté',
};
