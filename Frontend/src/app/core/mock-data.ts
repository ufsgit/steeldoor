import { Booking, BranchHead, Client, District, ServiceItem, SiteContent, TestimonialItem, User } from './models';

/**
 * ============================================================================
 * SINGLE SOURCE OF TRUTH: CENTRALIZED MOCK DATA STORE
 * All mock data for the application is defined in this single file.
 * Admin can see ALL data.
 * Regular User can ONLY see their own data.
 * ============================================================================
 */

export const MOCK_USERS: User[] = [
  {
    "id": "usr-admin",
    "username": "admin",
    "password": "123",
    "role": "admin",
    "name": "Elena Vance (Super Admin)",
    "email": "admin@steeldoor.com",
    "phone": "+91 98000 11223"
  },
  {
    "id": "usr-user",
    "username": "user",
    "password": "123",
    "role": "user",
    "clientId": "cli-1",
    "name": "John Mathew (Customer)",
    "email": "john.mathew@gmail.com",
    "phone": "+91 94470 55443",
    "clientType": "customer"
  },
  {
    "id": "usr-admin-2",
    "username": "coordinator",
    "password": "123",
    "role": "admin",
    "name": "Elena Vance (Super Admin)",
    "email": "admin@steeldoor.com",
    "phone": "+91 98000 11223"
  },
  {
    "id": "usr-bh1",
    "username": "branch_ekm",
    "password": "123",
    "role": "branch_head",
    "branchHeadId": "bh-1",
    "name": "Rajesh Menon",
    "email": "rajesh.menon@steeldoor.com",
    "phone": "+91 98470 12345",
    "districtId": "dist-ekm"
  },
  {
    "id": "usr-bh2",
    "username": "branch_tvm",
    "password": "123",
    "role": "branch_head",
    "branchHeadId": "bh-2",
    "name": "Suresh Kumar",
    "email": "suresh.kumar@steeldoor.com",
    "phone": "+91 98471 23456",
    "districtId": "dist-tvm"
  },
  {
    "id": "usr-cust1",
    "username": "john_customer",
    "password": "123",
    "role": "client",
    "clientId": "cli-1",
    "name": "John Mathew",
    "email": "john.mathew@gmail.com",
    "phone": "+91 94470 55443",
    "clientType": "customer"
  },
  {
    "id": "usr-dlr1",
    "username": "apex_dealer",
    "password": "123",
    "role": "client",
    "clientId": "cli-6",
    "name": "Apex Hardware Supplies",
    "email": "orders@apexhardware.in",
    "phone": "+91 94471 88776",
    "clientType": "dealer"
  },
  {
    "id": "usr-cmp1",
    "username": "metro_builders",
    "password": "123",
    "role": "client",
    "clientId": "cli-11",
    "name": "Metro Infra & Builders",
    "email": "procurement@metroinfra.com",
    "phone": "+91 94472 99001",
    "clientType": "company"
  }
];


export const MOCK_DISTRICTS: District[] = [
  {
    "id": "dist-ekm",
    "name": "Ernakulam",
    "stateId": "KL",
    "code": "EKM",
    "areas": [
      "Edapally",
      "Kakkanad",
      "Aluva",
      "Palarivattom",
      "Fort Kochi",
      "Vyttila",
      "Kaloor",
      "Tripunithura",
      "Kadavanthra",
      "Panampilly Nagar",
      "Marine Drive",
      "Ravipuram",
      "Thrikkakara",
      "Kalamassery",
      "Angamaly",
      "Perumbavoor",
      "Muvattupuzha",
      "Kothamangalam",
      "North Paravur",
      "Mattancherry",
      "Thevara",
      "Maradu",
      "Cherai",
      "Piravom",
      "Kolenchery"
    ]
  },
  {
    "id": "dist-tvm",
    "name": "Trivandrum",
    "stateId": "KL",
    "code": "TVM",
    "areas": [
      "Pattom",
      "Kazhakoottam",
      "Vellayambalam",
      "Kowdiar",
      "Technopark",
      "Sreekaryam",
      "Poojappura"
    ]
  },
  {
    "id": "dist-clt",
    "name": "Kozhikode",
    "stateId": "KL",
    "code": "CLT",
    "areas": [
      "Mavoor Road",
      "Nadakkavu",
      "Beypore",
      "Palayam",
      "Medical College",
      "West Hill",
      "Feroke"
    ]
  },
  {
    "id": "dist-tsr",
    "name": "Thrissur",
    "stateId": "KL",
    "code": "TSR",
    "areas": [
      "Swaraj Round",
      "Ayyanthole",
      "Ollur",
      "Mannuthy",
      "Kuriachira",
      "Puzhakkal",
      "Poonkunnam"
    ]
  },
  {
    "id": "dist-knr",
    "name": "Kannur",
    "stateId": "KL",
    "code": "KNR",
    "areas": [
      "Talap",
      "Thana",
      "Payyambalam",
      "South Bazar",
      "Chala",
      "Pallikunnu",
      "Valapattanam"
    ]
  }
];

export const MOCK_BRANCH_HEADS: BranchHead[] = [
  {
    "id": "bh-1",
    "name": "Rajesh Menon",
    "email": "rajesh.menon@steeldoor.com",
    "phone": "+91 98470 12345",
    "districtId": "dist-ekm",
    "districtName": "Ernakulam",
    "active": true,
    "joinedDate": "2023-01-15T09:00:00.000Z",
    "experienceYears": 8
  },
  {
    "id": "bh-2",
    "name": "Suresh Kumar",
    "email": "suresh.kumar@steeldoor.com",
    "phone": "+91 98471 23456",
    "districtId": "dist-tvm",
    "districtName": "Trivandrum",
    "active": true,
    "joinedDate": "2023-03-20T09:00:00.000Z",
    "experienceYears": 6
  },
  {
    "id": "bh-3",
    "name": "Anil Varma",
    "email": "anil.varma@steeldoor.com",
    "phone": "+91 98472 34567",
    "districtId": "dist-clt",
    "districtName": "Kozhikode",
    "active": true,
    "joinedDate": "2023-05-10T09:00:00.000Z",
    "experienceYears": 10
  },
  {
    "id": "bh-4",
    "name": "Prakash Nair",
    "email": "prakash.nair@steeldoor.com",
    "phone": "+91 98473 45678",
    "districtId": "dist-tsr",
    "districtName": "Thrissur",
    "active": true,
    "joinedDate": "2023-08-01T09:00:00.000Z",
    "experienceYears": 5
  },
  {
    "id": "bh-5",
    "name": "Deepak Pillai",
    "email": "deepak.pillai@steeldoor.com",
    "phone": "+91 98474 56789",
    "districtId": "dist-knr",
    "districtName": "Kannur",
    "active": true,
    "joinedDate": "2023-11-12T09:00:00.000Z",
    "experienceYears": 7
  }
];

export const MOCK_CLIENTS: Client[] = [
  {
    "id": "cli-1",
    "name": "John Mathew",
    "clientType": "customer",
    "email": "john.mathew@gmail.com",
    "phone": "+91 94470 55443",
    "address": "Mathew Villa, NH Bypass Road, Kakkanad",
    "districtId": "dist-ekm",
    "area": "Kakkanad",
    "createdAt": "2024-01-10T10:00:00.000Z"
  },
  {
    "id": "cli-2",
    "name": "Sarah Thomas",
    "clientType": "customer",
    "email": "sarah.t@outlook.com",
    "phone": "+91 94470 11223",
    "address": "Flat 4B, Silver Crest, Kowdiar",
    "districtId": "dist-tvm",
    "area": "Kowdiar",
    "createdAt": "2024-01-12T11:20:00.000Z"
  },
  {
    "id": "cli-3",
    "name": "Arun Nair",
    "clientType": "customer",
    "email": "arun.nair78@yahoo.com",
    "phone": "+91 94470 22334",
    "address": "Nair Nilayam, Mavoor Road",
    "districtId": "dist-clt",
    "area": "Mavoor Road",
    "createdAt": "2024-01-14T08:15:00.000Z"
  },
  {
    "id": "cli-4",
    "name": "Lakshmi Priya",
    "clientType": "customer",
    "email": "lakshmi.priya@gmail.com",
    "phone": "+91 94470 33445",
    "address": "Krishna Kripa, Swaraj Round South",
    "districtId": "dist-tsr",
    "area": "Swaraj Round",
    "createdAt": "2024-01-15T14:40:00.000Z"
  },
  {
    "id": "cli-5",
    "name": "Vijay George",
    "clientType": "customer",
    "email": "vijay.george@gmail.com",
    "phone": "+91 94470 44556",
    "address": "Sea View Heights, Payyambalam",
    "districtId": "dist-knr",
    "area": "Payyambalam",
    "createdAt": "2024-01-18T16:00:00.000Z"
  },
  {
    "id": "cli-6",
    "name": "Apex Hardware Supplies",
    "clientType": "dealer",
    "contactPerson": "Ramesh Kumar",
    "email": "orders@apexhardware.in",
    "phone": "+91 94471 88776",
    "gstNumber": "32AABCA1234F1Z1",
    "dealerLicense": "DLR-KL-EKM-881",
    "address": "Industrial Estate, Aluva",
    "districtId": "dist-ekm",
    "area": "Aluva",
    "hasLogin": true,
    "username": "apex_dealer",
    "createdAt": "2024-01-05T09:00:00.000Z"
  },
  {
    "id": "cli-7",
    "name": "Royal Steel Traders",
    "clientType": "dealer",
    "contactPerson": "Faisal Mohammed",
    "email": "royalsteel@traders.com",
    "phone": "+91 94471 99887",
    "gstNumber": "32AABCR5678K1Z5",
    "dealerLicense": "DLR-KL-CLT-402",
    "address": "Nadakkavu Junction, Kozhikode",
    "districtId": "dist-clt",
    "area": "Nadakkavu",
    "hasLogin": true,
    "username": "royal_steel",
    "createdAt": "2024-01-06T11:00:00.000Z"
  },
  {
    "id": "cli-8",
    "name": "Malabar Building Solutions",
    "clientType": "dealer",
    "contactPerson": "Haridas K",
    "email": "malabar.build@rediffmail.com",
    "phone": "+91 94471 11223",
    "gstNumber": "32AABCM9012P1Z2",
    "dealerLicense": "DLR-KL-KNR-109",
    "address": "South Bazar, Kannur",
    "districtId": "dist-knr",
    "area": "South Bazar",
    "hasLogin": false,
    "createdAt": "2024-01-08T12:00:00.000Z"
  },
  {
    "id": "cli-9",
    "name": "City Door Emporium",
    "clientType": "dealer",
    "contactPerson": "Manoj Kurian",
    "email": "citydoor@emporium.com",
    "phone": "+91 94471 33445",
    "gstNumber": "32AABCC3456L1Z8",
    "dealerLicense": "DLR-KL-TVM-650",
    "address": "Pattom Palace Road, Trivandrum",
    "districtId": "dist-tvm",
    "area": "Pattom",
    "hasLogin": false,
    "createdAt": "2024-01-09T14:30:00.000Z"
  },
  {
    "id": "cli-10",
    "name": "Highland Building Hub",
    "clientType": "dealer",
    "contactPerson": "Devanand S",
    "email": "devanand@highlandhub.in",
    "phone": "+91 94471 55667",
    "gstNumber": "32AABCH7890Q1Z3",
    "dealerLicense": "DLR-KL-TSR-220",
    "address": "Mannuthy Highway Road, Thrissur",
    "districtId": "dist-tsr",
    "area": "Mannuthy",
    "hasLogin": false,
    "createdAt": "2024-01-11T15:00:00.000Z"
  },
  {
    "id": "cli-11",
    "name": "Metro Infra & Builders",
    "clientType": "company",
    "contactPerson": "Vinod Sreedharan (VP Projects)",
    "email": "procurement@metroinfra.com",
    "phone": "+91 94472 99001",
    "gstNumber": "32AABCM4567R1Z9",
    "companyRegNumber": "CIN-U45200KL2018PTC054",
    "address": "Metro Towers, Edapally",
    "districtId": "dist-ekm",
    "area": "Edapally",
    "hasLogin": true,
    "username": "metro_builders",
    "createdAt": "2024-01-02T10:00:00.000Z"
  },
  {
    "id": "cli-12",
    "name": "Skyline Architectural Projects",
    "clientType": "company",
    "contactPerson": "Anjali Pillai",
    "email": "projects@skylinearch.org",
    "phone": "+91 94472 88992",
    "gstNumber": "32AABCS8912T1Z4",
    "companyRegNumber": "CIN-U45201KL2016PTC042",
    "address": "Technopark Phase 3, Trivandrum",
    "districtId": "dist-tvm",
    "area": "Technopark",
    "hasLogin": false,
    "createdAt": "2024-01-03T11:30:00.000Z"
  },
  {
    "id": "cli-13",
    "name": "Prestige Living Spaces",
    "clientType": "company",
    "contactPerson": "Biju Varghese",
    "email": "tenders@prestigeliving.com",
    "phone": "+91 94472 77883",
    "gstNumber": "32AABCP3451V1Z7",
    "companyRegNumber": "CIN-U70102KL2019PTC061",
    "address": "Puzhakkal Sobha City Road, Thrissur",
    "districtId": "dist-tsr",
    "area": "Puzhakkal",
    "hasLogin": false,
    "createdAt": "2024-01-04T14:15:00.000Z"
  },
  {
    "id": "cli-14",
    "name": "GreenTech Developers Ltd",
    "clientType": "company",
    "contactPerson": "Kavitha Raman",
    "email": "site@greentechdev.in",
    "phone": "+91 94472 66774",
    "gstNumber": "32AABCG6789W1Z1",
    "companyRegNumber": "CIN-U45209KL2020PLC072",
    "address": "Beach Road, Beypore, Kozhikode",
    "districtId": "dist-clt",
    "area": "Beypore",
    "hasLogin": false,
    "createdAt": "2024-01-07T13:45:00.000Z"
  },
  {
    "id": "cli-15",
    "name": "Coastal Projects Pvt Ltd",
    "clientType": "company",
    "contactPerson": "Pradeep Chandran",
    "email": "ops@coastalprojects.co",
    "phone": "+91 94472 55665",
    "gstNumber": "32AABCC1290Z1Z0",
    "companyRegNumber": "CIN-U45204KL2017PTC049",
    "address": "Fort Road, Talap, Kannur",
    "districtId": "dist-knr",
    "area": "Talap",
    "hasLogin": false,
    "createdAt": "2024-01-09T16:20:00.000Z"
  },
  {
    "id": "cli-16",
    "name": "Apex Residency Association",
    "clientType": "company",
    "contactPerson": "Ravi Shankar",
    "email": "secretary@apexresidency.org",
    "phone": "+91 94472 44332",
    "gstNumber": "32AABCA8891M1Z6",
    "companyRegNumber": "CIN-U91110KL2021NPL080",
    "address": "Vyttila Mobility Hub Road, Ernakulam",
    "districtId": "dist-ekm",
    "area": "Vyttila",
    "hasLogin": false,
    "createdAt": "2024-01-10T17:00:00.000Z"
  }
];

