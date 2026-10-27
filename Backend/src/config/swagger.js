export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'SteelGuard Door Management System API',
    version: '1.0.0',
    description: 'RESTful API for SteelGuard Door Management System - Authentication & Bookings.'
  },
  servers: [
    {
      url: '/',
      description: 'Current Server (Auto / Relative)'
    },
    {
      url: 'http://localhost:5000',
      description: 'Local Server (PORT 5000)'
    },
    {
      url: 'http://localhost:1025',
      description: 'Local Server (PORT 1025)'
    },
    {
      url: 'https://steeldoorapi.ufstech.in',
      description: 'Live Production API'
    }
  ],
  tags: [
    { name: 'Auth', description: 'Mobile Authentication (JWT)' },
    { name: 'Bookings', description: 'Booking Management & Pagination' },
    { name: 'Status', description: 'Client Status Updates & History (Scheduled, Completed, Cancelled)' },
    { name: 'Dropdowns', description: 'Searchable Dropdown Select Options (Districts, Areas)' },
    { name: 'Uploads', description: 'File & Document Uploads for Bookings' },
    { name: 'Mobile Dashboard', description: 'Fitmate Mobile App Dashboard Metrics & Statistics' }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT Bearer token returned by /api/auth/mobile-login'
      },
      CookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'auth_session',
        description: 'Session cookie containing JWT token set automatically upon login'
      }
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Invalid credentials or user is not authorized for mobile login (role 2 or 3).' }
        }
      },
      MobileLoginRequest: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: {
            type: 'string',
            example: 'branch_ekm',
            description: 'Username for Coordinator (Role 2) or Branch Head (Role 3)'
          },
          password: {
            type: 'string',
            example: '123',
            description: 'Account password'
          }

        }
      },
      UserResponse: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 4 },
              username: { type: 'string', example: 'branch_ekm' },
              roleId: { type: 'integer', example: 3 },
              role: { type: 'string', example: 'branch_head' },
              userTypeId: { type: 'integer', example: 2 },
              userType: { type: 'string', example: 'staff' },
              name: { type: 'string', example: 'Rajesh Menon' },
              email: { type: 'string', example: 'rajesh.menon@steeldoor.com' },
              phone: { type: 'string', example: '+91 98470 12345' },
              stateId: { type: 'integer', example: 1 },
              stateName: { type: 'string', example: 'Kerala' },
              districtId: { type: 'integer', example: 1 },
              districtName: { type: 'string', example: 'Ernakulam Hub' },
              districtCode: { type: 'string', example: 'dist-ekm' },
              address: { type: 'string', nullable: true, example: null },
              isActive: { type: 'integer', example: 1 },
              lastLoginAt: { type: 'string', example: '2026-10-21T05:30:00.000Z' }
            }
          },
          token: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwidXNlcm5hbWUiOiJicmFuY2hfZWttIn0.somerandomsignature...'
          },
          tokenType: {
            type: 'string',
            example: 'Bearer'
          }
        }
      },
      BookingItem: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Anand Varma' },
          mobile: { type: 'string', example: '+91 98470 11223' },
          address: { type: 'string', example: 'Flat 4B, SkyLine Apts, Palarivattom' },
          notes: { type: 'string', nullable: true, example: 'Urgent fitting required' },
          statusId: { type: 'integer', example: 1 },
          statusCode: { type: 'string', example: 'New' },
          statusLabel: { type: 'string', example: 'New' },
          statusColorCode: { type: 'string', example: '#3b82f6' },
          status: { type: 'string', example: 'New' },
          scheduleDate: { type: 'string', format: 'date', nullable: true, example: '2026-10-30' },
          stateId: { type: 'integer', nullable: true, example: 1 },
          stateName: { type: 'string', nullable: true, example: 'Kerala' },
          districtId: { type: 'integer', nullable: true, example: 1 },
          districtName: { type: 'string', nullable: true, example: 'Ernakulam Hub' },
          areaId: { type: 'integer', nullable: true, example: 4 },
          areaName: { type: 'string', nullable: true, example: 'Palarivattom' },
          assignedHeadDistrictId: { type: 'integer', nullable: true, example: 1 },
          assignedHeadDistrictName: { type: 'string', nullable: true, example: 'Ernakulam Hub' },
          branchHeadId: { type: 'integer', nullable: true, example: 3 },
          branchHeadName: { type: 'string', nullable: true, example: 'John Branch Head' },
          documents: {
            type: 'array',
            items: { type: 'string' },
            example: ['/uploads/site_plan.pdf']
          },
          loginRoleId: { type: 'integer', nullable: true, example: 2 },
          loginId: { type: 'integer', nullable: true, example: 2 },
          loginName: { type: 'string', nullable: true, example: 'Elena Vance' },
          createdBy: { type: 'integer', nullable: true, example: 2 },
          createdByName: { type: 'string', nullable: true, example: 'Elena Vance' },
          createdAt: { type: 'string', example: '2026-10-21T14:00:00.000Z' },
          updatedAt: { type: 'string', example: '2026-10-21T14:00:00.000Z' }
        }
      },
      PaginatedBookingsResponse: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/BookingItem' }
          },
          pagination: {
            type: 'object',
            properties: {
              total: { type: 'integer', example: 42 },
              page: { type: 'integer', example: 1 },
              limit: { type: 'integer', example: 15 },
              totalPages: { type: 'integer', example: 3 }
            }
          }
        }
      },
      SaveStatusRequest: {
        type: 'object',
        required: ['clientId', 'status'],
        properties: {
          clientId: {
            type: 'integer',
            example: 1,
            description: 'ID of the client / lead'
          },
          clientName: {
            type: 'string',
            example: 'Abhijith',
            description: 'Name of the client'
          },
          status: {
            type: 'string',
            enum: ['Scheduled', 'Completed', 'Cancelled'],
            example: 'Scheduled',
            description: 'Selected status from frontend'
          },
          scheduleDate: {
            type: 'string',
            nullable: true,
            example: '10/24/2024',
            description: 'Schedule date (accepts 10/24/2024 or YYYY-MM-DD; automatically null for Cancelled)'
          },
          notes: {
            type: 'string',
            nullable: true,
            example: 'Client confirmed fitting for tomorrow afternoon.',
            description: 'Notes entered by user'
          },
          createdBy: {
            type: 'integer',
            nullable: true,
            example: 4,
            description: 'User ID of the updater (auto-extracted from token if authenticated)'
          },
          createdByName: {
            type: 'string',
            nullable: true,
            example: 'Rajesh Menon',
            description: 'Name of the updater'
          }
        }
      },
      StatusRecord: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          clientId: { type: 'integer', example: 1 },
          clientName: { type: 'string', example: 'Abhijith' },
          status: { type: 'string', example: 'Scheduled' },
          scheduleDate: { type: 'string', nullable: true, example: '2024-10-24' },
          notes: { type: 'string', example: 'Client confirmed fitting for tomorrow afternoon.' },
          createdBy: { type: 'integer', nullable: true, example: 4 },
          createdByName: { type: 'string', nullable: true, example: 'Rajesh Menon' },
          createdAt: { type: 'string', example: '2026-10-23T04:29:04.000Z' }
        }
      },
      SaveStatusResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Status updated to Scheduled successfully' },
          data: { $ref: '#/components/schemas/StatusRecord' }
        }
      },
      StatusHistoryResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          count: { type: 'integer', example: 1 },
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/StatusRecord' }
          }
        }
      },
      DropdownItem: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Ernakulam' }
        }
      },
      DropdownResponse: {
        type: 'object',
        properties: {
          type: { type: 'string', example: 'district' },
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 20 },
          count: { type: 'integer', example: 5 },
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/DropdownItem' }
          }
        }
      },
      DashboardMetricsResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'object',
            properties: {
              newBookings: {
                type: 'integer',
                example: 12,
                description: 'Count of bookings with status NEW'
              },
              pendingBookings: {
                type: 'integer',
                example: 5,
                description: 'Count of bookings with status PENDING'
              },
              completedBookings: {
                type: 'integer',
                example: 28,
                description: 'Count of bookings with status COMPLETED or FINISHED'
              },
              scheduledBookings: {
                type: 'integer',
                example: 8,
                description: 'Count of bookings with status SCHEDULED or ACCEPTED'
              },
              totalBookings: {
                type: 'integer',
                example: 53,
                description: 'Total booking count across matching filters'
              },
              period: {
                type: 'string',
                example: 'this_month',
                description: 'Active filter preset: all | this_month | last_30_days'
              },
              dateFrom: {
                type: 'string',
                format: 'date',
                nullable: true,
                example: '2026-10-01'
              },
              dateTo: {
                type: 'string',
                format: 'date',
                nullable: true,
                example: '2026-10-31'
              }
            }
          }
        }
      }
    }
  },
  paths: {
    '/api/auth/mobile-login': {
      post: {
        tags: ['Auth'],
        summary: 'Mobile Login with JWT (Stored Procedure: mobile_login)',
        description: 'Authenticates Coordinator (Role 2) and Branch Head (Role 3) via the `mobile_login` stored procedure and generates a signed JWT token.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/MobileLoginRequest' }
            }
          }
        },
        responses: {
          200: {
            description: 'Authentication successful. Returns user profile, JWT token, and sets auth_session cookie.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UserResponse' }
              }
            }
          },
          400: {
            description: 'Username or password missing',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          401: {
            description: 'Invalid credentials or user does not have role_id 2 or 3',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/api/auth/web-login': {
      post: {
        tags: ['Auth'],
        summary: 'Web Login with JWT (Stored Procedure: web_login)',
        description: 'Authenticates Company (Role 1) and Dealer (Role 4) via the `web_login` stored procedure and generates a signed JWT token.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/MobileLoginRequest' }
            }
          }
        },
        responses: {
          200: {
            description: 'Authentication successful. Returns user profile, JWT token, and sets auth_session cookie.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UserResponse' }
              }
            }
          },
          400: {
            description: 'Username or password missing',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          401: {
            description: 'Invalid login credentials',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          403: {
            description: 'Deactivated account or insufficient permissions for web login',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },

    '/api/bookings': {
      get: {
        tags: ['Bookings'],
        summary: 'List Paginated Bookings (Stored Procedure: get_bookings_paginated)',
        description: 'Retrieves a list of non-deleted bookings ordered by newest first. Default page size is 15 records.',
        parameters: [
          {
            name: 'page',
            in: 'query',
            required: false,
            schema: { type: 'integer', default: 1 },
            description: 'Page number (starts at 1)'
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            schema: { type: 'integer', default: 15 },
            description: 'Number of records per page (default: 15)'
          },
          {
            name: 'roleId',
            in: 'query',
            required: false,
            schema: { type: 'integer' },
            description: 'User Role ID (1: company, 2: coordinator, 3: branch_head, 4: dealer, 5: customer). Roles 1 & 2 see all clients, role 3 filters by district_id, role 4 filters by login_id.'
          },
          {
            name: 'loginId',
            in: 'query',
            required: false,
            schema: { type: 'integer' },
            description: 'User login ID (used when roleId is 4 or 5 to list clients by login id)'
          },
          {
            name: 'districtId',
            in: 'query',
            required: false,
            schema: { type: 'integer' },
            description: 'District ID (used when roleId is 3 to list clients by district id)'
          },
          {
            name: 'statusId',
            in: 'query',
            required: false,
            schema: { type: 'integer' },
            description: 'Filter by Status ID (e.g. 1: New, 2: Scheduled, 3: Completed, 4: Cancelled)',
            example: 1
          },
          {
            name: 'search',
            in: 'query',
            required: false,
            schema: { type: 'string' },
            description: 'Search client name or mobile phone number'
          },
          {
            name: 'dateFrom',
            in: 'query',
            required: false,
            schema: { type: 'string', format: 'date' },
            description: 'Filter bookings created on or after this date (YYYY-MM-DD)'
          },
          {
            name: 'dateTo',
            in: 'query',
            required: false,
            schema: { type: 'string', format: 'date' },
            description: 'Filter bookings created on or before this date (YYYY-MM-DD)'
          },
          {
            name: 'filterRole',
            in: 'query',
            required: false,
            schema: { type: 'integer' },
            description: 'Filter by creator role ID (1: company, 2: coordinator, 3: branch_head, 4: dealer, 5: customer)'
          }
        ],
        responses: {
          200: {
            description: 'Paginated bookings list with metadata',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PaginatedBookingsResponse' }
              }
            }
          }
        }
      },
      post: {
        tags: ['Bookings'],
        summary: 'Create Booking (Stored Procedure: create_booking)',
        description: 'Creates a new door fitting/installation booking in the database. When authenticated as Branch Head (Role 3), district and state are automatically assigned by the stored procedure from the user profile.',
        security: [{ BearerAuth: [] }],
        requestBody: {

          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'mobile', 'address'],
                properties: {
                  name: { type: 'string', example: 'Rahul Krishnan' },
                  mobile: { type: 'string', example: '+91 94471 22334' },
                  address: { type: 'string', example: 'House 12, MG Road, Ernakulam' },
                  notes: { type: 'string', example: 'Double door fitting required' },
                  status: { type: 'string', example: 'NEW' },
                  loginRoleId: { type: 'integer', example: 2 },
                  loginId: { type: 'integer', example: 2 },
                  loginName: { type: 'string', example: 'Elena Vance' },
                  stateId: { type: 'integer', example: 1 },
                  stateName: { type: 'string', example: 'Kerala' },
                  districtId: { type: 'integer', example: 1 },
                  districtName: { type: 'string', example: 'Ernakulam Hub' },
                  areaId: { type: 'integer', example: 1 },
                  areaName: { type: 'string', example: 'Edapally' },
                  documents: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['/uploads/site_plan.pdf']
                  }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Booking created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/BookingItem' }
              }
            }
          },
          400: {
            description: 'Validation error: name, mobile, or address missing',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/api/bookings/{id}': {
      put: {
        tags: ['Bookings'],
        summary: 'Update Booking (Stored Procedure: update_booking)',
        description: 'Updates an existing booking by ID using partial or full fields.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'Numeric ID of the booking to update'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Rahul K Nair' },
                  mobile: { type: 'string', example: '+91 94471 22334' },
                  address: { type: 'string', example: 'House 12, MG Road, Ernakulam' },
                  notes: { type: 'string', example: 'Customer requested evening installation' },
                  status: { type: 'string', example: 'CONFIRMED' },
                  stateId: { type: 'integer', example: 1 },
                  stateName: { type: 'string', example: 'Kerala' },
                  districtId: { type: 'integer', example: 1 },
                  districtName: { type: 'string', example: 'Ernakulam Hub' },
                  areaId: { type: 'integer', example: 1 },
                  areaName: { type: 'string', example: 'Edapally' },
                  documents: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['/uploads/site_plan.pdf', '/uploads/measurement_sheet.pdf']
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Booking updated successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/BookingItem' }
              }
            }
          },
          404: {
            description: 'Booking not found or has been deleted',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      },
      delete: {
        tags: ['Bookings'],
        summary: 'Delete Booking (Soft Delete via delete_booking SP)',
        description: 'Soft-deletes a booking by setting `is_deleted = 1` and updating `updated_at`.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'Numeric ID of the booking to delete'
          }
        ],
        responses: {
          200: {
            description: 'Booking deleted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Booking deleted successfully.' },
                    id: { type: 'integer', example: 1 }
                  }
                }
              }
            }
          },
          404: {
            description: 'Booking not found or already deleted',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/api/dropdowns': {
      get: {
        tags: ['Dropdowns'],
        summary: 'Fetch dropdown options for districts or areas (max 20 items)',
        security: [{ BearerAuth: [] }, { CookieAuth: [] }],
        parameters: [
          {
            name: 'type',
            in: 'query',
            required: true,
            schema: { type: 'string', example: 'district' },
            description: 'Dropdown category to fetch (e.g. "district" or "area")'
          },
          {
            name: 'parentId',
            in: 'query',
            required: false,
            schema: { type: 'integer' },
            description: 'stateId (for districts) or districtId (for areas)'
          },
          {
            name: 'search',
            in: 'query',
            required: false,
            schema: { type: 'string' },
            description: 'Search filter keyword'
          },
          {
            name: 'page',
            in: 'query',
            required: false,
            schema: { type: 'integer', default: 1 },
            description: 'Page number for pagination (default: 1)'
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            schema: { type: 'integer', default: 20 },
            description: 'Number of items per page (default: 20)'
          }
        ],
        responses: {
          200: {
            description: 'List of dropdown items with id and name',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    type: { type: 'string', example: 'district' },
                    count: { type: 'integer', example: 5 },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'integer', example: 1 },
                          name: { type: 'string', example: 'Ernakulam Hub' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/uploads/single': {
      post: {
        tags: ['Uploads'],
        summary: 'Upload a single document or photo',
        description: 'Upload a document or photo for bookings. Accepts form-data with key `file` or `document`.',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  file: {
                    type: 'string',
                    format: 'binary',
                    description: 'The file to upload (.jpg, .jpeg, .png, .webp, .pdf, .doc, .docx)'
                  }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'File uploaded successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'File uploaded successfully.' },
                    url: { type: 'string', example: '/uploads/1729600000000-photo.jpg' },
                    filename: { type: 'string', example: '1729600000000-photo.jpg' },
                    originalname: { type: 'string', example: 'photo.jpg' },
                    mimetype: { type: 'string', example: 'image/jpeg' },
                    size: { type: 'integer', example: 1048576 }
                  }
                }
              }
            }
          },
          400: {
            description: 'No file uploaded or invalid file format'
          }
        }
      }
    },
    '/api/uploads/multiple': {
      post: {
        tags: ['Uploads'],
        summary: 'Upload multiple documents or photos',
        description: 'Upload up to 10 documents or photos. Accepts form-data with key `files` or `documents`.',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  files: {
                    type: 'array',
                    items: {
                      type: 'string',
                      format: 'binary'
                    },
                    description: 'Array of files to upload (max 10)'
                  }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Files uploaded successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: '2 file(s) uploaded successfully.' },
                    count: { type: 'integer', example: 2 },
                    files: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          url: { type: 'string', example: '/uploads/1729600000000-photo.jpg' },
                          filename: { type: 'string', example: '1729600000000-photo.jpg' },
                          originalname: { type: 'string', example: 'photo.jpg' },
                          mimetype: { type: 'string', example: 'image/jpeg' },
                          size: { type: 'integer', example: 1048576 }
                        }
                      }
                    },
                    urls: {
                      type: 'array',
                      items: { type: 'string' },
                      example: ['/uploads/1729600000000-photo.jpg', '/uploads/1729600000001-doc.pdf']
                    }
                  }
                }
              }
            }
          },
          400: {
            description: 'No files uploaded or invalid file format'
          }
        }
      }
    },
    '/api/status': {
      get: {
        tags: ['Status'],
        summary: 'Get Status Options (Stored Procedure: get_status_options)',
        description: 'Retrieves all available status options ordered by sort_order using `get_status_options`.',
        security: [{ BearerAuth: [] }, { CookieAuth: [] }],
        responses: {
          200: {
            description: 'Status options retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    count: { type: 'integer', example: 4 },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'integer', example: 1 },
                          code: { type: 'string', example: 'NEW' },
                          label: { type: 'string', example: 'New' },
                          colorCode: { type: 'string', example: '#3b82f6' },
                          sortOrder: { type: 'integer', example: 1 },
                          isActive: { type: 'integer', example: 1 }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          400: {
            description: 'Database or server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      },
      post: {
        tags: ['Status'],
        summary: 'Save Client Status (Stored Procedure: sp_save_client_status)',
        description: 'Saves the status (Scheduled, Completed, Cancelled), schedule date, and notes using `sp_save_client_status`. When Cancelled is chosen, schedule date is automatically cleared to NULL.',
        security: [{ BearerAuth: [] }, { CookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SaveStatusRequest' }
            }
          }
        },
        responses: {
          200: {
            description: 'Status successfully recorded',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SaveStatusResponse' }
              }
            }
          },
          400: {
            description: 'Validation error (missing clientId or status)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/api/dropdowns/districts': {
      get: {
        tags: ['Dropdowns'],
        summary: 'Get Districts Dropdown (Coordinator / Branch Head)',
        description: 'Fetches list of districts using stored procedure `sp_get_dropdown_data`. For Coordinator (Role 2) or unauthenticated users, returns all districts. For Branch Head (Role 3), returns only their assigned district.',
        security: [{ BearerAuth: [] }, { CookieAuth: [] }],
        parameters: [
          {
            name: 'stateId',
            in: 'query',
            required: false,
            schema: { type: 'integer' },
            description: 'Filter by State ID (optional)',
            example: 1
          },
          {
            name: 'search',
            in: 'query',
            required: false,
            schema: { type: 'string' },
            description: 'Search keyword for district name or code',
            example: 'Ern'
          },
          {
            name: 'page',
            in: 'query',
            required: false,
            schema: { type: 'integer', default: 1 },
            description: 'Page number'
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            schema: { type: 'integer', default: 20 },
            description: 'Items per page'
          }
        ],
        responses: {
          200: {
            description: 'Districts retrieved successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/DropdownResponse' }
              }
            }
          }
        }
      }
    },
    '/api/dropdowns/areas': {
      get: {
        tags: ['Dropdowns'],
        summary: 'Get Areas Dropdown (Filtered by District)',
        description: 'Fetches list of areas using stored procedure `sp_get_dropdown_data`. When districtId is provided or user is Branch Head, returns areas for that specific district.',
        security: [{ BearerAuth: [] }, { CookieAuth: [] }],
        parameters: [
          {
            name: 'districtId',
            in: 'query',
            required: false,
            schema: { type: 'integer' },
            description: 'District ID to filter areas by (e.g. 1 for Ernakulam Hub)',
            example: 1
          },
          {
            name: 'search',
            in: 'query',
            required: false,
            schema: { type: 'string' },
            description: 'Search keyword for area name or pincode',
            example: 'Edapally'
          },
          {
            name: 'page',
            in: 'query',
            required: false,
            schema: { type: 'integer', default: 1 },
            description: 'Page number'
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            schema: { type: 'integer', default: 20 },
            description: 'Items per page'
          }
        ],
        responses: {
          200: {
            description: 'Areas retrieved successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/DropdownResponse' }
              }
            }
          }
        }
      }
    },
    '/api/dropdowns': {
      get: {
        tags: ['Dropdowns'],
        summary: 'Generic Dropdown Lookup (type: district | area)',
        description: 'Generic dropdown lookup endpoint supporting both `district` and `area` types.',
        security: [{ BearerAuth: [] }, { CookieAuth: [] }],
        parameters: [
          {
            name: 'type',
            in: 'query',
            required: true,
            schema: { type: 'string', enum: ['district', 'area'] },
            description: 'Dropdown type',
            example: 'district'
          },
          {
            name: 'parentId',
            in: 'query',
            required: false,
            schema: { type: 'integer' },
            description: 'Parent ID (stateId for district, districtId for area)'
          },
          {
            name: 'search',
            in: 'query',
            required: false,
            schema: { type: 'string' },
            description: 'Search keyword'
          },
          {
            name: 'page',
            in: 'query',
            required: false,
            schema: { type: 'integer', default: 1 }
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            schema: { type: 'integer', default: 20 }
          }
        ],
        responses: {
          200: {
            description: 'Dropdown items retrieved successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/DropdownResponse' }
              }
            }
          },
          400: {
            description: 'Invalid type parameter',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/api/mobile-dashboard': {
      get: {
        tags: ['Mobile Dashboard'],
        summary: 'Fitmate Mobile Dashboard Metrics (Stored Procedure: get_dashboard_metrics)',
        description: 'Fetches metric cards for Fitmate mobile dashboard: New Booking, Pending, Completed, Scheduled, and Total bookings count. Supports period presets (this_month, last_30_days, all) or custom date windows (dateFrom, dateTo), and scopes results based on authenticated user role and district.',
        security: [{ BearerAuth: [] }, { CookieAuth: [] }, {}],
        parameters: [
          {
            name: 'period',
            in: 'query',
            required: false,
            schema: {
              type: 'string',
              enum: ['this_month', 'last_30_days', 'all'],
              default: 'this_month'
            },
            description: "Date filter preset: 'this_month' (default), 'last_30_days', or 'all'"
          },
          {
            name: 'districtId',
            in: 'query',
            required: false,
            schema: { type: 'integer' },
            description: 'Optional District ID to filter metrics (Coordinator/Admin or Branch override)'
          },
          {
            name: 'dateFrom',
            in: 'query',
            required: false,
            schema: { type: 'string', format: 'date', example: '2026-10-01' },
            description: 'Custom start date (YYYY-MM-DD), overrides preset period'
          },
          {
            name: 'dateTo',
            in: 'query',
            required: false,
            schema: { type: 'string', format: 'date', example: '2026-10-31' },
            description: 'Custom end date (YYYY-MM-DD), overrides preset period'
          }
        ],
        responses: {
          200: {
            description: 'Dashboard metrics retrieved successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/DashboardMetricsResponse' }
              }
            }
          },
          500: {
            description: 'Database or server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/api/mobile-dashboard/metrics': {
      get: {
        tags: ['Mobile Dashboard'],
        summary: 'Fitmate Mobile Dashboard Metrics (Alias)',
        description: 'Alias endpoint for `/api/mobile-dashboard` that calls `get_dashboard_metrics`.',
        security: [{ BearerAuth: [] }, { CookieAuth: [] }, {}],
        parameters: [
          {
            name: 'period',
            in: 'query',
            required: false,
            schema: {
              type: 'string',
              enum: ['this_month', 'last_30_days', 'all'],
              default: 'this_month'
            },
            description: "Date filter preset: 'this_month' (default), 'last_30_days', or 'all'"
          },
          {
            name: 'districtId',
            in: 'query',
            required: false,
            schema: { type: 'integer' },
            description: 'Optional District ID to filter metrics'
          },
          {
            name: 'dateFrom',
            in: 'query',
            required: false,
            schema: { type: 'string', format: 'date', example: '2026-10-01' },
            description: 'Custom start date (YYYY-MM-DD)'
          },
          {
            name: 'dateTo',
            in: 'query',
            required: false,
            schema: { type: 'string', format: 'date', example: '2026-10-31' },
            description: 'Custom end date (YYYY-MM-DD)'
          }
        ],
        responses: {
          200: {
            description: 'Dashboard metrics retrieved successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/DashboardMetricsResponse' }
              }
            }
          },
          500: {
            description: 'Database or server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/api/health': {
      get: {
        summary: 'Health Check',
        responses: { 200: { description: 'Server is healthy' } }
      }
    }
  }
};
