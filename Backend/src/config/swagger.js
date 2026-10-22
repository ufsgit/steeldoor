export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'SteelGuard Door Management System API',
    version: '1.0.0',
    description: 'RESTful API for SteelGuard Door Management System - Authentication & Bookings.'
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local Development Server'
    }
  ],
  tags: [
    { name: 'Auth', description: 'Mobile Authentication (JWT)' },
    { name: 'Bookings', description: 'Booking Management & Pagination' },
    { name: 'Dropdowns', description: 'Searchable Dropdown Select Options (Districts, Areas)' }
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
          status: { type: 'string', example: 'NEW' },
          loginRoleId: { type: 'integer', nullable: true, example: 2 },
          loginId: { type: 'integer', nullable: true, example: 2 },
          loginName: { type: 'string', nullable: true, example: 'Elena Vance' },
          stateId: { type: 'integer', nullable: true, example: 1 },
          stateName: { type: 'string', nullable: true, example: 'Kerala' },
          districtId: { type: 'integer', nullable: true, example: 1 },
          districtName: { type: 'string', nullable: true, example: 'Ernakulam Hub' },
          areaId: { type: 'integer', nullable: true, example: 4 },
          areaName: { type: 'string', nullable: true, example: 'Palarivattom' },
          documents: {
            type: 'array',
            items: { type: 'string' },
            example: ['/uploads/site_plan.pdf']
          },
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
    '/api/health': {
      get: {
        summary: 'Health Check',
        responses: { 200: { description: 'Server is healthy' } }
      }
    }
  }
};
