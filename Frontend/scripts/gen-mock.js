const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../data/db.json');
const outputPath = path.join(__dirname, '../src/app/core/mock-data.ts');

const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const fileHeader = `import { Booking, BranchHead, Client, District, ServiceItem, SiteContent, TestimonialItem, User } from './models';

/**
 * ============================================================================
 * SINGLE SOURCE OF TRUTH: CENTRALIZED MOCK DATA STORE
 * All mock data for the application is defined in this single file.
 * Admin can see ALL data.
 * Regular User can ONLY see their own data.
 * ============================================================================
 */

export const MOCK_USERS: User[] = ${JSON.stringify(db.users, null, 2)};

export const MOCK_DISTRICTS: District[] = ${JSON.stringify(db.districts, null, 2)};

export const MOCK_BRANCH_HEADS: BranchHead[] = ${JSON.stringify(db.branchHeads, null, 2)};

export const MOCK_CLIENTS: Client[] = ${JSON.stringify(db.clients, null, 2)};

export const MOCK_BOOKINGS: Booking[] = ${JSON.stringify(db.bookings, null, 2)};

export const MOCK_SERVICES: ServiceItem[] = ${JSON.stringify(db.services, null, 2)};

export const MOCK_TESTIMONIALS: TestimonialItem[] = ${JSON.stringify(db.testimonials, null, 2)};

export const MOCK_SITE_CONTENT: SiteContent = ${JSON.stringify(db.siteContent, null, 2)};

/**
 * Helper to determine if a role is Admin / Coordinator
 */
export function isAdminRole(role: string | null | undefined): boolean {
  return role === 'admin' || role === 'coordinator';
}

/**
 * Helper to determine if a role is User / Client / Customer / Dealer / Company
 */
export function isUserRole(role: string | null | undefined): boolean {
  return role === 'user' || role === 'client';
}

/**
 * Central Data Filtering Function:
 * - Admin sees ALL bookings (full lifetime records across all districts).
 * - User sees ONLY their own bookings (filtered by clientId or userId).
 */
export function filterBookingsForUser(bookings: Booking[], user: User | null): Booking[] {
  if (!user) return [];
  if (isAdminRole(user.role)) {
    return [...bookings];
  }
  // User role: only their bookings
  const targetId = user.clientId || user.id;
  return bookings.filter(b => b.clientId === targetId || b.clientId === user.clientId);
}
`;

fs.writeFileSync(outputPath, fileHeader, 'utf8');
console.log('Successfully generated src/app/core/mock-data.ts');
