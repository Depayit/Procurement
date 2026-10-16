import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { UserProfile, PermissionKey, PermissionModule, RoleConfig } from '../types';
import { DEFAULT_ROLES_CONFIG, ALL_PERMISSION_KEYS } from '../lib/permissions';
import { logSystemAction } from '../lib/auditLog';
import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

export type UserRole = 
  | 'Site Engineer' 
  | 'Purchasing Staff' 
  | 'Purchasing Manager' 
  | 'Approver' 
  | 'Inventory Control' 
  | 'Admin'
  | string;

export interface AvailableRoleItem {
  role: UserRole;
  titleTh: string;
  titleEn: string;
  descTh: string;
  descEn: string;
  avatarText: string;
  color?: string;
  isAdmin?: boolean;
}

export interface AuthContextType {
  currentUser: UserProfile;
  activeRole: UserRole;
  activeRoleConfig: RoleConfig;
  roles: RoleConfig[];
  switchRole: (role: UserRole) => void;
  availableRoles: AvailableRoleItem[];
  
  // Authentication
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string; user?: UserProfile }>;
  logout: () => void;

  // RBAC Permission Checker
  hasPermission: (key: PermissionKey) => boolean;
  canViewModule: (module: PermissionModule) => boolean;
  
  // Specific permission helpers
  isAdmin: boolean;
  canCreatePR: boolean;
  canEditPR: boolean;
  canDeletePR: boolean;
  canExportPR: boolean;
  canApprovePR: boolean;
  canApprovePO: boolean;
  canRejectApproval: boolean;
  canApprove: boolean; // General approval permission (PR or PO)
  canCreatePO: boolean;
  canIssuePO: boolean;
  canCancelPO: boolean;
  canExportPO: boolean;
  canManageInventory: boolean;
  canReceiveGR: boolean;
  canScanQR: boolean;
  canAdjustStock: boolean;
  canManageVendors: boolean;
  canRateVendors: boolean;
  canViewReports: boolean;
  canExportReports: boolean;
  canManageUsers: boolean;
  canManageRoles: boolean;
  canViewAuditLogs: boolean;
  canManageSettings: boolean;

  // Role management for Admin
  updateRolePermissions: (roleId: string, permissions: PermissionKey[]) => void;
  updateRole: (roleId: string, data: Partial<RoleConfig>) => void;
  addRole: (roleData: Omit<RoleConfig, 'id'>) => RoleConfig;
  deleteRole: (roleId: string) => boolean;
  resetRolesToDefault: () => void;
}

const STORAGE_USER_KEY = 'coneragestore_active_user';
const STORAGE_ROLES_KEY = 'coneragestore_roles_v2';
const STORAGE_AUTH_KEY = 'coneragestore_is_authenticated';

