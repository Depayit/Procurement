import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { UserProfile, PermissionKey, PermissionModule, RoleConfig } from '../types';
import { DEFAULT_ROLES_CONFIG, ALL_PERMISSION_KEYS } from '../lib/permissions';
import { logSystemAction } from '../lib/auditLog';

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

const STORAGE_USER_KEY = 'procuresync_active_user';
const STORAGE_ROLES_KEY = 'procuresync_roles_v2';

const PRESET_USERS: Record<string, UserProfile> = {
  'Site Engineer': {
    id: 'usr-se-1',
    name: 'สมชาย ช่างก่อสร้าง',
    email: 'somchai.eng@procuresync.local',
    role: 'Site Engineer',
    status: 'Active',
    department: 'โครงการ คอนโดสุขุมวิท 101',
    lastLogin: new Date().toISOString()
  },
  'Purchasing Staff': {
    id: 'usr-buy-1',
    name: 'สมปอง จัดซื้อ',
    email: 'sompong.buyer@procuresync.local',
    role: 'Purchasing Staff',
    status: 'Active',
    department: 'ฝ่ายจัดซื้อและสัญญา (ส่วนกลาง)',
    lastLogin: new Date().toISOString()
  },
  'Purchasing Manager': {
    id: 'usr-pm-1',
    name: 'วิภาวี สุขขี',
    email: 'wipawee.pm@procuresync.local',
    role: 'Purchasing Manager',
    status: 'Active',
    department: 'ฝ่ายบริหารงานจัดซื้อ',
    lastLogin: new Date().toISOString()
  },
  'Approver': {
    id: 'usr-appr-1',
    name: 'นายธีรภัทร บริหารงาน',
    email: 'teerapat.dir@procuresync.local',
    role: 'Approver',
    status: 'Active',
    department: 'คณะกรรมการบริหารและอนุมัติโครงการ',
    lastLogin: new Date().toISOString()
  },
  'Inventory Control': {
    id: 'usr-inv-1',
    name: 'บุญมี สต๊อก',
    email: 'boonmee.wh@procuresync.local',
    role: 'Inventory Control',
    status: 'Active',
    department: 'คลังพัสดุและจัดเก็บกลาง',
    lastLogin: new Date().toISOString()
  },
  'Admin': {
    id: 'usr-adm-1',
    name: 'ผู้ดูแลระบบสูงสุด',
    email: 'admin@procuresync.local',
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
