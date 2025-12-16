/**
 * Permission and access level utilities
 * Helps determine what features staff members can access based on their role and permissions
 */

/**
 * Access levels for staff members
 */
export const ACCESS_LEVELS = {
  BASIC: 'basic',           // Basic staff - attendance, tasks only
  MODERATE: 'moderate',     // Can manage some resources
  HIGH: 'high',             // Can manage most resources
  ADMIN: 'admin'            // Full admin access (separate from admin role)
};

/**
 * Staff roles and their default access levels
 */
export const STAFF_ROLE_ACCESS = {
  'imam': ACCESS_LEVELS.HIGH,
  'teacher': ACCESS_LEVELS.HIGH,
  'administrator': ACCESS_LEVELS.HIGH,
  'maintenance': ACCESS_LEVELS.BASIC,
  'security': ACCESS_LEVELS.BASIC,
  'volunteer': ACCESS_LEVELS.BASIC,
};

/**
 * Check if user has permission for a specific feature
 * @param {Object} user - User object from AuthContext
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
export function hasPermission(user, permission) {
  if (!user) return false;

  // Admins have all permissions
  if (user.role === 'admin') return true;

  // Check staff permissions
  if (user.role === 'staff' || user.role === 'teacher') {
    const staffRole = user.staff_profile?.role || user.role;
    const accessLevel = STAFF_ROLE_ACCESS[staffRole] || ACCESS_LEVELS.BASIC;

    // Define permissions by access level
    const permissionsByLevel = {
      [ACCESS_LEVELS.BASIC]: [
        'view_attendance',
        'update_own_attendance',
        'view_own_tasks',
        'update_own_tasks',
      ],
      [ACCESS_LEVELS.MODERATE]: [
        'view_attendance',
        'update_own_attendance',
        'view_all_tasks',
        'view_reports',
        'manage_bookings',
      ],
      [ACCESS_LEVELS.HIGH]: [
        'view_attendance',
        'update_attendance',
        'view_all_tasks',
        'assign_tasks',
        'view_reports',
        'manage_bookings',
        'manage_students',
        'manage_courses',
      ],
    };

    const allowedPermissions = permissionsByLevel[accessLevel] || [];
    return allowedPermissions.includes(permission);
  }

  return false;
}

/**
 * Get user's access level
 * @param {Object} user - User object from AuthContext
 * @returns {string}
 */
export function getAccessLevel(user) {
  if (!user) return ACCESS_LEVELS.BASIC;
  if (user.role === 'admin') return ACCESS_LEVELS.ADMIN;
  
  if (user.role === 'staff' || user.role === 'teacher') {
    const staffRole = user.staff_profile?.role || user.role;
    return STAFF_ROLE_ACCESS[staffRole] || ACCESS_LEVELS.BASIC;
  }

  return ACCESS_LEVELS.BASIC;
}

/**
 * Check if user can access a specific route/page
 * @param {Object} user - User object from AuthContext
 * @param {string} route - Route name to check
 * @returns {boolean}
 */
export function canAccessRoute(user, route) {
  const routePermissions = {
    '/staff/attendance': 'view_attendance',
    '/staff/tasks': 'view_all_tasks',
    '/staff/reports': 'view_reports',
    '/bookings': 'manage_bookings',
    '/students': 'manage_students',
    '/education': 'manage_courses',
  };

  const requiredPermission = routePermissions[route];
  if (!requiredPermission) return true; // Allow access if no permission required

  return hasPermission(user, requiredPermission);
}

/**
 * Get list of accessible features for user
 * @param {Object} user - User object from AuthContext
 * @returns {Array<string>}
 */
export function getAccessibleFeatures(user) {
  if (!user) return [];

  const accessLevel = getAccessLevel(user);
  
  const featuresByLevel = {
    [ACCESS_LEVELS.BASIC]: [
      'attendance',
      'tasks',
    ],
    [ACCESS_LEVELS.MODERATE]: [
      'attendance',
      'tasks',
      'reports',
      'bookings',
    ],
    [ACCESS_LEVELS.HIGH]: [
      'attendance',
      'tasks',
      'reports',
      'bookings',
      'students',
      'courses',
    ],
    [ACCESS_LEVELS.ADMIN]: [
      'attendance',
      'tasks',
      'reports',
      'bookings',
      'students',
      'courses',
      'users',
      'settings',
      'system',
    ],
  };

  return featuresByLevel[accessLevel] || [];
}