export const MOCK_BOOKINGS: Booking[] = [
  {
    "id": "BK-2026-1041",
    "clientName": "Riju Sabu",
    "clientType": "customer",
    "contactPhone": "1234679142",
    "contactEmail": "rijusabu89@gmail.com",
    "districtId": "dist-ekm",
    "districtName": "Ernakulam",
    "area": "Edapally",
    "address": "fffxfx",
    "landmark": "tytydy",
    "pincode": "682030",
    "doorDetails": {
      "doorType": "Residential Steel Door Installation",
      "finish": "Precision Alignment",
      "dimensions": "Site Clearance Survey",
      "thickness": "Standard Frame",
      "quantity": 2,
      "isUrgent": true
    },
    "status": "Pending",
    "branchHeadId": "bh-1",
    "branchHeadName": "Rajesh Menon",
    "createdAt": "2026-10-14T06:30:55.056Z",
    "updatedAt": "2026-10-14T06:30:55.056Z",
    "history": [
      {
        "id": "hist-5056",
        "action": "Created",
        "status": "Pending",
        "timestamp": "2026-10-14T06:30:55.056Z",
        "performedBy": "Riju Sabu (Customer)",
        "role": "client",
        "notes": "Booking registered. Auto-assigned to Ernakulam Branch Head: Rajesh Menon."
      }
    ]
  },
  {
    "id": "BK-2026-1040",
    "clientName": "Kavitha Ramesh",
    "clientType": "customer",
    "contactPhone": "9847123456",
    "contactEmail": "kavitha@example.com",
    "districtId": "dist-ekm",
    "districtName": "Ernakulam",
    "area": "Edapally",
    "address": "Flat 4B, Sky Towers, Metro Pillar 320",
    "pincode": "682024",
    "doorDetails": {
      "doorType": "Residential Steel Door Installation",
      "finish": "Precision Alignment",
      "dimensions": "Site Clearance Survey",
      "thickness": "Standard Frame",
      "quantity": 2,
      "isUrgent": false
    },
    "status": "Pending",
    "branchHeadId": "bh-1",
    "branchHeadName": "Rajesh Menon",
    "createdAt": "2026-10-13T11:53:52.133Z",
    "updatedAt": "2026-10-13T11:53:52.133Z",
    "history": [
      {
        "id": "hist-2133",
        "action": "Created",
        "status": "Pending",
        "timestamp": "2026-10-13T11:53:52.133Z",
        "performedBy": "Kavitha Ramesh (Customer)",
        "role": "client",
        "notes": "Booking registered. Auto-assigned to Ernakulam Branch Head: Rajesh Menon."
      }
    ]
  },
  {
    "id": "BK-2026-1039",
    "clientName": "Dr. Anoop Nair",
    "clientType": "customer",
    "contactPhone": "9847112233",
    "contactEmail": "anoop.nair@example.com",
    "districtId": "dist-ekm",
    "districtName": "Ernakulam",
    "area": "Edapally",
    "address": "Plot 12, Skyline Villa, Panampilly Nagar",
    "pincode": "682036",
    "doorDetails": {
      "doorType": "Security Steel Door",
      "finish": "Matte Walnut Grain",
      "dimensions": "3.5ft x 7.0ft",
      "thickness": "70mm Multi-Lock",
      "quantity": 2,
      "isUrgent": false
    },
    "status": "Pending",
    "branchHeadId": "bh-1",
    "branchHeadName": "Rajesh Menon",
    "createdAt": "2026-10-13T10:51:27.595Z",
    "updatedAt": "2026-10-13T10:51:27.595Z",
    "history": [
      {
        "id": "hist-7595",
        "action": "Created",
        "status": "Pending",
        "timestamp": "2026-10-13T10:51:27.595Z",
        "performedBy": "Dr. Anoop Nair (Customer)",
        "role": "client",
        "notes": "Booking registered. Auto-assigned to Ernakulam Branch Head: Rajesh Menon."
      }
    ]
  },
  {
    "id": "BK-2026-1038",
    "clientName": "Ramesh Sharma",
    "clientType": "customer",
    "contactPhone": "9847123456",
    "contactEmail": "ramesh@example.com",
    "districtId": "dist-ekm",
    "districtName": "Ernakulam",
    "area": "Edapally",
    "address": "Flat 4B, Emerald Heights, MG Road",
    "pincode": "682030",
    "doorDetails": {
      "doorType": "Security Steel Door",
      "finish": "Matte Walnut Grain",
      "dimensions": "3.5ft x 7.0ft",
      "thickness": "70mm Multi-Lock",
      "quantity": 1,
      "isUrgent": false
    },
    "status": "Pending",
    "branchHeadId": "bh-1",
    "branchHeadName": "Rajesh Menon",
    "createdAt": "2026-10-13T10:29:33.422Z",
    "updatedAt": "2026-10-13T10:29:33.422Z",
    "history": [
      {
        "id": "hist-3422",
        "action": "Created",
        "status": "Pending",
        "timestamp": "2026-10-13T10:29:33.422Z",
        "performedBy": "Ramesh Sharma (Customer)",
        "role": "client",
        "notes": "Booking registered. Auto-assigned to Ernakulam Branch Head: Rajesh Menon."
      }
    ]
  },
  {
    "id": "BK-2026-1037",
    "clientName": "Riju Sabu",
    "clientType": "customer",
    "contactPhone": "9847012345",
    "contactEmail": "rijusabu@gmail.com",
    "districtId": "dist-ekm",
    "districtName": "Ernakulam",
    "area": "Edapally",
    "address": "Flat 4B, Skyline Apartments, MG Road",
    "landmark": "Near Jos Junction",
    "pincode": "682030",
    "doorDetails": {
      "doorType": "Fire-Rated 120min Door",
      "finish": "Matte Walnut Grain",
      "dimensions": "3.5ft x 7.0ft",
      "thickness": "70mm Multi-Lock",
      "quantity": 1,
      "isUrgent": false
    },
    "status": "Pending",
    "branchHeadId": "bh-1",
    "branchHeadName": "Rajesh Menon",
    "createdAt": "2026-10-13T09:32:49.916Z",
    "updatedAt": "2026-10-13T09:32:49.916Z",
    "history": [
      {
        "id": "hist-9916",
        "action": "Created",
        "status": "Pending",
        "timestamp": "2026-10-13T09:32:49.916Z",
        "performedBy": "Riju Sabu (Client)",
        "role": "client",
        "notes": "Booking registered. Auto-assigned to Ernakulam Branch Head: Rajesh Menon."
      }
    ]
  },
  {
    "id": "BK-2026-1036",
    "clientName": "alma",
    "clientType": "customer",
    "contactPhone": "08592891322",
    "contactEmail": "alma@gmail.com",
    "districtId": "dist-ekm",
    "districtName": "Ernakulam",
    "area": "Edapally",
    "address": "yazin mansil",
    "landmark": "uzu",
    "pincode": "682030",
    "doorDetails": {
      "doorType": "Security Steel Door",
      "finish": "Satin Ivory White",
      "dimensions": "3.5ft x 7.0ft",
      "thickness": "60mm Fire Insulated",
      "quantity": 1,
      "isUrgent": true,
      "notes": "yoyo"
    },
    "status": "Pending",
    "branchHeadId": "bh-1",
    "branchHeadName": "Rajesh Menon",
    "createdAt": "2026-10-13T06:35:33.674Z",
    "updatedAt": "2026-10-13T06:35:33.674Z",
    "history": [
      {
        "id": "hist-3674",
        "action": "Created",
        "status": "Pending",
        "timestamp": "2026-10-13T06:35:33.674Z",
        "performedBy": "alma (Client)",
        "role": "client",
        "notes": "Booking registered. Auto-assigned to Ernakulam Branch Head: Rajesh Menon."
      }
    ]
  },
  {
    "id": "BK-2026-1035",
    "clientName": "Deepa Chandran",
    "clientType": "customer",
    "contactPhone": "+91 94475 99887",
    "contactEmail": "deepa.c@gmail.com",
    "districtId": "dist-ekm",
    "districtName": "Ernakulam",
    "area": "Kakkanad",
    "address": "Infopark Expressway, Smart City Phase 1",
    "landmark": "Opposite Infopark Main Gate",
    "pincode": "682042",
    "doorDetails": {
      "doorType": "Security Steel Door",
      "finish": "Natural Teak Wood Grain",
      "thickness": "70mm Multi-Lock",
      "dimensions": "3.5ft x 7.0ft",
      "quantity": 1,
      "isUrgent": false,
      "notes": "Front main entrance door replacement"
    },
    "status": "Pending",
    "branchHeadId": "bh-2",
    "branchHeadName": "Suresh Kumar",
    "createdAt": "2026-10-13T06:26:58.542Z",
    "updatedAt": "2026-10-13T06:26:58.587Z",
    "history": [
      {
        "id": "hist-8543",
        "action": "Created",
        "status": "Pending",
        "timestamp": "2026-10-13T06:26:58.542Z",
        "performedBy": "Deepa Chandran (Client)",
        "role": "client",
        "notes": "Booking registered. Auto-assigned to Ernakulam Branch Head: Rajesh Menon."
      },
      {
        "id": "hist-8576",
        "action": "Scheduled",
        "status": "Scheduled",
        "timestamp": "2026-10-13T06:26:58.560Z",
        "performedBy": "User",
        "role": "coordinator",
        "notes": "Fitted date scheduled for: 25/10/2026, 3:30:00 pm"
      },
      {
        "id": "hist-8587",
        "action": "Reassigned",
        "status": "Pending",
        "timestamp": "2026-10-13T06:26:58.587Z",
        "performedBy": "Super Admin",
        "role": "coordinator",
        "notes": "Reassigned from Rajesh Menon to Suresh Kumar (Trivandrum). Reason: Ernakulam team overbooked; transferred to regional specialist for rapid fitting."
      }
    ],
    "scheduledDate": "2026-10-25T10:00:00.000Z"
  },
  {
    "id": "BK-2026-1034",
    "clientName": "Deepa Chandran",
    "clientType": "customer",
    "contactPhone": "+91 94475 99887",
    "contactEmail": "deepa.c@gmail.com",
    "districtId": "dist-ekm",
    "districtName": "Ernakulam",
    "area": "Kakkanad",
    "address": "Infopark Expressway, Smart City Phase 1",
    "landmark": "Opposite Infopark Main Gate",
    "pincode": "682042",
    "doorDetails": {
      "doorType": "Security Steel Door",
      "finish": "Natural Teak Wood Grain",
      "thickness": "70mm Multi-Lock",
      "dimensions": "3.5ft x 7.0ft",
      "quantity": 1,
      "isUrgent": false,
      "notes": "Front main entrance door replacement"
    },
    "status": "Pending",
    "branchHeadId": "bh-2",
    "branchHeadName": "Suresh Kumar",
    "createdAt": "2026-10-13T06:24:16.689Z",
    "updatedAt": "2026-10-13T06:24:16.731Z",
    "history": [
      {
        "id": "hist-6689",
        "action": "Created",
        "status": "Pending",
        "timestamp": "2026-10-13T06:24:16.689Z",
        "performedBy": "Deepa Chandran (Client)",
        "role": "client",
        "notes": "Booking registered. Auto-assigned to Ernakulam Branch Head: Rajesh Menon."
      },
      {
        "id": "hist-6722",
        "action": "Scheduled",
        "status": "Scheduled",
        "timestamp": "2026-10-13T06:24:16.702Z",
        "performedBy": "User",
        "role": "coordinator",
        "notes": "Fitted date scheduled for: 25/10/2026, 3:30:00 pm"
      },
      {
        "id": "hist-6731",
        "action": "Reassigned",
        "status": "Pending",
        "timestamp": "2026-10-13T06:24:16.731Z",
        "performedBy": "Super Admin",
        "role": "coordinator",
        "notes": "Reassigned from Rajesh Menon to Suresh Kumar (Trivandrum). Reason: Ernakulam team overbooked; transferred to regional specialist for rapid fitting."
      }
    ],
    "scheduledDate": "2026-10-25T10:00:00.000Z"
  },
  {
    "id": "BK-2026-1033",
    "clientName": "Deepa Chandran",
    "clientType": "customer",
    "contactPhone": "+91 94475 99887",
    "contactEmail": "deepa.c@gmail.com",
    "districtId": "dist-ekm",
    "districtName": "Ernakulam",
    "area": "Kakkanad",
    "address": "Infopark Expressway, Smart City Phase 1",
    "landmark": "Opposite Infopark Main Gate",
    "pincode": "682042",
    "doorDetails": {
      "doorType": "Security Steel Door",
      "finish": "Natural Teak Wood Grain",
      "thickness": "70mm Multi-Lock",
      "dimensions": "3.5ft x 7.0ft",
      "quantity": 1,
      "isUrgent": false,
      "notes": "Front main entrance door replacement"
    },
    "status": "Pending",
    "branchHeadId": "bh-2",
    "branchHeadName": "Suresh Kumar",
    "createdAt": "2026-10-13T06:23:11.347Z",
    "updatedAt": "2026-10-13T06:23:11.366Z",
    "history": [
      {
        "id": "hist-1347",
        "action": "Created",
        "status": "Pending",
        "timestamp": "2026-10-13T06:23:11.347Z",
        "performedBy": "Deepa Chandran (Client)",
        "role": "client",
        "notes": "Booking registered. Auto-assigned to Ernakulam Branch Head: Rajesh Menon."
      },
      {
        "id": "hist-1366",
        "action": "Reassigned",
        "status": "Pending",
        "timestamp": "2026-10-13T06:23:11.366Z",
        "performedBy": "Super Admin",
        "role": "coordinator",
        "notes": "Reassigned from Rajesh Menon to Suresh Kumar (Trivandrum). Reason: Ernakulam team overbooked; transferred to regional specialist for rapid fitting."
      }
    ]
  },
  {
    "id": "BK-2024-1001",
    "clientId": "cli-1",
    "clientName": "John Mathew",
    "clientType": "customer",
    "contactPhone": "+91 94470 55443",
    "contactEmail": "john.mathew@gmail.com",
    "districtId": "dist-ekm",
    "districtName": "Ernakulam",
    "area": "Kakkanad",
    "address": "Mathew Villa, NH Bypass Road, Kakkanad",
    "landmark": "Near Infopark Gate 1",
    "pincode": "682030",
    "doorDetails": {
      "doorType": "Security Steel Door",
      "finish": "Matte Walnut Grain",
      "thickness": "70mm Multi-Lock",
      "dimensions": "3.5ft x 7.0ft",
      "quantity": 1,
      "isUrgent": false,
      "notes": "Main entrance security door with multi-point brass lock"
    },
    "status": "Accepted",
    "branchHeadId": "bh-1",
    "branchHeadName": "Rajesh Menon",
    "createdAt": "2024-02-10T10:30:00.000Z",
    "updatedAt": "2024-02-10T11:15:00.000Z",
    "history": [
      {
        "id": "hist-101",
        "action": "Created",
        "status": "Pending",
        "timestamp": "2024-02-10T10:30:00.000Z",
        "performedBy": "John Mathew (Client)",
        "role": "client",
        "notes": "Initial booking submitted online. Auto-assigned to Ernakulam Branch Head (Rajesh Menon)."
      },
      {
        "id": "hist-102",
        "action": "Status Updated",
        "status": "Accepted",
        "timestamp": "2024-02-10T11:15:00.000Z",
        "performedBy": "Rajesh Menon (Branch Head)",
        "role": "branch_head",
        "notes": "Client contacted. Site survey confirmed for tomorrow."
      }
    ]
  },
  {
    "id": "BK-2024-1002",
    "clientId": "cli-2",
    "clientName": "Sarah Thomas",
    "clientType": "customer",
    "contactPhone": "+91 94470 11223",
    "contactEmail": "sarah.t@outlook.com",
    "districtId": "dist-tvm",
    "districtName": "Trivandrum",
    "area": "Kowdiar",
    "address": "Flat 4B, Silver Crest, Kowdiar",
    "landmark": "Opposite Golf Club",
    "pincode": "695003",
    "doorDetails": {
      "doorType": "Fire-Rated 120min Door",
      "finish": "Sleek Carbon Steel",
      "thickness": "60mm Fire Insulated",
      "dimensions": "4.0ft x 7.0ft",
      "quantity": 2,
      "isUrgent": false,
      "notes": "Basement utility and server room door with panic hardware"
    },
    "status": "Scheduled",
    "branchHeadId": "bh-2",
    "branchHeadName": "Suresh Kumar",
    "scheduledDate": "2024-02-20T14:00:00.000Z",
    "createdAt": "2024-02-08T09:00:00.000Z",
    "updatedAt": "2024-02-09T16:00:00.000Z",
    "history": [
      {
        "id": "hist-103",
        "action": "Created",
        "status": "Pending",
        "timestamp": "2024-02-08T09:00:00.000Z",
        "performedBy": "Sarah Thomas (Client)",
        "role": "client",
        "notes": "Submitted online and auto-assigned to Suresh Kumar."
      },
      {
        "id": "hist-104",
        "action": "Status Updated",
        "status": "Accepted",
        "timestamp": "2024-02-08T10:00:00.000Z",
        "performedBy": "Suresh Kumar (Branch Head)",
        "role": "branch_head",
        "notes": "Accepted. Dimensions verified."
      },
      {
        "id": "hist-105",
        "action": "Scheduled",
        "status": "Scheduled",
        "timestamp": "2024-02-09T16:00:00.000Z",
        "performedBy": "Suresh Kumar (Branch Head)",
        "role": "branch_head",
        "notes": "Installation crew confirmed for 20 Feb 2024 at 14:00."
      }
    ]
  },
  {
    "id": "BK-2024-1003",
    "clientId": "cli-6",
    "clientName": "Apex Hardware Supplies",
    "clientType": "dealer",
    "contactPhone": "+91 94471 88776",
    "contactEmail": "orders@apexhardware.in",
    "districtId": "dist-ekm",
    "districtName": "Ernakulam",
    "area": "Aluva",
    "address": "Industrial Estate, Aluva",
    "landmark": "Near Metro Pillar 140",
    "pincode": "683101",
    "doorDetails": {
      "doorType": "Heavy-Duty Commercial Door",
      "finish": "Industrial Primer Grey",
      "thickness": "80mm Reinforced",
      "dimensions": "4.5ft x 8.0ft",
      "quantity": 6,
      "isUrgent": true,
      "notes": "Bulk supply and fitting for warehouse loading bay"
    },
    "status": "Finished",
    "branchHeadId": "bh-1",
    "branchHeadName": "Rajesh Menon",
    "scheduledDate": "2024-02-05T10:00:00.000Z",
    "completedDate": "2024-02-06T17:30:00.000Z",
    "createdAt": "2024-02-01T11:00:00.000Z",
    "updatedAt": "2024-02-06T17:30:00.000Z",
    "history": [
      {
        "id": "hist-106",
        "action": "Created",
        "status": "Pending",
        "timestamp": "2024-02-01T11:00:00.000Z",
        "performedBy": "Apex Hardware Supplies (Dealer)",
        "role": "client",
        "notes": "Dealer bulk request submitted."
      },
      {
        "id": "hist-107",
        "action": "Status Updated",
        "status": "Accepted",
        "timestamp": "2024-02-01T12:00:00.000Z",
        "performedBy": "Rajesh Menon (Branch Head)",
        "role": "branch_head",
        "notes": "Bulk invoice issued and advance received."
      },
      {
        "id": "hist-108",
        "action": "Scheduled",
        "status": "Scheduled",
        "timestamp": "2024-02-02T09:00:00.000Z",
        "performedBy": "Rajesh Menon (Branch Head)",
        "role": "branch_head",
        "notes": "Crew assigned for 5 Feb."
      },
      {
        "id": "hist-109",
        "action": "Finished",
        "status": "Finished",
        "timestamp": "2024-02-06T17:30:00.000Z",
        "performedBy": "Rajesh Menon (Branch Head)",
        "role": "branch_head",
        "notes": "6 units successfully fitted, quality inspection passed."
      }
    ]
  },
  {
    "id": "BK-2024-1004",
    "clientId": "cli-3",
    "clientName": "Arun Nair",
    "clientType": "customer",
    "contactPhone": "+91 94470 22334",
    "contactEmail": "arun.nair78@yahoo.com",
    "districtId": "dist-clt",
    "districtName": "Kozhikode",
    "area": "Mavoor Road",
    "address": "Nair Nilayam, Mavoor Road",
    "landmark": "Near Focus Mall",
    "pincode": "673004",
    "doorDetails": {
      "doorType": "Security Steel Door",
      "finish": "Rosewood Texture",
      "thickness": "70mm Multi-Lock",
      "dimensions": "3.5ft x 7.0ft",
      "quantity": 1,
      "isUrgent": false,
      "notes": "Rear balcony security door"
    },
    "status": "Rejected",
    "branchHeadId": "bh-3",
    "branchHeadName": "Anil Varma",
    "rejectionReason": "Structural wall beam cannot support steel door anchor frame without civil retrofitting.",
    "createdAt": "2024-02-07T14:00:00.000Z",
    "updatedAt": "2024-02-08T11:00:00.000Z",
    "history": [
      {
        "id": "hist-110",
        "action": "Created",
        "status": "Pending",
        "timestamp": "2024-02-07T14:00:00.000Z",
        "performedBy": "Arun Nair (Client)",
        "role": "client",
        "notes": "Customer booking submitted."
      },
      {
        "id": "hist-111",
        "action": "Rejected",
        "status": "Rejected",
        "timestamp": "2024-02-08T11:00:00.000Z",
        "performedBy": "Anil Varma (Branch Head)",
        "role": "branch_head",
        "notes": "Rejected: Structural wall beam cannot support steel door anchor frame without civil retrofitting."
      }
    ]
  },
  {
    "id": "BK-2024-1005",
    "clientId": "cli-11",
    "clientName": "Metro Infra & Builders",
    "clientType": "company",
    "contactPhone": "+91 94472 99001",
    "contactEmail": "procurement@metroinfra.com",
    "districtId": "dist-ekm",
    "districtName": "Ernakulam",
    "area": "Edapally",
    "address": "Metro Towers, Edapally",
    "landmark": "Behind Lulu Mall",
    "pincode": "682024",
    "doorDetails": {
      "doorType": "Architectural Pivot Steel Door",
      "finish": "Brushed Charcoal Titanium",
      "thickness": "90mm Ultra Premium",
      "dimensions": "5.0ft x 9.0ft",
      "quantity": 3,
      "isUrgent": true,
      "notes": "Luxury penthouse pivot steel entrance doors with biometric handles"
    },
    "status": "Pending",
    "branchHeadId": "bh-1",
    "branchHeadName": "Rajesh Menon",
    "createdAt": "2024-01-15T08:00:00.000Z",
    "updatedAt": "2024-01-15T08:00:00.000Z",
    "history": [
      {
        "id": "hist-112",
        "action": "Created",
        "status": "Pending",
        "timestamp": "2024-01-15T08:00:00.000Z",
        "performedBy": "Metro Infra & Builders (Company)",
        "role": "client",
        "notes": "Urgent luxury doors order. Auto-assigned to Rajesh Menon."
      }
    ]
  },
  {
    "id": "BK-2024-1006",
    "clientId": "cli-4",
    "clientName": "Lakshmi Priya",
    "clientType": "customer",
    "contactPhone": "+91 94470 33445",
    "contactEmail": "lakshmi.priya@gmail.com",
    "districtId": "dist-tsr",
    "districtName": "Thrissur",
    "area": "Swaraj Round",
    "address": "Krishna Kripa, Swaraj Round South",
    "landmark": "Near Vadakkumnathan Temple",
    "pincode": "680001",
    "doorDetails": {
      "doorType": "Security Steel Door",
      "finish": "Teak Wood Texture",
      "thickness": "70mm Multi-Lock",
      "dimensions": "3.5ft x 7.0ft",
      "quantity": 1,
      "isUrgent": false,
      "notes": "Front door replacement"
    },
    "status": "Pending",
    "branchHeadId": "bh-4",
    "branchHeadName": "Prakash Nair",
    "createdAt": "2024-01-20T11:00:00.000Z",
    "updatedAt": "2024-01-20T11:00:00.000Z",
    "history": [
      {
        "id": "hist-113",
        "action": "Created",
        "status": "Pending",
        "timestamp": "2024-01-20T11:00:00.000Z",
        "performedBy": "Lakshmi Priya (Client)",
        "role": "client",
        "notes": "Submitted online and auto-assigned to Prakash Nair."
      }
    ]
  },
  {
    "id": "BK-2024-1007",
    "clientId": "cli-5",
    "clientName": "Vijay George",
    "clientType": "customer",
    "contactPhone": "+91 94470 44556",
    "contactEmail": "vijay.george@gmail.com",
    "districtId": "dist-knr",
    "districtName": "Kannur",
    "area": "Payyambalam",
    "address": "Sea View Heights, Payyambalam",
    "landmark": "Near Baby Beach",
    "pincode": "670001",
    "doorDetails": {
      "doorType": "Acoustic Steel Door",
      "finish": "Satin Ivory",
      "thickness": "75mm Sound Dampened 45dB",
      "dimensions": "3.5ft x 7.0ft",
      "quantity": 1,
      "isUrgent": false,
      "notes": "Home studio acoustic isolation door"
    },
    "status": "Scheduled",
    "branchHeadId": "bh-5",
    "branchHeadName": "Deepak Pillai",
    "scheduledDate": "2024-02-25T11:00:00.000Z",
    "createdAt": "2024-02-11T13:00:00.000Z",
    "updatedAt": "2024-02-12T10:00:00.000Z",
    "history": [
      {
        "id": "hist-114",
        "action": "Created",
        "status": "Pending",
        "timestamp": "2024-02-11T13:00:00.000Z",
        "performedBy": "Vijay George (Client)",
        "role": "client",
        "notes": "Studio booking created."
      },
      {
        "id": "hist-115",
        "action": "Status Updated",
        "status": "Accepted",
        "timestamp": "2024-02-11T15:30:00.000Z",
        "performedBy": "Deepak Pillai (Branch Head)",
        "role": "branch_head",
        "notes": "Soundproofing specifications verified with client."
      },
      {
        "id": "hist-116",
        "action": "Scheduled",
        "status": "Scheduled",
        "timestamp": "2024-02-12T10:00:00.000Z",
        "performedBy": "Deepak Pillai (Branch Head)",
        "role": "branch_head",
        "notes": "Fitting scheduled for 25 Feb."
      }
    ]
  },
  {
    "id": "BK-2024-1008",
    "clientId": "cli-12",
    "clientName": "Skyline Architectural Projects",
    "clientType": "company",
    "contactPhone": "+91 94472 88992",
    "contactEmail": "projects@skylinearch.org",
    "districtId": "dist-tvm",
    "districtName": "Trivandrum",
    "area": "Technopark",
    "address": "Technopark Phase 3, Trivandrum",
    "landmark": "Near Ganga Building",
    "pincode": "695581",
    "doorDetails": {
      "doorType": "Fire-Rated 120min Door",
      "finish": "Galvanized Grey",
      "thickness": "60mm Fire Insulated",
      "dimensions": "4.0ft x 7.5ft",
      "quantity": 10,
      "isUrgent": true,
      "notes": "Emergency escape staircase doors with certification plaques"
    },
    "status": "Accepted",
    "branchHeadId": "bh-2",
    "branchHeadName": "Suresh Kumar",
    "createdAt": "2024-02-12T09:30:00.000Z",
    "updatedAt": "2024-02-12T14:00:00.000Z",
    "history": [
      {
        "id": "hist-117",
        "action": "Created",
        "status": "Pending",
        "timestamp": "2024-02-12T09:30:00.000Z",
        "performedBy": "Skyline Architectural Projects (Company)",
        "role": "client",
        "notes": "Project commercial intake."
      },
      {
        "id": "hist-118",
        "action": "Status Updated",
        "status": "Accepted",
        "timestamp": "2024-02-12T14:00:00.000Z",
        "performedBy": "Suresh Kumar (Branch Head)",
        "role": "branch_head",
        "notes": "Fire safety certificates submitted to project engineers."
      }
    ]
  },
  {
    "id": "BK-2024-1009",
    "clientId": "cli-7",
    "clientName": "Royal Steel Traders",
    "clientType": "dealer",
    "contactPhone": "+91 94471 99887",
    "contactEmail": "royalsteel@traders.com",
    "districtId": "dist-clt",
    "districtName": "Kozhikode",
    "area": "Nadakkavu",
    "address": "Nadakkavu Junction, Kozhikode",
    "landmark": "Near English Church",
    "pincode": "673011",
    "doorDetails": {
      "doorType": "Security Steel Door",
      "finish": "Dark Oak Texture",
      "thickness": "70mm Multi-Lock",
      "dimensions": "3.5ft x 7.0ft",
      "quantity": 4,
      "isUrgent": false,
      "notes": "Showroom display units and dealer customer order"
    },
    "status": "Finished",
    "branchHeadId": "bh-3",
    "branchHeadName": "Anil Varma",
    "scheduledDate": "2024-02-03T11:00:00.000Z",
    "completedDate": "2024-02-04T16:00:00.000Z",
    "createdAt": "2024-01-29T10:00:00.000Z",
    "updatedAt": "2024-02-04T16:00:00.000Z",
    "history": [
      {
        "id": "hist-119",
        "action": "Created",
        "status": "Pending",
        "timestamp": "2024-01-29T10:00:00.000Z",
        "performedBy": "Royal Steel Traders (Dealer)",
        "role": "client",
        "notes": "Dealer intake created."
      },
      {
        "id": "hist-120",
        "action": "Finished",
        "status": "Finished",
        "timestamp": "2024-02-04T16:00:00.000Z",
        "performedBy": "Anil Varma (Branch Head)",
        "role": "branch_head",
        "notes": "Display doors installed successfully."
      }
    ]
  },
  {
    "id": "BK-2024-1010",
    "clientId": "cli-13",
    "clientName": "Prestige Living Spaces",
    "clientType": "company",
    "contactPhone": "+91 94472 77883",
    "contactEmail": "tenders@prestigeliving.com",
    "districtId": "dist-tsr",
    "districtName": "Thrissur",
    "area": "Puzhakkal",
    "address": "Puzhakkal Sobha City Road, Thrissur",
    "landmark": "Near Sobha City Mall",
    "pincode": "680553",
    "doorDetails": {
      "doorType": "Custom Steel Villa Door",
      "finish": "Antique Bronze Patina",
      "thickness": "85mm Double Leaf",
      "dimensions": "6.0ft x 8.5ft",
      "quantity": 2,
      "isUrgent": false,
      "notes": "Double leaf entry door with ornamental steel grille"
    },
    "status": "Accepted",
    "branchHeadId": "bh-4",
    "branchHeadName": "Prakash Nair",
    "createdAt": "2024-02-13T10:00:00.000Z",
    "updatedAt": "2024-02-13T12:00:00.000Z",
    "history": [
      {
        "id": "hist-121",
        "action": "Created",
        "status": "Pending",
        "timestamp": "2024-02-13T10:00:00.000Z",
        "performedBy": "Prestige Living Spaces (Company)",
        "role": "client",
        "notes": "Villa project order."
      },
      {
        "id": "hist-122",
        "action": "Status Updated",
        "status": "Accepted",
        "timestamp": "2024-02-13T12:00:00.000Z",
        "performedBy": "Prakash Nair (Branch Head)",
        "role": "branch_head",
        "notes": "Custom fabrication drawings sent to client for sign-off."
      }
    ]
  },
  {
    "id": "BK-2024-1011",
    "clientId": "cli-1",
    "clientName": "John Mathew",
    "clientType": "customer",
    "contactPhone": "+91 94470 55443",
    "contactEmail": "john.mathew@gmail.com",
    "districtId": "dist-ekm",
    "districtName": "Ernakulam",
    "area": "Aluva",
    "address": "Aluva Riverview Plot 12",
    "landmark": "Near Palace Road",
    "pincode": "683101",
    "doorDetails": {
      "doorType": "Security Steel Door",
      "finish": "Weatherproof Forest Green",
      "thickness": "70mm Multi-Lock",
      "dimensions": "3.5ft x 7.0ft",
      "quantity": 1,
      "isUrgent": false,
      "notes": "Boathouse secure equipment room door"
    },
    "status": "Rejected",
    "branchHeadId": "bh-1",
    "branchHeadName": "Rajesh Menon",
    "rejectionReason": "Flooding zone clearance issue - client needs raised sill threshold before fitting.",
    "createdAt": "2024-01-22T09:00:00.000Z",
    "updatedAt": "2024-01-23T15:00:00.000Z",
    "history": [
      {
        "id": "hist-123",
        "action": "Created",
        "status": "Pending",
        "timestamp": "2024-01-22T09:00:00.000Z",
        "performedBy": "John Mathew (Client)",
        "role": "client",
        "notes": "Created by customer."
      },
      {
        "id": "hist-124",
        "action": "Rejected",
        "status": "Rejected",
        "timestamp": "2024-01-23T15:00:00.000Z",
        "performedBy": "Rajesh Menon (Branch Head)",
        "role": "branch_head",
        "notes": "Rejected: Flooding zone clearance issue - client needs raised sill threshold before fitting."
      }
    ]
  },
  {
    "id": "BK-2024-1012",
    "clientId": "cli-8",
    "clientName": "Malabar Building Solutions",
    "clientType": "dealer",
    "contactPhone": "+91 94471 11223",
    "contactEmail": "malabar.build@rediffmail.com",
    "districtId": "dist-knr",
    "districtName": "Kannur",
    "area": "South Bazar",
    "address": "South Bazar, Kannur",
    "landmark": "Near Caltex Junction",
    "pincode": "670002",
    "doorDetails": {
      "doorType": "Fire-Rated 120min Door",
      "finish": "Flame Red Primer",
      "thickness": "60mm Fire Insulated",
      "dimensions": "4.0ft x 7.0ft",
      "quantity": 3,
      "isUrgent": false,
      "notes": "Commercial complex corridor fire doors"
    },
    "status": "Scheduled",
    "branchHeadId": "bh-5",
    "branchHeadName": "Deepak Pillai",
    "scheduledDate": "2024-02-28T09:30:00.000Z",
    "createdAt": "2024-02-14T08:00:00.000Z",
    "updatedAt": "2024-02-14T15:00:00.000Z",
    "history": [
      {
        "id": "hist-125",
        "action": "Created",
        "status": "Pending",
        "timestamp": "2024-02-14T08:00:00.000Z",
        "performedBy": "Malabar Building Solutions (Dealer)",
        "role": "client",
        "notes": "Dealer booking submitted."
      },
      {
        "id": "hist-126",
        "action": "Scheduled",
        "status": "Scheduled",
        "timestamp": "2024-02-14T15:00:00.000Z",
        "performedBy": "Deepak Pillai (Branch Head)",
        "role": "branch_head",
        "notes": "Scheduled with delivery on 28 Feb."
      }
    ]
  },
  {
    "id": "BK-2024-1013",
    "clientId": "cli-14",
    "clientName": "GreenTech Developers Ltd",
    "clientType": "company",
    "contactPhone": "+91 94472 66774",
    "contactEmail": "site@greentechdev.in",
    "districtId": "dist-clt",
    "districtName": "Kozhikode",
    "area": "Beypore",
    "address": "Beach Road, Beypore, Kozhikode",
    "landmark": "Near Port Office",
    "pincode": "673015",
    "doorDetails": {
      "doorType": "Heavy-Duty Marine Grade Steel Door",
      "finish": "Corrosion Resistant Zinc Polyurethane",
      "thickness": "85mm Marine Spec",
      "dimensions": "4.0ft x 7.5ft",
      "quantity": 5,
      "isUrgent": false,
      "notes": "Coastal port facility security entryways"
    },
    "status": "Pending",
    "branchHeadId": "bh-3",
    "branchHeadName": "Anil Varma",
    "createdAt": "2024-01-18T10:00:00.000Z",
    "updatedAt": "2024-01-18T10:00:00.000Z",
    "history": [
      {
        "id": "hist-127",
        "action": "Created",
        "status": "Pending",
        "timestamp": "2024-01-18T10:00:00.000Z",
        "performedBy": "GreenTech Developers Ltd (Company)",
        "role": "client",
        "notes": "Marine grade inquiry auto-assigned to Anil Varma."
      }
    ]
  },
  {
    "id": "BK-2024-1014",
    "clientId": "cli-9",
    "clientName": "City Door Emporium",
    "clientType": "dealer",
    "contactPhone": "+91 94471 33445",
    "contactEmail": "citydoor@emporium.com",
    "districtId": "dist-tvm",
    "districtName": "Trivandrum",
    "area": "Pattom",
    "address": "Pattom Palace Road, Trivandrum",
    "landmark": "Near St. Marys School",
    "pincode": "695004",
    "doorDetails": {
      "doorType": "Security Steel Door",
      "finish": "Golden Teak",
      "thickness": "70mm Multi-Lock",
      "dimensions": "3.5ft x 7.0ft",
      "quantity": 2,
      "isUrgent": false,
      "notes": "Customer residential fitting"
    },
    "status": "Finished",
    "branchHeadId": "bh-2",
    "branchHeadName": "Suresh Kumar",
    "scheduledDate": "2024-01-25T10:00:00.000Z",
    "completedDate": "2024-01-26T15:00:00.000Z",
    "createdAt": "2024-01-21T09:00:00.000Z",
    "updatedAt": "2024-01-26T15:00:00.000Z",
    "history": [
      {
        "id": "hist-128",
        "action": "Created",
        "status": "Pending",
        "timestamp": "2024-01-21T09:00:00.000Z",
        "performedBy": "City Door Emporium (Dealer)",
        "role": "client",
        "notes": "Dealer booking submitted."
      },
      {
        "id": "hist-129",
        "action": "Finished",
        "status": "Finished",
        "timestamp": "2024-01-26T15:00:00.000Z",
        "performedBy": "Suresh Kumar (Branch Head)",
        "role": "branch_head",
        "notes": "Completed and signed off by dealer."
      }
    ]
  },
  {
    "id": "BK-2024-1015",
    "clientId": "cli-15",
    "clientName": "Coastal Projects Pvt Ltd",
    "clientType": "company",
    "contactPhone": "+91 94472 55665",
    "contactEmail": "ops@coastalprojects.co",
    "districtId": "dist-knr",
    "districtName": "Kannur",
    "area": "Talap",
    "address": "Fort Road, Talap, Kannur",
    "landmark": "Near AKG Hospital",
    "pincode": "670002",
    "doorDetails": {
      "doorType": "Security Steel Door",
      "finish": "Dark Mahogany",
      "thickness": "70mm Multi-Lock",
      "dimensions": "3.5ft x 7.0ft",
      "quantity": 8,
      "isUrgent": false,
      "notes": "Apartment staff quarters entrance doors"
    },
    "status": "Accepted",
    "branchHeadId": "bh-5",
    "branchHeadName": "Deepak Pillai",
    "createdAt": "2024-02-14T11:00:00.000Z",
    "updatedAt": "2024-02-14T13:30:00.000Z",
    "history": [
      {
        "id": "hist-130",
        "action": "Created",
        "status": "Pending",
        "timestamp": "2024-02-14T11:00:00.000Z",
        "performedBy": "Coastal Projects Pvt Ltd (Company)",
        "role": "client",
        "notes": "Staff quarters booking created."
      },
      {
        "id": "hist-131",
        "action": "Status Updated",
        "status": "Accepted",
        "timestamp": "2024-02-14T13:30:00.000Z",
        "performedBy": "Deepak Pillai (Branch Head)",
        "role": "branch_head",
        "notes": "Accepted. Material batch allocation reserved."
      }
    ]
  },
  {
    "id": "BK-2024-1016",
    "clientId": "cli-16",
    "clientName": "Apex Residency Association",
    "clientType": "company",
    "contactPhone": "+91 94472 44332",
    "contactEmail": "secretary@apexresidency.org",
    "districtId": "dist-ekm",
    "districtName": "Ernakulam",
    "area": "Vyttila",
    "address": "Vyttila Mobility Hub Road, Ernakulam",
    "landmark": "Near Metro Station",
    "pincode": "682019",
    "doorDetails": {
      "doorType": "Fire-Rated 120min Door",
      "finish": "Steel Grey",
      "thickness": "60mm Fire Insulated",
      "dimensions": "4.0ft x 7.0ft",
      "quantity": 4,
      "isUrgent": true,
      "notes": "Emergency fire compliance upgrade ordered by municipal safety board"
    },
    "status": "Scheduled",
    "branchHeadId": "bh-1",
    "branchHeadName": "Rajesh Menon",
    "scheduledDate": "2024-02-22T09:00:00.000Z",
    "createdAt": "2024-02-10T08:00:00.000Z",
    "updatedAt": "2024-02-11T12:00:00.000Z",
    "history": [
      {
        "id": "hist-132",
        "action": "Created",
        "status": "Pending",
        "timestamp": "2024-02-10T08:00:00.000Z",
        "performedBy": "Apex Residency Association (Company)",
        "role": "client",
        "notes": "Urgent compliance booking."
      },
      {
        "id": "hist-133",
        "action": "Scheduled",
        "status": "Scheduled",
        "timestamp": "2024-02-11T12:00:00.000Z",
        "performedBy": "Rajesh Menon (Branch Head)",
        "role": "branch_head",
        "notes": "Team allocated for priority installation on 22 Feb."
      }
    ]
  },
  {
    "id": "BK-2024-1017",
    "clientId": "cli-10",
    "clientName": "Highland Building Hub",
    "clientType": "dealer",
    "contactPhone": "+91 94471 55667",
    "contactEmail": "devanand@highlandhub.in",
    "districtId": "dist-tsr",
    "districtName": "Thrissur",
    "area": "Mannuthy",
    "address": "Mannuthy Highway Road, Thrissur",
    "landmark": "Near Agricultural University",
    "pincode": "680651",
    "doorDetails": {
      "doorType": "Security Steel Door",
      "finish": "Rosewood Grain",
      "thickness": "70mm Multi-Lock",
      "dimensions": "3.5ft x 7.0ft",
      "quantity": 3,
      "isUrgent": false,
      "notes": "Residential package"
    },
    "status": "Pending",
    "branchHeadId": "bh-4",
    "branchHeadName": "Prakash Nair",
    "createdAt": "2024-01-25T11:00:00.000Z",
    "updatedAt": "2024-01-25T11:00:00.000Z",
    "history": [
      {
        "id": "hist-134",
        "action": "Created",
        "status": "Pending",
        "timestamp": "2024-01-25T11:00:00.000Z",
        "performedBy": "Highland Building Hub (Dealer)",
        "role": "client",
        "notes": "Dealer order submitted."
      }
    ]
  },
  {
    "id": "BK-2024-1018",
    "clientId": "cli-2",
    "clientName": "Sarah Thomas",
    "clientType": "customer",
    "contactPhone": "+91 94470 11223",
    "contactEmail": "sarah.t@outlook.com",
    "districtId": "dist-tvm",
    "districtName": "Trivandrum",
    "area": "Kazhakoottam",
    "address": "Green Gardens Villa 8, Kazhakoottam",
    "landmark": "Near Technopark Main Gate",
    "pincode": "695582",
    "doorDetails": {
      "doorType": "Architectural Pivot Steel Door",
      "finish": "Matte Obsidian Black",
      "thickness": "85mm Pivot Axle",
      "dimensions": "4.5ft x 8.5ft",
      "quantity": 1,
      "isUrgent": false,
      "notes": "Villa grand entry pivot door"
    },
    "status": "Finished",
    "branchHeadId": "bh-2",
    "branchHeadName": "Suresh Kumar",
    "scheduledDate": "2024-01-18T10:00:00.000Z",
    "completedDate": "2024-01-19T14:30:00.000Z",
    "createdAt": "2024-01-10T11:30:00.000Z",
    "updatedAt": "2024-01-19T14:30:00.000Z",
    "history": [
      {
        "id": "hist-135",
        "action": "Created",
        "status": "Pending",
        "timestamp": "2024-01-10T11:30:00.000Z",
        "performedBy": "Sarah Thomas (Client)",
        "role": "client",
        "notes": "Created by customer."
      },
      {
        "id": "hist-136",
        "action": "Finished",
        "status": "Finished",
        "timestamp": "2024-01-19T14:30:00.000Z",
        "performedBy": "Suresh Kumar (Branch Head)",
        "role": "branch_head",
        "notes": "Pivot hinges balanced and calibrated. Key handover complete."
      }
    ]
  },
  {
    "id": "BK-2024-1019",
    "clientId": "cli-3",
    "clientName": "Arun Nair",
    "clientType": "customer",
    "contactPhone": "+91 94470 22334",
    "contactEmail": "arun.nair78@yahoo.com",
    "districtId": "dist-clt",
    "districtName": "Kozhikode",
    "area": "Palayam",
    "address": "Commercial Complex Unit 3, Palayam",
    "landmark": "Near Bus Stand",
    "pincode": "673001",
    "doorDetails": {
      "doorType": "Security Steel Door",
      "finish": "Brushed Steel",
      "thickness": "70mm Multi-Lock",
      "dimensions": "3.5ft x 7.0ft",
      "quantity": 1,
      "isUrgent": false,
      "notes": "Office backup entrance"
    },
    "status": "Accepted",
    "branchHeadId": "bh-3",
    "branchHeadName": "Anil Varma",
    "createdAt": "2024-02-15T09:00:00.000Z",
    "updatedAt": "2024-02-15T10:30:00.000Z",
    "history": [
      {
        "id": "hist-137",
        "action": "Created",
        "status": "Pending",
        "timestamp": "2024-02-15T09:00:00.000Z",
        "performedBy": "Arun Nair (Client)",
        "role": "client",
        "notes": "Booking received."
      },
      {
        "id": "hist-138",
        "action": "Status Updated",
        "status": "Accepted",
        "timestamp": "2024-02-15T10:30:00.000Z",
        "performedBy": "Anil Varma (Branch Head)",
        "role": "branch_head",
        "notes": "Customer site surveyed by technical team."
      }
    ]
  },
  {
    "id": "BK-2024-1020",
    "clientId": "cli-11",
    "clientName": "Metro Infra & Builders",
    "clientType": "company",
    "contactPhone": "+91 94472 99001",
    "contactEmail": "procurement@metroinfra.com",
    "districtId": "dist-ekm",
    "districtName": "Ernakulam",
    "area": "Kaloor",
    "address": "Stadium View Apartments, Kaloor",
    "landmark": "Opposite JNI Stadium",
    "pincode": "682017",
    "doorDetails": {
      "doorType": "Security Steel Door",
      "finish": "Natural Teak Finish",
      "thickness": "70mm Multi-Lock",
      "dimensions": "3.5ft x 7.0ft",
      "quantity": 12,
      "isUrgent": false,
      "notes": "Phase 2 flat entrance doors batch"
    },
    "status": "Scheduled",
    "branchHeadId": "bh-1",
    "branchHeadName": "Rajesh Menon",
    "scheduledDate": "2024-03-01T09:00:00.000Z",
    "createdAt": "2024-02-11T10:00:00.000Z",
    "updatedAt": "2024-02-12T16:00:00.000Z",
    "history": [
      {
        "id": "hist-139",
        "action": "Created",
        "status": "Pending",
        "timestamp": "2024-02-11T10:00:00.000Z",
        "performedBy": "Metro Infra & Builders (Company)",
        "role": "client",
        "notes": "Batch project intake."
      },
      {
        "id": "hist-140",
        "action": "Scheduled",
        "status": "Scheduled",
        "timestamp": "2024-02-12T16:00:00.000Z",
        "performedBy": "Rajesh Menon (Branch Head)",
        "role": "branch_head",
        "notes": "12 doors manufactured, installation batch begins 1 March."
      }
    ]
  },
  {
    "id": "BK-2024-1021",
    "clientId": "cli-4",
    "clientName": "Lakshmi Priya",
    "clientType": "customer",
    "contactPhone": "+91 94470 33445",
    "contactEmail": "lakshmi.priya@gmail.com",
    "districtId": "dist-tsr",
    "districtName": "Thrissur",
    "area": "Ayyanthole",
    "address": "Civil Lane Road, Ayyanthole",
    "landmark": "Near Collectorate",
    "pincode": "680003",
    "doorDetails": {
      "doorType": "Security Steel Door",
      "finish": "Rosewood Grain",
      "thickness": "70mm Multi-Lock",
      "dimensions": "3.5ft x 7.0ft",
      "quantity": 1,
      "isUrgent": false,
      "notes": "Residential replacement"
    },
    "status": "Finished",
    "branchHeadId": "bh-4",
    "branchHeadName": "Prakash Nair",
    "scheduledDate": "2024-01-14T10:00:00.000Z",
    "completedDate": "2024-01-14T15:30:00.000Z",
    "createdAt": "2024-01-08T11:00:00.000Z",
    "updatedAt": "2024-01-14T15:30:00.000Z",
    "history": [
      {
        "id": "hist-141",
        "action": "Created",
        "status": "Pending",
        "timestamp": "2024-01-08T11:00:00.000Z",
        "performedBy": "Lakshmi Priya (Client)",
        "role": "client",
        "notes": "Customer submitted."
      },
      {
        "id": "hist-142",
        "action": "Finished",
        "status": "Finished",
        "timestamp": "2024-01-14T15:30:00.000Z",
        "performedBy": "Prakash Nair (Branch Head)",
        "role": "branch_head",
        "notes": "Installed with mortar frame reinforcement."
      }
    ]
  },
  {
    "id": "BK-2024-1022",
    "clientId": "cli-5",
    "clientName": "Vijay George",
    "clientType": "customer",
    "contactPhone": "+91 94470 44556",
    "contactEmail": "vijay.george@gmail.com",
    "districtId": "dist-knr",
    "districtName": "Kannur",
    "area": "Valapattanam",
    "address": "River View Estate, Valapattanam",
    "landmark": "Near Toll Gate",
    "pincode": "670010",
    "doorDetails": {
      "doorType": "Heavy-Duty Commercial Door",
      "finish": "Steel Grey Primer",
      "thickness": "80mm Heavy Duty",
      "dimensions": "4.0ft x 7.5ft",
      "quantity": 2,
      "isUrgent": false,
      "notes": "Timber yard storehouse security doors"
    },
    "status": "Accepted",
    "branchHeadId": "bh-5",
    "branchHeadName": "Deepak Pillai",
    "createdAt": "2024-02-16T08:30:00.000Z",
    "updatedAt": "2024-02-16T10:00:00.000Z",
    "history": [
      {
        "id": "hist-143",
        "action": "Created",
        "status": "Pending",
        "timestamp": "2024-02-16T08:30:00.000Z",
        "performedBy": "Vijay George (Client)",
        "role": "client",
        "notes": "Intake completed."
      },
      {
        "id": "hist-144",
        "action": "Status Updated",
        "status": "Accepted",
        "timestamp": "2024-02-16T10:00:00.000Z",
        "performedBy": "Deepak Pillai (Branch Head)",
        "role": "branch_head",
        "notes": "Specifications matched to stock."
      }
    ]
  },
  {
    "id": "BK-2024-1023",
    "clientId": "cli-6",
    "clientName": "Apex Hardware Supplies",
    "clientType": "dealer",
    "contactPhone": "+91 94471 88776",
    "contactEmail": "orders@apexhardware.in",
    "districtId": "dist-ekm",
    "districtName": "Ernakulam",
    "area": "Palarivattom",
    "address": "Palarivattom Bypass Junction, Ernakulam",
    "landmark": "Near Medical Centre",
    "pincode": "682025",
    "doorDetails": {
      "doorType": "Security Steel Door",
      "finish": "Dark Walnut",
      "thickness": "70mm Multi-Lock",
      "dimensions": "3.5ft x 7.0ft",
      "quantity": 2,
      "isUrgent": false,
      "notes": "Retail customer referral"
    },
    "status": "Pending",
    "branchHeadId": "bh-1",
    "branchHeadName": "Rajesh Menon",
    "createdAt": "2024-01-12T09:00:00.000Z",
    "updatedAt": "2024-01-12T09:00:00.000Z",
    "history": [
      {
        "id": "hist-145",
        "action": "Created",
        "status": "Pending",
        "timestamp": "2024-01-12T09:00:00.000Z",
        "performedBy": "Apex Hardware Supplies (Dealer)",
        "role": "client",
        "notes": "Dealer submitted request."
      }
    ]
  },
  {
    "id": "BK-2024-1024",
    "clientId": "cli-7",
    "clientName": "Royal Steel Traders",
    "clientType": "dealer",
    "contactPhone": "+91 94471 99887",
    "contactEmail": "royalsteel@traders.com",
    "districtId": "dist-clt",
    "districtName": "Kozhikode",
    "area": "West Hill",
    "address": "West Hill Barracks Road, Kozhikode",
    "landmark": "Near Polytechnic",
    "pincode": "673005",
    "doorDetails": {
      "doorType": "Fire-Rated 120min Door",
      "finish": "Matte Grey",
      "thickness": "60mm Fire Insulated",
      "dimensions": "4.0ft x 7.0ft",
      "quantity": 1,
      "isUrgent": false,
      "notes": "Laboratory fire escape hatch door"
    },
    "status": "Scheduled",
    "branchHeadId": "bh-3",
    "branchHeadName": "Anil Varma",
    "scheduledDate": "2024-02-27T14:30:00.000Z",
    "createdAt": "2024-02-13T11:00:00.000Z",
    "updatedAt": "2024-02-14T09:00:00.000Z",
    "history": [
      {
        "id": "hist-146",
        "action": "Created",
        "status": "Pending",
        "timestamp": "2024-02-13T11:00:00.000Z",
        "performedBy": "Royal Steel Traders (Dealer)",
        "role": "client",
        "notes": "Dealer booking created."
      },
      {
        "id": "hist-147",
        "action": "Scheduled",
        "status": "Scheduled",
        "timestamp": "2024-02-14T09:00:00.000Z",
        "performedBy": "Anil Varma (Branch Head)",
        "role": "branch_head",
        "notes": "Installation scheduled for 27 Feb."
      }
    ]
  },
  {
    "id": "BK-2024-1025",
    "clientId": "cli-12",
    "clientName": "Skyline Architectural Projects",
    "clientType": "company",
    "contactPhone": "+91 94472 88992",
    "contactEmail": "projects@skylinearch.org",
    "districtId": "dist-tvm",
    "districtName": "Trivandrum",
    "area": "Vellayambalam",
    "address": "Museum Road, Vellayambalam",
    "landmark": "Near Kanakakkunnu Palace",
    "pincode": "695010",
    "doorDetails": {
      "doorType": "Architectural Pivot Steel Door",
      "finish": "Brushed Champagne Bronze",
      "thickness": "90mm Ultra Premium",
      "dimensions": "5.5ft x 9.0ft",
      "quantity": 1,
      "isUrgent": false,
      "notes": "Heritage gallery security main entryway"
    },
    "status": "Rejected",
    "branchHeadId": "bh-2",
    "branchHeadName": "Suresh Kumar",
    "rejectionReason": "Archaeological heritage restriction precludes heavy concrete anchoring on perimeter wall.",
    "createdAt": "2024-01-16T10:00:00.000Z",
    "updatedAt": "2024-01-17T11:30:00.000Z",
    "history": [
      {
        "id": "hist-148",
        "action": "Created",
        "status": "Pending",
        "timestamp": "2024-01-16T10:00:00.000Z",
        "performedBy": "Skyline Architectural Projects (Company)",
        "role": "client",
        "notes": "Submitted project inquiry."
      },
      {
        "id": "hist-149",
        "action": "Rejected",
        "status": "Rejected",
        "timestamp": "2024-01-17T11:30:00.000Z",
        "performedBy": "Suresh Kumar (Branch Head)",
        "role": "branch_head",
        "notes": "Rejected: Archaeological heritage restriction precludes heavy concrete anchoring on perimeter wall."
      }
    ]
  },
  {
    "id": "BK-2024-1026",
    "clientId": "cli-13",
    "clientName": "Prestige Living Spaces",
    "clientType": "company",
    "contactPhone": "+91 94472 77883",
    "contactEmail": "tenders@prestigeliving.com",
    "districtId": "dist-tsr",
    "districtName": "Thrissur",
    "area": "Ollur",
    "address": "Ollur Industrial Lane, Thrissur",
    "landmark": "Near Church Junction",
    "pincode": "680306",
    "doorDetails": {
      "doorType": "Security Steel Door",
      "finish": "Natural Teak Finish",
      "thickness": "70mm Multi-Lock",
      "dimensions": "3.5ft x 7.0ft",
      "quantity": 5,
      "isUrgent": false,
      "notes": "Row villas main doors"
    },
    "status": "Finished",
    "branchHeadId": "bh-4",
    "branchHeadName": "Prakash Nair",
    "scheduledDate": "2024-01-28T09:00:00.000Z",
    "completedDate": "2024-01-29T17:00:00.000Z",
    "createdAt": "2024-01-20T08:00:00.000Z",
    "updatedAt": "2024-01-29T17:00:00.000Z",
    "history": [
      {
        "id": "hist-150",
        "action": "Created",
        "status": "Pending",
        "timestamp": "2024-01-20T08:00:00.000Z",
        "performedBy": "Prestige Living Spaces (Company)",
        "role": "client",
        "notes": "Villas batch request."
      },
      {
        "id": "hist-151",
        "action": "Finished",
        "status": "Finished",
        "timestamp": "2024-01-29T17:00:00.000Z",
        "performedBy": "Prakash Nair (Branch Head)",
        "role": "branch_head",
        "notes": "All 5 row villa doors fitted and keys delivered."
      }
    ]
  },
  {
    "id": "BK-2024-1027",
    "clientId": "cli-14",
    "clientName": "GreenTech Developers Ltd",
    "clientType": "company",
    "contactPhone": "+91 94472 66774",
    "contactEmail": "site@greentechdev.in",
    "districtId": "dist-clt",
    "districtName": "Kozhikode",
    "area": "Medical College",
    "address": "Kovoor Road, Medical College, Kozhikode",
    "landmark": "Near Main Gate",
    "pincode": "673008",
    "doorDetails": {
      "doorType": "Acoustic Steel Door",
      "finish": "Hospital White Antibacterial Powder Coat",
      "thickness": "75mm Sound Dampened 45dB",
      "dimensions": "4.0ft x 7.0ft",
      "quantity": 4,
      "isUrgent": true,
      "notes": "Clinic consultation and audiology room doors"
    },
    "status": "Accepted",
    "branchHeadId": "bh-3",
    "branchHeadName": "Anil Varma",
    "createdAt": "2024-02-16T11:00:00.000Z",
    "updatedAt": "2024-02-16T14:30:00.000Z",
    "history": [
      {
        "id": "hist-152",
        "action": "Created",
        "status": "Pending",
        "timestamp": "2024-02-16T11:00:00.000Z",
        "performedBy": "GreenTech Developers Ltd (Company)",
        "role": "client",
        "notes": "Hospital acoustic inquiry."
      },
      {
        "id": "hist-153",
        "action": "Status Updated",
        "status": "Accepted",
        "timestamp": "2024-02-16T14:30:00.000Z",
        "performedBy": "Anil Varma (Branch Head)",
        "role": "branch_head",
        "notes": "Medical specs confirmed with site bio-medical team."
      }
    ]
  },
  {
    "id": "BK-2024-1028",
    "clientId": "cli-8",
    "clientName": "Malabar Building Solutions",
    "clientType": "dealer",
    "contactPhone": "+91 94471 11223",
    "contactEmail": "malabar.build@rediffmail.com",
    "districtId": "dist-knr",
    "districtName": "Kannur",
    "area": "Chala",
    "address": "Chala Bypass Junction, Kannur",
    "landmark": "Near Temple Road",
    "pincode": "670007",
    "doorDetails": {
      "doorType": "Security Steel Door",
      "finish": "Dark Oak Texture",
      "thickness": "70mm Multi-Lock",
      "dimensions": "3.5ft x 7.0ft",
      "quantity": 1,
      "isUrgent": false,
      "notes": "Residential order"
    },
    "status": "Pending",
    "branchHeadId": "bh-5",
    "branchHeadName": "Deepak Pillai",
    "createdAt": "2024-01-19T10:00:00.000Z",
    "updatedAt": "2024-01-19T10:00:00.000Z",
    "history": [
      {
        "id": "hist-154",
        "action": "Created",
        "status": "Pending",
        "timestamp": "2024-01-19T10:00:00.000Z",
        "performedBy": "Malabar Building Solutions (Dealer)",
        "role": "client",
        "notes": "Dealer submission."
      }
    ]
  },
  {
    "id": "BK-2024-1029",
    "clientId": "cli-1",
    "clientName": "John Mathew",
    "clientType": "customer",
    "contactPhone": "+91 94470 55443",
    "contactEmail": "john.mathew@gmail.com",
    "districtId": "dist-ekm",
    "districtName": "Ernakulam",
    "area": "Tripunithura",
    "address": "Statue Junction, Hill Palace Road, Tripunithura",
    "landmark": "Near Palace Museum",
    "pincode": "682301",
    "doorDetails": {
      "doorType": "Custom Steel Villa Door",
      "finish": "Antique Copper Patina",
      "thickness": "80mm Heavy Security",
      "dimensions": "4.0ft x 7.5ft",
      "quantity": 1,
      "isUrgent": false,
      "notes": "Traditional Kerala aesthetic villa front door with steel core"
    },
    "status": "Finished",
    "branchHeadId": "bh-1",
    "branchHeadName": "Rajesh Menon",
    "scheduledDate": "2024-01-12T10:00:00.000Z",
    "completedDate": "2024-01-13T16:00:00.000Z",
    "createdAt": "2024-01-05T09:00:00.000Z",
    "updatedAt": "2024-01-13T16:00:00.000Z",
    "history": [
      {
        "id": "hist-155",
        "action": "Created",
        "status": "Pending",
        "timestamp": "2024-01-05T09:00:00.000Z",
        "performedBy": "John Mathew (Client)",
        "role": "client",
        "notes": "Villa booking submitted."
      },
      {
        "id": "hist-156",
        "action": "Finished",
        "status": "Finished",
        "timestamp": "2024-01-13T16:00:00.000Z",
        "performedBy": "Rajesh Menon (Branch Head)",
        "role": "branch_head",
        "notes": "Custom heritage door fitted and verified."
      }
    ]
  },
  {
    "id": "BK-2024-1030",
    "clientId": "cli-15",
    "clientName": "Coastal Projects Pvt Ltd",
    "clientType": "company",
    "contactPhone": "+91 94472 55665",
    "contactEmail": "ops@coastalprojects.co",
    "districtId": "dist-knr",
    "districtName": "Kannur",
    "area": "Pallikunnu",
    "address": "Pallikunnu Heights, Kannur",
    "landmark": "Near Krishna Temple",
    "pincode": "670004",
    "doorDetails": {
      "doorType": "Fire-Rated 120min Door",
      "finish": "Industrial Grey",
      "thickness": "60mm Fire Insulated",
      "dimensions": "4.0ft x 7.0ft",
      "quantity": 2,
      "isUrgent": false,
      "notes": "Generator enclosure doors"
    },
    "status": "Scheduled",
    "branchHeadId": "bh-5",
    "branchHeadName": "Deepak Pillai",
    "scheduledDate": "2024-03-05T10:00:00.000Z",
    "createdAt": "2024-02-15T12:00:00.000Z",
    "updatedAt": "2024-02-16T09:30:00.000Z",
    "history": [
      {
        "id": "hist-157",
        "action": "Created",
        "status": "Pending",
        "timestamp": "2024-02-15T12:00:00.000Z",
        "performedBy": "Coastal Projects Pvt Ltd (Company)",
        "role": "client",
        "notes": "Generator room fire doors booking."
      },
      {
        "id": "hist-158",
        "action": "Scheduled",
        "status": "Scheduled",
        "timestamp": "2024-02-16T09:30:00.000Z",
        "performedBy": "Deepak Pillai (Branch Head)",
        "role": "branch_head",
        "notes": "Installation scheduled for 5 March."
      }
    ]
  },
  {
    "id": "BK-2024-1031",
    "clientId": "cli-10",
    "clientName": "Highland Building Hub",
    "clientType": "dealer",
    "contactPhone": "+91 94471 55667",
    "contactEmail": "devanand@highlandhub.in",
    "districtId": "dist-tsr",
    "districtName": "Thrissur",
    "area": "Kuriachira",
    "address": "Kuriachira Junction, Thrissur",
    "landmark": "Near St. Joseph Church",
    "pincode": "680006",
    "doorDetails": {
      "doorType": "Heavy-Duty Commercial Door",
      "finish": "Steel Grey Primer",
      "thickness": "80mm Heavy Duty",
      "dimensions": "4.0ft x 7.5ft",
      "quantity": 1,
      "isUrgent": false,
      "notes": "Store room entrance"
    },
    "status": "Accepted",
    "branchHeadId": "bh-4",
    "branchHeadName": "Prakash Nair",
    "createdAt": "2024-02-17T09:00:00.000Z",
    "updatedAt": "2024-02-17T10:15:00.000Z",
    "history": [
      {
        "id": "hist-159",
        "action": "Created",
        "status": "Pending",
        "timestamp": "2024-02-17T09:00:00.000Z",
        "performedBy": "Highland Building Hub (Dealer)",
        "role": "client",
        "notes": "Created by dealer."
      },
      {
        "id": "hist-160",
        "action": "Status Updated",
        "status": "Accepted",
        "timestamp": "2024-02-17T10:15:00.000Z",
        "performedBy": "Prakash Nair (Branch Head)",
        "role": "branch_head",
        "notes": "Order accepted and stock allocated."
      }
    ]
  },
  {
    "id": "BK-2024-1032",
    "clientId": "cli-2",
    "clientName": "Sarah Thomas",
    "clientType": "customer",
    "contactPhone": "+91 94470 11223",
    "contactEmail": "sarah.t@outlook.com",
    "districtId": "dist-tvm",
    "districtName": "Trivandrum",
    "area": "Sreekaryam",
    "address": "Loyola Road, Sreekaryam, Trivandrum",
    "landmark": "Near Loyola School",
    "pincode": "695017",
    "doorDetails": {
      "doorType": "Security Steel Door",
      "finish": "Teak Wood Texture",
      "thickness": "70mm Multi-Lock",
      "dimensions": "3.5ft x 7.0ft",
      "quantity": 1,
      "isUrgent": false,
      "notes": "Rental villa side door"
    },
    "status": "Pending",
    "branchHeadId": "bh-2",
    "branchHeadName": "Suresh Kumar",
    "createdAt": "2024-02-17T08:00:00.000Z",
    "updatedAt": "2024-02-17T08:00:00.000Z",
    "history": [
      {
        "id": "hist-161",
        "action": "Created",
        "status": "Pending",
        "timestamp": "2024-02-17T08:00:00.000Z",
        "performedBy": "Sarah Thomas (Client)",
        "role": "client",
        "notes": "Submitted online and auto-assigned to Suresh Kumar."
      }
    ]
  }
];