export const PRESET_USERS: Record<string, UserProfile> = {
  'Site Engineer': {
    id: 'usr-se-1',
    name: 'สมชาย ช่างก่อสร้าง',
    email: 'somchai.eng@coneragestore.local',
    role: 'Site Engineer',
    status: 'Active',
    department: 'โครงการ คอนโดสุขุมวิท 101',
    lastLogin: new Date().toISOString()
  },
  'Purchasing Staff': {
    id: 'usr-buy-1',
    name: 'สมปอง จัดซื้อ',
    email: 'sompong.buyer@coneragestore.local',
    role: 'Purchasing Staff',
    status: 'Active',
    department: 'ฝ่ายจัดซื้อและสัญญา (ส่วนกลาง)',
    lastLogin: new Date().toISOString()
  },
  'Purchasing Manager': {
    id: 'usr-pm-1',
    name: 'วิภาวี สุขขี',
    email: 'wipawee.pm@coneragestore.local',
    role: 'Purchasing Manager',
    status: 'Active',
    department: 'ฝ่ายบริหารงานจัดซื้อ',
    lastLogin: new Date().toISOString()
  },
  'Approver': {
    id: 'usr-appr-1',
    name: 'นายธีรภัทร บริหารงาน',
    email: 'teerapat.dir@coneragestore.local',
    role: 'Approver',
    status: 'Active',
    department: 'คณะกรรมการบริหารและอนุมัติโครงการ',
    lastLogin: new Date().toISOString()
  },
  'Inventory Control': {
    id: 'usr-inv-1',
    name: 'บุญมี สต๊อก',
    email: 'boonmee.wh@coneragestore.local',
    role: 'Inventory Control',
    status: 'Active',
    department: 'คลังพัสดุและจัดเก็บกลาง',
    lastLogin: new Date().toISOString()
  },
  'Admin': {
    id: 'usr-adm-1',
    name: 'ผู้ดูแลระบบสูงสุด (Admin)',
    email: 'admin@coneragestore.local',
    role: 'Admin',
    status: 'Active',
    department: 'เทคโนโลยีสารสนเทศ (IT ERP & Governance)',
    lastLogin: new Date().toISOString()
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Roles Configuration State
  const [roles, setRoles] = useState<RoleConfig[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ROLES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load roles from storage:', e);
    }
    return DEFAULT_ROLES_CONFIG;
  });

  // Save roles to localStorage whenever modified
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ROLES_KEY, JSON.stringify(roles));
    } catch (e) {
      console.error('Failed to save roles:', e);
    }
  }, [roles]);

  // 2. Current User State
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_USER_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return PRESET_USERS['Admin'];
  });

  // 3. Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_AUTH_KEY);
      if (saved !== null) {
        return saved === 'true';
      }
    } catch {
      // ignore
    }
    return true;
  });

  const login = useCallback(async (email: string, _password?: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    
    // 1. Match from PRESET_USERS
    const presetMatch = Object.values(PRESET_USERS).find(u => 
      u.email.toLowerCase() === cleanEmail || 
      u.role.toLowerCase() === cleanEmail ||
      u.name.toLowerCase().includes(cleanEmail)
    );

    let userToSet = presetMatch;

    // 2. Match from persisted users in users list if any
    if (!userToSet) {
      try {
        const savedUsersStr = localStorage.getItem('procuresync_users_list_v2');
        if (savedUsersStr) {
          const parsedUsers = JSON.parse(savedUsersStr);
          if (Array.isArray(parsedUsers)) {
            const found = parsedUsers.find((u: any) => 
              u.email?.toLowerCase() === cleanEmail ||
              u.role?.toLowerCase() === cleanEmail ||
              u.name?.toLowerCase().includes(cleanEmail)
            );
            if (found) {
              userToSet = {
                id: found.id || `usr-${Date.now()}`,
                name: found.name,
                email: found.email,
                role: found.role,
                status: found.status || 'Active',
                department: found.department,
                lastLogin: new Date().toISOString()
              };
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    // 3. Admin fallback (e.g. if typing admin)
    if (!userToSet && (cleanEmail === 'admin' || cleanEmail === 'admin@coneragestore.local')) {
      userToSet = PRESET_USERS['Admin'];
    }

    if (userToSet) {
      setCurrentUser(userToSet);
      setIsAuthenticated(true);
      try {
        localStorage.setItem(STORAGE_AUTH_KEY, 'true');
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userToSet));
      } catch {
        // ignore
      }
      logSystemAction(userToSet.name, 'Login', `เข้าสู่ระบบสำเร็จในบทบาท ${userToSet.role}`);
      return { success: true };
    }

    return { 
      success: false, 
      error: 'ไม่พบบัญชีผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบข้อมูลอีกครั้ง หรือเข้าสู่ระบบด้วย Google Account' 
    };
  }, []);

  const loginWithGoogle = useCallback(async (): Promise<{ success: boolean; error?: string; user?: UserProfile }> => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const gUser = result.user;

      if (!gUser || !gUser.email) {
        return { success: false, error: 'ไม่พบข้อมูลอีเมลจาก Google Account' };
      }

      const cleanEmail = gUser.email.trim().toLowerCase();
      const displayName = gUser.displayName || cleanEmail.split('@')[0] || 'Google User';
      const photoURL = gUser.photoURL || undefined;

      // 1. Check if user exists in PRESET_USERS
      const presetMatch = Object.values(PRESET_USERS).find(u => 
        u.email.toLowerCase() === cleanEmail
      );

      let userToSet: UserProfile | undefined = presetMatch ? {
        ...presetMatch,
        name: gUser.displayName || presetMatch.name,
        photoURL,
        authProvider: 'google',
        lastLogin: new Date().toISOString()
      } : undefined;

      // 2. Check if user exists in persisted users list
      if (!userToSet) {
        try {
          const savedUsersStr = localStorage.getItem('procuresync_users_list_v2');
          if (savedUsersStr) {
            const parsedUsers = JSON.parse(savedUsersStr);
            if (Array.isArray(parsedUsers)) {
              const found = parsedUsers.find((u: any) => u.email?.toLowerCase() === cleanEmail);
              if (found) {
                userToSet = {
                  id: found.id || `usr-g-${gUser.uid.slice(0, 8)}`,
                  name: gUser.displayName || found.name,
                  email: found.email,
                  role: found.role || 'Purchasing Staff',
                  status: 'Active',
                  department: found.department || 'ฝ่ายจัดซื้อและสัญญา (ส่วนกลาง)',
                  lastLogin: new Date().toISOString(),
                  photoURL,
                  authProvider: 'google'
                };
              }
            }
          }
        } catch (e) {
          console.error('Error finding user in persisted list:', e);
        }
      }

      // 3. New user registration from Google Account
      if (!userToSet) {
        const isAdminUser = cleanEmail.includes('admin');
        const defaultRole = isAdminUser ? 'Admin' : 'Purchasing Staff';
        const defaultDept = isAdminUser ? 'เทคโนโลยีสารสนเทศ (IT ERP & Governance)' : 'ฝ่ายจัดซื้อและสัญญา (ส่วนกลาง)';

        userToSet = {
          id: `usr-g-${gUser.uid.slice(0, 10)}`,
          name: displayName,
          email: gUser.email,
          role: defaultRole,
          status: 'Active',
          department: defaultDept,
          lastLogin: new Date().toISOString(),
          photoURL,
          authProvider: 'google'
        };

        try {
          const savedUsersStr = localStorage.getItem('procuresync_users_list_v2');
          const userList = savedUsersStr ? JSON.parse(savedUsersStr) : [];
          if (Array.isArray(userList) && !userList.some((u: any) => u.email?.toLowerCase() === cleanEmail)) {
            userList.push({
              id: userToSet.id,
              name: userToSet.name,
              email: userToSet.email,
              role: userToSet.role,
              status: 'Active',
              department: userToSet.department,
              lastLogin: 'เพิ่งเข้าสู่ระบบ (Google)'
            });
            localStorage.setItem('procuresync_users_list_v2', JSON.stringify(userList));
          }
        } catch (e) {
          console.error('Failed to append new Google user to procuresync_users_list_v2:', e);
        }
      }

      setCurrentUser(userToSet);
      setIsAuthenticated(true);
      try {
        localStorage.setItem(STORAGE_AUTH_KEY, 'true');
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userToSet));
      } catch {
        // ignore
      }

      logSystemAction(userToSet.name, 'Google Login', `เข้าสู่ระบบสำเร็จผ่าน Google Account: ${userToSet.email} (${userToSet.role})`);
      return { success: true, user: userToSet };
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      let errMsg = 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ';
      if (err?.code === 'auth/popup-closed-by-user') {
        errMsg = 'หน้าต่างเข้าสู่ระบบ Google ถูกปิดก่อนเสร็จสิ้น (Popup closed)';
      } else if (err?.code === 'auth/popup-blocked') {
        errMsg = 'เบราว์เซอร์บล็อกหน้าต่างป๊อปอัป กรุณาอนุญาตป๊อปอัปสำหรับเว็บไซต์นี้';
      } else if (err?.code === 'auth/cancelled-popup-request') {
        errMsg = 'มีคำขอเข้าสู่ระบบกำลังทำงานอยู่ กรุณารอสักครู่';
      } else if (err?.code === 'auth/unauthorized-domain') {
        errMsg = 'โดเมนนี้ยังไม่ได้เปิดรับรองใน Firebase Auth (Authorized Domains) กรุณาตรวจสอบ Firebase Console';
      } else if (err?.code === 'auth/operation-not-allowed') {
        errMsg = 'ระบบ Google Sign-In ยังไม่ได้รับการเปิดใช้งานใน Firebase Console (Authentication > Sign-in method > Google)';
      } else if (err?.message) {
        errMsg = err.message;
      }
      return { success: false, error: errMsg };
    }
  }, []);

  const logout = useCallback(async () => {
    logSystemAction(currentUser.name, 'Logout', 'ออกจากระบบการใช้งาน');
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.warn('Firebase signout notice:', e);
    }
    setIsAuthenticated(false);
    try {
      localStorage.setItem(STORAGE_AUTH_KEY, 'false');
    } catch {
      // ignore
    }
  }, [currentUser.name]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(currentUser));
    } catch {
      // ignore
    }
  }, [currentUser]);

  // Active Role determination
  const activeRole = currentUser.role;

  // Active Role Config object
  const activeRoleConfig = useMemo<RoleConfig>(() => {
    const found = roles.find(r => r.name.toLowerCase() === activeRole.toLowerCase());
    if (found) return found;

    // Fallback: if not found, create a safe fallback
    if (activeRole.toLowerCase() === 'admin') {
      return {
        id: 'role-admin',
        name: 'Admin',
        titleTh: 'ผู้ดูแลระบบสูงสุด',
        titleEn: 'System Administrator',
        descTh: 'เข้าถึงทุกระบบ 100%',
        descEn: 'Full system superuser',
        avatarText: 'AD',
        color: 'bg-indigo-600 text-white',
        isSystem: true,
        isAdmin: true,
        permissions: [...ALL_PERMISSION_KEYS]
      };
    }

    return {
      id: `role-custom-${activeRole}`,
      name: activeRole,
      titleTh: activeRole,
      titleEn: activeRole,
      descTh: 'บทบาทกำหนดเอง',
      descEn: 'Custom Role',
      avatarText: activeRole.slice(0, 2).toUpperCase(),
      color: 'bg-slate-600 text-white',
      isSystem: false,
      permissions: ['dashboard:view', 'pr:view']
    };
  }, [roles, activeRole]);

  // Switch Role function
  const switchRole = useCallback((roleName: UserRole) => {
    let presetUser = PRESET_USERS[roleName];
    if (!presetUser) {
      // Dynamic profile for custom roles
      presetUser = {
        id: `usr-custom-${Math.random().toString(36).substr(2, 6)}`,
        name: `ผู้ใช้งาน (${roleName})`,
        email: `user.${roleName.toLowerCase().replace(/\s+/g, '')}@procuresync.local`,
        role: roleName,
        status: 'Active',
        department: 'สายงานปฏิบัติการโครงการ',
        lastLogin: new Date().toISOString()
      };
    }
    setCurrentUser(presetUser);
    logSystemAction(presetUser.name, 'Switch Persona', `สลับบทบาทการทำงานเป็น: ${roleName}`);
  }, []);

  // 3. Permission Evaluation Engine
  const hasPermission = useCallback((key: PermissionKey): boolean => {
    // Admin superuser override: Admin always has full access
    if (activeRoleConfig.isAdmin || activeRole.toLowerCase() === 'admin') {
      return true;
    }
    return activeRoleConfig.permissions.includes(key);
  }, [activeRoleConfig, activeRole]);

  const canViewModule = useCallback((module: PermissionModule): boolean => {
    if (activeRoleConfig.isAdmin || activeRole.toLowerCase() === 'admin') return true;
    return activeRoleConfig.permissions.some(p => p.startsWith(`${module}:`));
  }, [activeRoleConfig, activeRole]);

  // Granular Helpers
  const isAdmin = Boolean(activeRoleConfig.isAdmin || activeRole.toLowerCase() === 'admin');
  const canCreatePR = hasPermission('pr:create');
  const canEditPR = hasPermission('pr:edit');
  const canDeletePR = hasPermission('pr:delete');
  const canExportPR = hasPermission('pr:export');

  const canApprovePR = hasPermission('approvals:approve_pr');
  const canApprovePO = hasPermission('approvals:approve_po');
  const canRejectApproval = hasPermission('approvals:reject');
  const canApprove = canApprovePR || canApprovePO || isAdmin;

  const canCreatePO = hasPermission('po:create');
  const canIssuePO = hasPermission('po:issue');
  const canCancelPO = hasPermission('po:cancel');
  const canExportPO = hasPermission('po:export');

  const canManageInventory = hasPermission('inventory:adjust_stock') || hasPermission('inventory:receive_gr') || isAdmin;
  const canReceiveGR = hasPermission('inventory:receive_gr');
  const canScanQR = hasPermission('inventory:qr_scan');
  const canAdjustStock = hasPermission('inventory:adjust_stock');

  const canManageVendors = hasPermission('vendors:manage');
  const canRateVendors = hasPermission('vendors:rate');

  const canViewReports = hasPermission('reports:view');
  const canExportReports = hasPermission('reports:export');

  const canManageUsers = hasPermission('users:manage_users') || isAdmin;
  const canManageRoles = hasPermission('users:manage_roles') || isAdmin;
  const canViewAuditLogs = hasPermission('users:audit_logs') || isAdmin;

  const canManageSettings = hasPermission('settings:manage') || isAdmin;

  // Available roles for header switcher and modals
  const availableRoles = useMemo<AvailableRoleItem[]>(() => {
    return roles.map(r => ({
      role: r.name,
      titleTh: r.titleTh,
      titleEn: r.titleEn,
      descTh: r.descTh,
      descEn: r.descEn,
      avatarText: r.avatarText,
      color: r.color,
      isAdmin: r.isAdmin
    }));
  }, [roles]);

  // 4. Role Management Functions (for Admin)
  const updateRolePermissions = useCallback((roleId: string, permissions: PermissionKey[]) => {
    setRoles(prevRoles => prevRoles.map(r => {
      if (r.id === roleId) {
        // Security safeguard: If Admin role, ensure it keeps admin powers or superuser flag
        const isTargetAdmin = r.isAdmin || r.name.toLowerCase() === 'admin';
        const finalPermissions = isTargetAdmin 
          ? [...ALL_PERMISSION_KEYS] 
          : permissions;

        logSystemAction(
          currentUser.name,
          'Update Role Permissions',
          `อัปเดตสิทธิ์บทบาท: ${r.titleTh || r.name} (เปิดสิทธิ์ ${finalPermissions.length} รายการ)`
        );

        return {
          ...r,
          permissions: finalPermissions
        };
      }
      return r;
    }));
  }, [currentUser.name]);

  const updateRole = useCallback((roleId: string, data: Partial<RoleConfig>) => {
    setRoles(prev => prev.map(r => {
      if (r.id === roleId) {
        logSystemAction(
          currentUser.name,
          'Update Role Details',
          `แก้ไขข้อมูลบทบาท: ${data.name || r.name}`
        );
        return { ...r, ...data };
      }
      return r;
    }));
  }, [currentUser.name]);

  const addRole = useCallback((roleData: Omit<RoleConfig, 'id'>): RoleConfig => {
    const newId = `role-${Math.random().toString(36).substr(2, 9)}`;
    const newRole: RoleConfig = {
      ...roleData,
      id: newId,
      isSystem: false,
      usersCount: 0
    };

    setRoles(prev => [...prev, newRole]);
    logSystemAction(
      currentUser.name,
      'Create New Role',
      `สร้างบทบาทใหม่ในระบบ: ${newRole.name} (${newRole.titleTh || ''})`
    );

    return newRole;
  }, [currentUser.name]);

  const deleteRole = useCallback((roleId: string): boolean => {
    const roleToDelete = roles.find(r => r.id === roleId);
    if (!roleToDelete) return false;

    // Security Safeguard: Cannot delete system roles or admin
    if (roleToDelete.isSystem || roleToDelete.isAdmin || roleToDelete.name.toLowerCase() === 'admin') {
      alert('ไม่สามารถลบบทบาทมาตรฐานของระบบ (System Role) หรือบทบาท Admin ได้เพื่อความปลอดภัย');
      return false;
    }

    setRoles(prev => prev.filter(r => r.id !== roleId));
    logSystemAction(
      currentUser.name,
      'Delete Role',
      `ลบบทบาท: ${roleToDelete.name}`
    );
    return true;
  }, [roles, currentUser.name]);

  const resetRolesToDefault = useCallback(() => {
    setRoles(DEFAULT_ROLES_CONFIG);
    logSystemAction(
      currentUser.name,
      'Reset Roles to Default',
      'คืนค่าโครงสร้างสิทธิ์ทุกตำแหน่งเป็นค่ามาตรฐานโรงงาน'
    );
  }, [currentUser.name]);

  return (
    <AuthContext.Provider value={{
      currentUser,
      activeRole,
      activeRoleConfig,
      roles,
      switchRole,
      availableRoles,
      isAuthenticated,
      login,
      loginWithGoogle,
      logout,
      hasPermission,
      canViewModule,
      isAdmin,
      canCreatePR,
      canEditPR,
      canDeletePR,
      canExportPR,
      canApprovePR,
      canApprovePO,
      canRejectApproval,
      canApprove,
      canCreatePO,
      canIssuePO,
      canCancelPO,
      canExportPO,
      canManageInventory,
      canReceiveGR,
      canScanQR,
      canAdjustStock,
      canManageVendors,
      canRateVendors,
      canViewReports,
      canExportReports,
      canManageUsers,
      canManageRoles,
      canViewAuditLogs,
      canManageSettings,
      updateRolePermissions,
      updateRole,
      addRole,
      deleteRole,
      resetRolesToDefault
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
