export type UserRole = 'admin' | 'user' | 'coordinator' | 'branch_head' | 'client';
export type ClientType = 'customer' | 'dealer' | 'company';
export type BookingStatus = 'Pending' | 'Accepted' | 'Scheduled' | 'Finished' | 'Rejected';

export interface State {
  id: number | string;
  name: string;
  code: string;
  created_at?: string;
}

export interface District {
  id: string;
  name: string;
  stateId?: string | number;
  state_id?: number;
  code: string;
  areas: string[];
}

export interface AreaItem {
  id: number;
  district_id: number;
  name: string;
  pincode?: string | null;
  is_deleted?: number;
  district_name?: string;
  state_id?: number;
  state_name?: string;
  created_at?: string;
}

export interface AreaHierarchyResponse {
  states: State[];
  districts: Array<{
    id: number | string;
    state_id: number;
    name: string;
    code: string;
    area_count?: number;
  }>;
  selectedDistrictId: number | string;
  areas: AreaItem[];
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
  username?: string;
  password?: string;
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
  id: number | string;
  name: string;
  mobile: string;
  address: string;
  notes?: string | null;
  status: string;
  login_role_id?: number | null;
  loginRoleId?: number | null;
  login_id?: number | null;
  loginId?: number | string | null;
  login_name?: string | null;
  loginName?: string | null;
  state_id?: number | null;
  stateId?: number | string | null;
  state_name?: string | null;
  stateName?: string | null;
  district_id?: number | null;
  districtId?: string;
  district_name?: string | null;
  districtName?: string;
  area_id?: number | null;
  areaId?: number | string | null;
  area_name?: string | null;
  areaName?: string;
  area?: string;
  branch_head_id?: number | null;
  branchHeadId?: string;
  branch_head_name?: string | null;
  branchHeadName?: string;
  documents?: string[] | any;
  is_deleted?: number;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;

  // Compatibility helper fields for orders table view & legacy components
  clientId?: string | number;
  clientName?: string;
  contactPhone?: string;
  contactEmail?: string;
  clientType?: ClientType;
  pincode?: string;
  landmark?: string;
  scheduledDate?: string;
  completedDate?: string;
  rejectionReason?: string;
  history?: BookingHistoryEntry[];
  doorDetails?: DoorDetails;
  isDelayed?: boolean;
  hoursSinceSubmitted?: number;
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
  name: string;
  mobile: string;
  address: string;
  notes?: string | null;
  status?: string;
  loginRoleId?: number | null;
  login_role_id?: number | null;
  loginId?: number | string | null;
  login_id?: number | string | null;
  loginName?: string | null;
  login_name?: string | null;
  stateId?: number | string | null;
  state_id?: number | string | null;
  stateName?: string | null;
  state_name?: string | null;
  districtId?: number | string | null;
  district_id?: number | string | null;
  districtName?: string | null;
  district_name?: string | null;
  areaId?: number | string | null;
  area_id?: number | string | null;
  areaName?: string | null;
  area_name?: string | null;
  area?: string | null;
  branchHeadId?: number | string | null;
  branch_head_id?: number | string | null;
  branchHeadName?: string | null;
  branch_head_name?: string | null;
  documents?: string[] | any;

  // Compatibility fields
  clientId?: string | number;
  clientName?: string;
  clientType?: ClientType;
  contactPhone?: string;
  contactEmail?: string;
  pincode?: string;
  landmark?: string;
  doorDetails?: DoorDetails;
  performedBy?: string;
  role?: UserRole;
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