export const MOCK_SERVICES: ServiceItem[] = [
  {
    "id": "srv-1",
    "title": "Residential Steel Door Installation",
    "tagline": "Zero-Damage Precision Mounting",
    "description": "Precision anchoring and structural frame mounting of residential steel security doors with zero plaster or tile damage. Includes deadbolt calibration and weather sealing.",
    "features": [
      "Sub-Millimeter Laser Alignment",
      "Zero Wall Breakage Mounting",
      "Multi-Point Lock Calibration",
      "10-Year Fitting Guarantee"
    ],
    "doorType": "Residential Steel Door Fitting",
    "startingPrice": "₹2,500 / door",
    "warrantyYears": 10,
    "badge": "Most Popular"
  },
  {
    "id": "srv-2",
    "title": "Certified Fire Door Installation",
    "tagline": "60 / 120min Tested NOC Standards",
    "description": "Certified structural mounting of fire-rated steel door assemblies, intumescent seals, automatic door closers, and panic crash hardware adhering to Fire NOC safety norms.",
    "features": [
      "Intumescent Seal Calibration",
      "Panic Exit Bar Alignment",
      "Fire NOC Clearance Inspection",
      "Certified Gap Tolerances"
    ],
    "doorType": "Fire-Rated Door Installation",
    "startingPrice": "₹3,500 / door",
    "warrantyYears": 7,
    "badge": "Certified Service"
  },
  {
    "id": "srv-3",
    "title": "Old Frame Retrofit & Replacement",
    "tagline": "Clean Replacement Service",
    "description": "Non-destructive removal of decayed wooden or damaged frames, replaced with precision-anchored steel frames fitted into existing masonry openings.",
    "features": [
      "Same-Day Extraction & Fitting",
      "Zero Floor Tile Damage",
      "Old Frame Removal Included",
      "Laser-Leveled Alignment"
    ],
    "doorType": "Door Retrofit & Replacement",
    "startingPrice": "₹3,000 / door",
    "warrantyYears": 5,
    "badge": "Retrofit Specialist"
  },
  {
    "id": "srv-4",
    "title": "Luxury Pivot Door Heavy Mounting",
    "tagline": "Hydraulic Pivot Alignment",
    "description": "Specialized installation of oversized floor-to-ceiling pivot steel doors with precision German hydraulic floor springs, leveling, and fluid swing tuning.",
    "features": [
      "Hydraulic Floor Spring Leveling",
      "Up to 10ft Height Mounting",
      "Fluid Pivot Return Calibration",
      "Concealed Anchor Fastening"
    ],
    "doorType": "Pivot Door Installation",
    "startingPrice": "₹5,500 / door",
    "warrantyYears": 10,
    "badge": "Architectural Line"
  }
];

