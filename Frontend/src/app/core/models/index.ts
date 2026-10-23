export type UserRole = 'admin' | 'user' | 'coordinator' | 'branch_head' | 'client';
export type ClientType = 'customer' | 'dealer' | 'company';
export type BookingStatus = 'Pending' | 'Accepted' | 'Scheduled' | 'Finished' | 'Rejected';

export interface District {
  id: string;
  name: string;
  stateId: string;
  code: string;
  areas: string[];
}

export interface BranchHead {
  id: string;
  name: string;
  email: string;
  phone: string;
  districtId: string;
  districtName: string;
  active: boolean;
  joinedDate?: string;
  experienceYears?: number;
}

export interface Client {
  id: string;
  name: string;
  clientType: ClientType;
  email: string;
  phone: string;
  address: string;
  districtId: string;
  area: string;
  contactPerson?: string;
  gstNumber?: string;
  dealerLicense?: string;
  companyRegNumber?: string;
  hasLogin?: boolean;
  username?: string;
  createdAt: string;
}

export interface BookingHistoryEntry {
  id: string;
  action: 'Created' | 'Status Updated' | 'Scheduled' | 'Finished' | 'Rejected' | 'Reassigned';
  status: BookingStatus;
  timestamp: string;
  performedBy: string;
  role: 'coordinator' | 'branch_head' | 'client' | 'system';
  notes: string;
}

export interface DoorDetails {
  doorType: string;
  brand?: string;
  finish?: string;
  thickness?: string;
  dimensions?: string;
  quantity: number;
  isUrgent?: boolean;
  notes?: string;
  images?: string[];
  documents?: string[];
}

export interface Booking {
  id: string;
  clientId?: string;
  clientName: string;
  clientType: ClientType;
  contactPhone: string;
  contactEmail: string;
  districtId: string;
  districtName: string;
  area: string;
  address: string;
  landmark?: string;
  pincode: string;
  doorDetails: DoorDetails;
  status: BookingStatus;
  branchHeadId?: string;
  branchHeadName?: string;
  scheduledDate?: string;
  completedDate?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  history: BookingHistoryEntry[];
  // Computed flags
  isDelayed?: boolean;
  hoursSinceSubmitted?: number;
  documents?: string[];
  name?: string;
  mobile?: string;
  areaName?: string;
  notes?: string;
  loginRoleId?: number;
  loginId?: number | string;
  loginName?: string;
}

export interface User {
  id: string;
  username: string;
  password?: string;
  role: UserRole;
  name: string;
  email: string;
  phone?: string;
  roleId?: number;
  dbRoleId?: number;
  branchHeadId?: string;
  districtId?: string;
  districtName?: string;
  clientId?: string;
  clientType?: ClientType;
  roleId?: number;
  dbRoleId?: number;
}

export interface ServiceItem {
  id: string;
  title: string;
  tagline: string;
  description: string;
  features: string[];
  doorType: string;
  startingPrice: string;
  warrantyYears: number;
  badge?: string;
}

export interface TestimonialItem {
  id: string;
  author: string;
  role: string;
  rating: number;
  text: string;
  doorModel: string;
}

export interface BannerSlide {
  id: string;
  badge: string;
  title: string;
  description: string;
  image: string;
  link?: string;
  linkText?: string;
}

export interface SiteContent {
  companyName: string;
  tagline: string;
  banners?: BannerSlide[];
  stats: { label: string; value: string }[];
  howItWorks: { step: number; title: string; description: string }[];
}

export interface BookingFilters {
  status?: string;
  districtId?: string;
  branchHeadId?: string;
  clientId?: string;
  clientType?: string;
  search?: string;
}

export interface CreateBookingPayload {
  clientId?: string;
  name?: string;
  clientName: string;
  clientType: ClientType;
  mobile?: string;
  contactPhone: string;
  contactEmail: string;
  districtId: string;
  districtName?: string;
  area: string;
  areaName?: string;
  address: string;
  landmark?: string;
  pincode: string;
  notes?: string;
  status?: string;
  doorDetails: DoorDetails;
  documents?: string[];
  performedBy?: string;
  role?: UserRole;
  branchHeadName?: string;
}

export interface StatusUpdatePayload {
  status: BookingStatus;
  performedBy: string;
  role: UserRole;
  scheduledDate?: string;
  rejectionReason?: string;
  notes?: string;
}

export interface ReassignBookingPayload {
  newBranchHeadId: string;
  reason: string;
  performedBy: string;
  role?: UserRole;
}
