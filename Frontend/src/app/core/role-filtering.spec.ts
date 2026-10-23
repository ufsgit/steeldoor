import { describe, it, expect } from 'vitest';
import { matchesDistrict, filterBookingsForUser } from './mock-data';
import { Booking, User } from './models';

describe('Role-based filtering logic', () => {
  const dummyBookings: Booking[] = [
    {
      id: 'BK-1',
      clientName: 'Client In Ernakulam',
      contactPhone: '9847012345',
      contactEmail: 'client1@example.com',
      clientType: 'customer',
      districtId: '1',
      districtName: 'Ernakulam',
      area: 'Edapally',
      address: 'Edapally, Kochi',
      pincode: '682024',
      status: 'Pending',
      loginRoleId: 3,
      loginId: 4,
      loginName: 'Rajesh Menon',
      doorDetails: { doorType: 'Steel Door', quantity: 1 },
      createdAt: '2026-10-22T10:00:00Z',
      updatedAt: '2026-10-22T10:00:00Z',
      history: []
    },
    {
      id: 'BK-2',
      clientName: 'Client In Trivandrum',
      contactPhone: '9447123456',
      contactEmail: 'client2@example.com',
      clientType: 'customer',
      districtId: '2',
      districtName: 'Trivandrum',
      area: 'Kowdiar',
      address: 'Kowdiar, TVM',
      pincode: '695003',
      status: 'Accepted',
      loginRoleId: 3,
      loginId: 5,
      loginName: 'Suresh Kumar',
      doorDetails: { doorType: 'Steel Door', quantity: 2 },
      createdAt: '2026-10-22T11:00:00Z',
      updatedAt: '2026-10-22T11:00:00Z',
      history: []
    },
    {
      id: 'BK-3',
      clientName: 'Dealer Client',
      contactPhone: '9847188776',
      contactEmail: 'dealer@example.com',
      clientType: 'dealer',
      clientId: 'cli-10',
      districtId: '1',
      districtName: 'Ernakulam',
      area: 'Kaloor',
      address: 'Kaloor, Kochi',
      pincode: '682017',
      status: 'Scheduled',
      loginRoleId: 4,
      loginId: 10,
      loginName: 'Apex Doors',
      doorDetails: { doorType: 'Steel Door', quantity: 3 },
      createdAt: '2026-10-22T12:00:00Z',
      updatedAt: '2026-10-22T12:00:00Z',
      history: []
    }
  ];

  it('Role 1 (Company) sees ALL clients/bookings', () => {
    const userRole1: User = {
      id: '1',
      username: 'company_admin',
      role: 'admin',
      roleId: 1,
      name: 'SteelGuard Executive Board',
      email: 'corporate@steeldoor.com'
    };
    const result = filterBookingsForUser(dummyBookings, userRole1);
    expect(result.length).toBe(3);
  });

  it('Role 2 (Coordinator) sees ALL clients/bookings', () => {
    const userRole2: User = {
      id: '2',
      username: 'admin',
      role: 'coordinator',
      roleId: 2,
      name: 'Elena Vance',
      email: 'admin@steeldoor.com'
    };
    const result = filterBookingsForUser(dummyBookings, userRole2);
    expect(result.length).toBe(3);
  });

  it('Role 3 (Branch Head) sees only clients in their district', () => {
    const userRole3Ekm: User = {
      id: '4',
      username: 'branch_ekm',
      role: 'branch_head',
      roleId: 3,
      districtId: '1',
      districtName: 'Ernakulam',
      name: 'Rajesh Menon',
      email: 'rajesh.menon@steeldoor.com'
    };
    const resultEkm = filterBookingsForUser(dummyBookings, userRole3Ekm);
    expect(resultEkm.length).toBe(2);
    expect(resultEkm.every(b => b.districtName === 'Ernakulam')).toBe(true);

    const userRole3Tvm: User = {
      id: '5',
      username: 'branch_tvm',
      role: 'branch_head',
      roleId: 3,
      districtId: '2',
      districtName: 'Trivandrum',
      name: 'Suresh Kumar',
      email: 'suresh.kumar@steeldoor.com'
    };
    const resultTvm = filterBookingsForUser(dummyBookings, userRole3Tvm);
    expect(resultTvm.length).toBe(1);
    expect(resultTvm[0].id).toBe('BK-2');
  });

  it('Role 4 (Dealer) takes list by login id', () => {
    const userRole4: User = {
      id: '10',
      username: 'apex_dealer',
      role: 'client',
      roleId: 4,
      clientId: 'cli-10',
      name: 'Apex Doors',
      email: 'sales@apexdoors.com'
    };
    const result = filterBookingsForUser(dummyBookings, userRole4);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('BK-3');
    expect(result[0].loginId).toBe(10);
  });

  it('matchesDistrict correctly handles numeric IDs, "Hub" suffix, and codes', () => {
    expect(matchesDistrict('1', 'Ernakulam Hub', '1', 'Ernakulam')).toBe(true);
    expect(matchesDistrict('dist-ekm', 'Ernakulam', '1', 'Ernakulam Hub')).toBe(true);
    expect(matchesDistrict('1', 'Ernakulam', '2', 'Trivandrum')).toBe(false);
  });
});