export const MOCK_TESTIMONIALS: TestimonialItem[] = [
  {
    "id": "tst-1",
    "author": "Arun K. Pillai",
    "role": "Homeowner, Kakkanad",
    "rating": 5,
    "text": "The SteelGuard technicians arrived exactly on schedule. They installed our heavy main security door with zero damage to our new wall painting. The laser leveling was millimeter-perfect.",
    "doorModel": "Main Entrance Installation"
  },
  {
    "id": "tst-2",
    "author": "Anjali Nair",
    "role": "Principal Architect, Studio Nine",
    "rating": 5,
    "text": "Installing a monumental 10ft pivot steel door requires serious engineering skill. Rajesh Menon and his crew handled the hydraulic floor spring installation and balancing with surgical precision.",
    "doorModel": "Luxury Pivot Door Fitting"
  },
  {
    "id": "tst-3",
    "author": "Vinod Sreedharan",
    "role": "VP Projects, Metro Infra",
    "rating": 5,
    "text": "SteelGuard completed the certified installation of 40 fire-rated doors for our commercial high-rise. Test inspection certificates and NOC alignment were delivered on time without any hassle.",
    "doorModel": "Commercial Fire Door Fitting"
  },
  {
    "id": "tst-4",
    "author": "Faisal Mohammed",
    "role": "Villa Owner, Kozhikode",
    "rating": 5,
    "text": "Replaced our termite-damaged wooden door frame with a steel door assembly. Done cleanly in half a day without disturbing any of our floor tiling. Outstanding craftsmanship.",
    "doorModel": "Retrofit & Replacement"
  }
];

