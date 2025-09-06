// THIS schema.types.ts is 1-1 equal to how prisma schema is defined
export interface User {
  id: number;
  email: string;
  password: string;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  avatar?: string | null;
  phone?: string | null;
  country?: string | null;
  city?: string | null;
  hireDate?: string | null;

  notificationPreference: boolean;
  confidentialityPreference: boolean;
  department: Department;
  role: Role;
  status: UserStatus;
  createdAt: string;

  resetToken?: string | null;
  resetTokenExpiresAt?: string | null;
  verificationToken?: string | null;
  verificationTokenExpiresAt?: string | null;

  requests?: Request[];
  notifications?: Notification[];
  audits?: Audit[];
}

export interface Request {
  id: number;
  userId: number;
  requestType: RequestType;
  description: string;
  status: RequestStatus;
  submittedAt: string;
  comment?: string | null;

  // Relations
  files?: File[];
  audits?: Audit[];
  notifications?: Notification[];
  user?: User;

  // Sub-request 1:1
  leaveRequest?: LeaveRequest;
  sickLeaveRequest?: SickLeaveRequest;
  payslipRequest?: PayslipRequest;
  workCertificateRequest?: WorkCertificateRequest;
  medicalFileUpdateRequest?: MedicalFileUpdateRequest;
}

export interface LeaveRequest {
  id: number;
  requestId: number;
  startDate: string;
  endDate: string;
}

export interface SickLeaveRequest {
  id: number;
  requestId: number;
  startDate: string;
  endDate: string;
  sickDays?: number | null;
}

export interface MedicalFileUpdateRequest {
  id: number;
  requestId: number;
  filePath: string;
  notes: string;
  mrid: string;
  uploadedAt: string;
}

export interface PayslipRequest {
  id: number;
  requestId: number;
  deliveryMode: string;
}

export interface WorkCertificateRequest {
  id: number;
  requestId: number;
  purpose?: string | null;
}

export interface File {
  id: number;
  requestId: number;
  originalName: string;
  storedName: string;
  filePath: string;
  request?: Request;
  downloadUrl?: string; // only on frontend for downloading
}

export interface Audit {
  id: number;
  requestId: number;
  field: string;
  oldValue?: string | null;
  newValue?: string | null;
  changedBy: number;
  changedAt: string;
  request?: Request;
  user?: User;
}

export interface Notification {
  id: number;
  userId?: number | null;
  requestId?: number | null;
  title: string;
  message: string;
  createdAt: string;
  user?: User;
  request?: Request;
}

export enum Role {
  admin = 'admin',
  hr = 'hr',
  tl = 'tl',
  employee = 'employee',
  nurse = 'nurse',
}

export enum Department {
  none = 'none',
  hiring = 'hiring',
  technical = 'technical',
  nurse = 'nurse',
  finance = 'finance',
  operations = 'operations',
  marketing = 'marketing',
}

export enum UserStatus {
  active = 'active',
  onLeave = 'onLeave',
}

export enum RequestType {
  workCertificate = 'workCertificate',
  leave = 'leave',
  payslip = 'payslip',
  complaint = 'complaint',
  sickLeave = 'sickLeave',
  medicalFileUpdate = 'medicalFileUpdate',
}

export enum RequestStatus {
  pending = 'pending',
  approved = 'approved',
  rejected = 'rejected',
}
