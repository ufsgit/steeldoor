export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'SteelGuard Door Management System API',
    version: '1.0.0',
    description: 'RESTful API for SteelGuard Door Management System - Mobile Authentication with JWT.'
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local Development Server'
    }
  ],
  tags: [
    { name: 'Auth', description: 'Mobile Authentication (JWT)' }
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
            example: 'branch123',
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
    '/api/health': {
      get: {
        summary: 'Health Check',
        responses: { 200: { description: 'Server is healthy' } }
      }
    }
  }
};
