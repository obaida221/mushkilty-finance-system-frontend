import type { 
  // LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  User, 
  BackendPermissionResponse,
} from '../types';

/**
 * Authentication Service Class
 * Handles all authentication-related operations
 * Based on the Backend API Documentation
 */
export class AuthService {
  private baseURL = 'http://localhost:3001';
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  /**
   * User Login
   * POST /auth/login
   * @param email - User email
   * @param password - User password
   * @returns Promise<LoginResponse>
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data: LoginResponse = await response.json();
      this.token = data.access_token;
      localStorage.setItem('authToken', this.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * User Registration
   * POST /auth/register
   * @param userData - Registration data
   * @returns Promise<User>
   */
  async register(userData: RegisterRequest): Promise<User> {
    try {
      const response = await fetch(`${this.baseURL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get User Profile with Permissions
   * GET /auth/profile and GET /roles/me/permissions
   * @returns Promise<User>
   */
  async getProfile(): Promise<User> {
    try {
      // First get the basic profile
      const profileResponse = await fetch(`${this.baseURL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      if (!profileResponse.ok) {
        if (profileResponse.status === 401) {
          this.logout();
          throw new Error('Session expired');
        }
        throw new Error('Failed to fetch profile');
      }

      const profileData = await profileResponse.json();

      // Then get permissions
      try {
        const permissionsResponse = await fetch(`${this.baseURL}/roles/me/permissions`, {
          headers: {
            'Authorization': `Bearer ${this.token}`,
          },
        });

        if (permissionsResponse.ok) {
          const permissionsData: BackendPermissionResponse = await permissionsResponse.json();
          
          // Combine profile with permissions
          return {
            ...profileData,
            role: permissionsData.role,
            permissions: permissionsData.permissions
          };
        }
      } catch (permError) {
        console.warn('Failed to fetch permissions:', permError);
      }

      return profileData;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Logout user
   * Clears local storage and token
   */
  logout(): void {
    this.token = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  /**
   * Check if user is authenticated
   * @returns boolean
   */
  isAuthenticated(): boolean {
    return !!this.token;
  }

  /**
   * Get current auth token
   * @returns string | null
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Helper function to check if user has specific permission
   * @param user - User object
   * @param permissionName - Permission name to check
   * @returns boolean
   */
  hasPermission(user: User | null, permissionName: string): boolean {
    if (!user) {
      return false;
    }

    // Check direct permissions array (from /roles/me/permissions)
    if (user.permissions && Array.isArray(user.permissions)) {
      return user.permissions.some(permission => permission.name === permissionName);
    }

    // Fallback to role permissions structure
    if (user.role && user.role.rolePermissions) {
      return user.role.rolePermissions.some(
        rp => rp.permission.name === permissionName
      );
    }

    return false;
  }

  /**
   * Make authenticated API request
   * @param endpoint - API endpoint
   * @param options - Fetch options
   * @returns Promise<any>
   */
  async authenticatedRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = this.getToken();
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, config);

    if (response.status === 401) {
      this.logout();
      window.location.href = '/login';
      return;
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    return await response.json();
  }
}

// Create singleton instance
export const authService = new AuthService();
export default authService;