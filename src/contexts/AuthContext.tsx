import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile } from '../types';

export type UserRole = 
  | 'Site Engineer' 
  | 'Purchasing Staff' 
  | 'Purchasing Manager' 
  | 'Approver' 
  | 'Inventory Control' 
  | 'Admin';

export interface AuthContextType {
  currentUser: UserProfile;
  activeRole: UserRole;
  switchRole: (role: UserRole) => void;
  availableRoles: { role: UserRole; titleTh: string; titleEn: string; descTh: string; descEn: string; avatarText: string }[];
  canApprove: boolean;
  canCreatePO: boolean;
  canManageInventory: boolean;
  canManageUsers: boolean;
}

const STORAGE_KEY = 'procuresync_active_user';

const PRESET_USERS: Record<UserRole, UserProfile> = {
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
    department: 'เทคโนโลยีสารสนเทศ (IT ERP)',
    lastLogin: new Date().toISOString()
  }
};

const ROLE_INFO = [
  { 
    role: 'Site Engineer' as UserRole, 
    titleTh: 'วิศวกรสนาม (Site Engineer)', 
    titleEn: 'Site Engineer',
    descTh: 'เปิดใบขอซื้อ (PR) ตรวจเช็กรายการและสเปกวัสดุหน้างาน',
    descEn: 'Create PRs, track site specs, and material needs',
    avatarText: 'SE' 
  },
  { 
    role: 'Purchasing Staff' as UserRole, 
    titleTh: 'เจ้าหน้าที่จัดซื้อ (Buyer)', 
    titleEn: 'Purchasing Staff',
    descTh: 'ออกใบสั่งซื้อ (PO) จาก PR ที่อนุมัติแล้ว และเทียบราคาผู้ขาย',
    descEn: 'Issue POs from approved PRs, evaluate vendor quotes',
    avatarText: 'PS' 
  },
  { 
    role: 'Approver' as UserRole, 
    titleTh: 'ผู้อนุมัติโครงการ (PM / Director)', 
    titleEn: 'Approver / PM',
    descTh: 'พิจารณาอนุมัติใบขอซื้อ (PR) และใบสั่งซื้อ (PO) ตามงบประมาณ',
    descEn: 'Review & approve PR/PO within budget thresholds',
    avatarText: 'AP' 
  },
  { 
    role: 'Inventory Control' as UserRole, 
    titleTh: 'ผู้ดูแลคลังพัสดุ (Store Keeper)', 
    titleEn: 'Inventory Control',
    descTh: 'บันทึกรับของ (GR), สแกน QR ตรวจรับ และจัดการสต็อกคงเหลือ',
    descEn: 'Goods receipt (GR), QR scanning, stock transactions',
    avatarText: 'IC' 
  },
  { 
    role: 'Admin' as UserRole, 
    titleTh: 'ผู้ดูแลระบบ (System Admin)', 
    titleEn: 'System Admin',
    descTh: 'เข้าถึงทุกโมดูล จัดการผู้ใช้ สิทธิ์ และ Audit Logs ทั้งหมด',
    descEn: 'Full system access, user management, and audit logs',
    avatarText: 'AD' 
  }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
    } catch {
      // ignore
    }
  }, [currentUser]);

  const switchRole = (role: UserRole) => {
    const newUser = PRESET_USERS[role] || PRESET_USERS['Admin'];
    setCurrentUser(newUser);
  };

  const activeRole = currentUser.role;

  const canApprove = ['Admin', 'Approver', 'Purchasing Manager'].includes(activeRole);
  const canCreatePO = ['Admin', 'Purchasing Staff', 'Purchasing Manager'].includes(activeRole);
  const canManageInventory = ['Admin', 'Inventory Control', 'Purchasing Staff'].includes(activeRole);
  const canManageUsers = ['Admin'].includes(activeRole);

  return (
    <AuthContext.Provider value={{
      currentUser,
      activeRole,
      switchRole,
      availableRoles: ROLE_INFO,
      canApprove,
      canCreatePO,
      canManageInventory,
      canManageUsers
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