export const MOCK_SITE_CONTENT: SiteContent = {
  "companyName": "SteelGuard Systems & Fitting",
  "tagline": "Precision Steel Door Installation & District Fitting Services",
  "banners": [
    {
      "id": "banner-1",
      "badge": "PROTOCOL VERIFIED",
      "title": "Engineering Checklists, Not Guesswork",
      "description": "Every job follows our strict multi-point protocol for structural integrity and warranty protection.",
      "image": "/images/banners/banner-laser-calibration.jpg",
      "link": "/book-now"
    },
    {
      "id": "banner-2",
      "badge": "ZERO WALL DAMAGE",
      "title": "Laser-Calibrated Alignment, Zero Wall Damage",
      "description": "Sub-millimeter plumb line leveling and heavy-duty anchor bolt retrofitting without disturbing plaster or tiles.",
      "image": "/images/banners/banner-frame-retrofit.jpg",
      "link": "/book-now"
    },
    {
      "id": "banner-3",
      "badge": "FIRE & SECURITY COMPLIANT",
      "title": "Certified Multi-Point Locking & Panic Hardware",
      "description": "Heavy commercial fire doors and emergency exit hardware fitted to stringent safety & load-bearing standards.",
      "image": "/images/banners/banner-fire-rated-door.jpg",
      "link": "/book-now"
    },
    {
      "id": "banner-4",
      "badge": "ARCHITECTURAL FINISH",
      "title": "Luxury Grand Pivot & Custom Steel Entryways",
      "description": "High-capacity hidden pivot hinges calibrated for whisper-quiet glide and weatherproof airtight compression.",
      "image": "/images/banners/banner-luxury-pivot-door.jpg",
      "link": "/book-now"
    }
  ],
  "stats": [
    {
      "label": "Doors Installed",
      "value": "12,400+"
    },
    {
      "label": "Active Districts",
      "value": "5 Districts"
    },
    {
      "label": "Certified Technicians",
      "value": "45+ Crew"
    },
    {
      "label": "Average Turnaround",
      "value": "48 Hours"
    }
  ],
  "howItWorks": [
    {
      "step": 1,
      "title": "Book Installation Online",
      "description": "Specify your doors count, installation type, and district in our streamlined online booking form."
    },
    {
      "step": 2,
      "title": "Instant District Routing",
      "description": "Your installation request is automatically assigned to your local District Branch Head."
    },
    {
      "step": 3,
      "title": "Laser Measurement & Inspection",
      "description": "Our certified technician visits your site for sub-millimeter laser wall clearance measurement."
    },
    {
      "step": 4,
      "title": "Precision Fitting & Handover",
      "description": "Installation completed with zero wall damage and fitting warranty certificate."
    }
  ]
};

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
  // Company accounts oversee dealers and dealer installation requests
  if (user.clientType === 'company') {
    return bookings.filter(b => b.clientType === 'dealer' || b.clientId === user.clientId);
  }
  // User/Dealer role: only their bookings
  const targetId = user.clientId || user.id;
  return bookings.filter(b => b.clientId === targetId || b.clientId === user.clientId);
}

