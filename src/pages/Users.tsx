import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Shield, 
  Clock, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  KeyRound,
  SlidersHorizontal,
  Table,
  LayoutGrid,
  Check,
  Minus,
  Lock,
  Unlock,
  Sparkles,
  ArrowRight,
  RotateCcw,
  AlertTriangle,
  UserCheck,
  ShieldAlert,
  ShieldCheck,
  FileCheck2,
  Printer
} from 'lucide-react';
import { DetailsModal } from '../components/DetailsModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { fetchAuditLogs, AuditLogEntry, logSystemAction } from '../lib/auditLog';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import type { PermissionKey, PermissionModule, RoleConfig } from '../types';
import { PERMISSIONS_LIST, getPermissionsByModule, MODULE_INFO, ALL_PERMISSION_KEYS } from '../lib/permissions';
import { cn } from '../lib/utils';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive';
  department?: string;
  lastLogin?: string;
}

const STORAGE_USERS_KEY = 'procuresync_users_list_v2';

const INITIAL_USERS: User[] = [
  { id: '1', name: 'สมชาย ใจดี (Admin)', email: 'admin@procuresync.local', role: 'Admin', status: 'Active', department: 'เทคโนโลยีสารสนเทศ (IT ERP)', lastLogin: 'วันนี้ 10:30' },
  { id: '2', name: 'วิภาวี สุขขี', email: 'wipawee.pm@procuresync.local', role: 'Purchasing Manager', status: 'Active', department: 'ฝ่ายบริหารงานจัดซื้อ', lastLogin: 'วันนี้ 08:45' },
  { id: '3', name: 'สมปอง จัดซื้อ', email: 'sompong.buyer@procuresync.local', role: 'Purchasing Staff', status: 'Active', department: 'ฝ่ายจัดซื้อและสัญญา (ส่วนกลาง)', lastLogin: 'วันนี้ 09:12' },
  { id: '4', name: 'นายธีรภัทร บริหารงาน', email: 'teerapat.dir@procuresync.local', role: 'Approver', status: 'Active', department: 'คณะกรรมการบริหารโครงการ', lastLogin: 'เมื่อวาน 16:20' },
  { id: '5', name: 'บุญมี สต๊อก', email: 'boonmee.wh@procuresync.local', role: 'Inventory Control', status: 'Active', department: 'คลังพัสดุและจัดเก็บกลาง', lastLogin: 'วันนี้ 07:30' },
  { id: '6', name: 'สมชาย ช่างก่อสร้าง', email: 'somchai.eng@procuresync.local', role: 'Site Engineer', status: 'Active', department: 'โครงการ คอนโดสุขุมวิท 101', lastLogin: 'วันนี้ 08:00' },
];

export function UsersPage() {
  const { t, isEnglish } = useLanguage();
  const { 
    currentUser, 
    activeRole, 
    activeRoleConfig,
    roles, 
    switchRole, 
    isAdmin,
    canManageRoles, 
    canManageUsers,
    canViewAuditLogs,
    updateRolePermissions, 
    updateRole, 
    addRole, 
    deleteRole, 
    resetRolesToDefault 
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'audit'>('users');
  const [roleViewMode, setRoleViewMode] = useState<'grid' | 'matrix'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Users State (Persisted)
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_USERS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_USERS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
    } catch {
      // ignore
    }
  }, [users]);

  // Audit Logs State
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  const loadLogs = async () => {
    setIsLoadingLogs(true);
    const fetchedLogs = await fetchAuditLogs();
    setLogs(fetchedLogs);
    setIsLoadingLogs(false);
  };

  useEffect(() => {
    if (activeTab === 'audit') {
      loadLogs();
    }
  }, [activeTab]);

  // User Form State
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userFormData, setUserFormData] = useState<Partial<User>>({});
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  // Role Form State (Create / Edit metadata)
  const [isRoleFormOpen, setIsRoleFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleConfig | null>(null);
  const [roleFormData, setRoleFormData] = useState<Partial<RoleConfig>>({});
  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null);

  // Permission Matrix Modal State
  const [permissionModalRole, setPermissionModalRole] = useState<RoleConfig | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<PermissionKey[]>([]);

  // Open Permission Matrix editor for a role
  const handleOpenPermissionMatrix = (role: RoleConfig) => {
    setPermissionModalRole(role);
    setSelectedPermissions([...role.permissions]);
  };

  const handleTogglePermission = (key: PermissionKey) => {
    if (permissionModalRole?.isAdmin || permissionModalRole?.name.toLowerCase() === 'admin') {
      alert(isEnglish 
        ? 'The System Admin role possesses unrevocable full permissions to ensure system governance.' 
        : 'บทบาท Admin มีสิทธิ์ครอบคลุมทุกโมดูล 100% เพื่อความปลอดภัยและการบริหารระบบ ไม่สามารถยกเลิกสิทธิ์หลักได้');
      return;
    }

    setSelectedPermissions(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleSelectAllPermissions = () => {
    setSelectedPermissions([...ALL_PERMISSION_KEYS]);
  };

  const handleClearAllPermissions = () => {
    if (permissionModalRole?.isAdmin || permissionModalRole?.name.toLowerCase() === 'admin') {
      alert(isEnglish ? 'Admin must retain permissions' : 'ไม่สามารถล้างสิทธิ์ของ Admin ได้');
      return;
    }
    // Keep at least dashboard:view for a baseline experience
    setSelectedPermissions(['dashboard:view']);
  };

  const handleSaveRolePermissions = () => {
    if (!permissionModalRole) return;
    updateRolePermissions(permissionModalRole.id, selectedPermissions);
    setPermissionModalRole(null);
  };

  // Grouped Permissions by Module
  const permissionsByModule = useMemo(() => getPermissionsByModule(), []);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchSearch = 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.department && user.department.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchRole = roleFilter === 'all' || user.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [users, searchQuery, roleFilter]);

  // User Actions
  const openAddUser = () => {
    setEditingUser(null);
    setUserFormData({ 
      name: '', 
      email: '', 
      role: roles[0]?.name || 'Admin', 
      department: 'ฝ่ายจัดซื้อและสัญญา', 
      status: 'Active' 
    });
    setIsUserFormOpen(true);
  };

  const openEditUser = (user: User) => {
    setEditingUser(user);
    setUserFormData({ ...user });
    setIsUserFormOpen(true);
  };

  const handleSaveUser = () => {
    if (!userFormData.name || !userFormData.email) {
      alert(isEnglish ? 'Please fill in all required fields' : 'กรุณากรอกชื่อและอีเมลให้ครบถ้วน');
      return;
    }
    
    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...userFormData } as User : u));
      logSystemAction(currentUser.name, 'Update User', `แก้ไขข้อมูลผู้ใช้: ${userFormData.name} (บทบาท: ${userFormData.role})`);
    } else {
      const newUser: User = {
        ...userFormData,
        id: Math.random().toString(36).substr(2, 9),
        lastLogin: '-'
      } as User;
      setUsers([...users, newUser]);
      logSystemAction(currentUser.name, 'Create User', `เพิ่มผู้ใช้งานใหม่: ${userFormData.name} (บทบาท: ${userFormData.role})`);
    }
    setIsUserFormOpen(false);
  };

  const handleDeleteUser = () => {
    if (deleteUserId) {
      const userToDelete = users.find(u => u.id === deleteUserId);
      setUsers(users.filter(u => u.id !== deleteUserId));
      setDeleteUserId(null);
      if (userToDelete) {
        logSystemAction(currentUser.name, 'Delete User', `ลบผู้ใช้งาน: ${userToDelete.name}`);
      }
    }
  };

  // Role metadata actions
  const openAddRole = () => {
    setEditingRole(null);
    setRoleFormData({
      name: '',
      titleTh: '',
      titleEn: '',
      descTh: '',
      descEn: '',
      avatarText: 'CR',
      color: 'bg-indigo-600 text-white',
      permissions: ['dashboard:view', 'pr:view']
    });
    setIsRoleFormOpen(true);
  };

  const openEditRole = (role: RoleConfig) => {
    setEditingRole(role);
    setRoleFormData({ ...role });
    setIsRoleFormOpen(true);
  };

  const handleSaveRole = () => {
    if (!roleFormData.name || !roleFormData.titleTh) {
      alert(isEnglish ? 'Please enter role name and title' : 'กรุณากรอกชื่อรหัสบทบาทและชื่อตำแหน่งภาษาไทย');
      return;
    }

    if (editingRole) {
      updateRole(editingRole.id, roleFormData);
    } else {
      addRole({
        name: roleFormData.name,
        titleTh: roleFormData.titleTh,
        titleEn: roleFormData.titleEn || roleFormData.name,
        descTh: roleFormData.descTh || 'บทบาทที่กำหนดขึ้นใหม่',
        descEn: roleFormData.descEn || 'Custom Role',
        avatarText: (roleFormData.avatarText || roleFormData.name.slice(0, 2)).toUpperCase(),
        color: roleFormData.color || 'bg-indigo-600 text-white',
        isSystem: false,
        permissions: roleFormData.permissions || ['dashboard:view', 'pr:view']
      });
    }
    setIsRoleFormOpen(false);
  };

  const handleConfirmDeleteRole = () => {
    if (deleteRoleId) {
      deleteRole(deleteRoleId);
      setDeleteRoleId(null);
    }
  };

  // Helper counts
  const totalPermissionsCount = ALL_PERMISSION_KEYS.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t('users.title')}</h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              RBAC Enterprise
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {isEnglish 
              ? 'Role-Based Access Control, Granular Permission Matrix, and User Management' 
              : 'กำหนดบทบาทแต่ละตำแหน่ง การมอบหมายสิทธิ์ของแอดมิน และควบคุมความปลอดภัยทั้งระบบ'}
          </p>
        </div>

        {/* Current Active Persona Badge */}
        <div className="flex items-center gap-3 bg-white border border-slate-200/80 shadow-xs px-3.5 py-2 rounded-xl">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
            {activeRoleConfig.avatarText || 'US'}
          </div>
          <div className="text-xs">
            <p className="text-slate-400 font-medium leading-none">{isEnglish ? 'Current Persona' : 'บทบาทปัจจุบันที่คุณใช้งาน'}</p>
            <p className="font-bold text-slate-800 leading-tight mt-0.5 flex items-center gap-1.5">
              {activeRoleConfig.titleTh || activeRole}
              {isAdmin && (
                <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold text-[10px]">Superuser</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 px-4 sm:px-6 pt-3 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('users')}
            className={cn(
              "flex items-center px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap cursor-pointer",
              activeTab === 'users'
                ? "bg-white text-indigo-600 border-indigo-600 shadow-xs -mb-[1px]"
                : "text-slate-500 border-transparent hover:text-slate-800 hover:bg-white/50"
            )}
          >
            <Users className="h-4 w-4 mr-2" />
            {isEnglish ? 'User Directory' : 'รายชื่อผู้ใช้งาน (Users)'}
            <span className="ml-2 px-1.5 py-0.5 rounded-full text-[11px] bg-slate-100 text-slate-600 font-bold">
              {users.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('roles')}
            className={cn(
              "flex items-center px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap cursor-pointer",
              activeTab === 'roles'
                ? "bg-white text-indigo-600 border-indigo-600 shadow-xs -mb-[1px]"
                : "text-slate-500 border-transparent hover:text-slate-800 hover:bg-white/50"
            )}
          >
            <Shield className="h-4 w-4 mr-2" />
            {isEnglish ? 'Roles & Permissions (Matrix)' : 'บทบาทและสิทธิ์แต่ละตำแหน่ง (Roles & Matrix)'}
            <span className="ml-2 px-1.5 py-0.5 rounded-full text-[11px] bg-indigo-100 text-indigo-700 font-bold">
              {roles.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={cn(
              "flex items-center px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap cursor-pointer",
              activeTab === 'audit'
                ? "bg-white text-indigo-600 border-indigo-600 shadow-xs -mb-[1px]"
                : "text-slate-500 border-transparent hover:text-slate-800 hover:bg-white/50"
            )}
          >
            <Clock className="h-4 w-4 mr-2" />
            {isEnglish ? 'Audit Trail Logs' : 'ประวัติความปลอดภัย (Audit Logs)'}
          </button>
        </div>

        {/* TAB 1: USERS DIRECTORY */}
        {activeTab === 'users' && (
          <div className="p-4 sm:p-6 space-y-4">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-1 items-center gap-2 max-w-md">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder={isEnglish ? "Search by name, email, department..." : "ค้นหาชื่อผู้ใช้, อีเมล, แผนก..."}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>
                <select
                  value={roleFilter}
                  onChange={e => setRoleFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 font-medium"
                >
                  <option value="all">{isEnglish ? 'All Roles' : 'ทุกบทบาท'}</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.name}>{r.titleTh || r.name}</option>
                  ))}
                </select>
              </div>

              {canManageUsers && (
                <button
                  onClick={openAddUser}
                  className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-indigo-700 shadow-xs transition-colors cursor-pointer shrink-0"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  {isEnglish ? 'Add New User' : 'เพิ่มผู้ใช้งานใหม่'}
                </button>
              )}
            </div>

            {/* Users Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">ผู้ใช้งาน / อีเมล</th>
                      <th className="px-5 py-3.5">แผนก / สังกัด</th>
                      <th className="px-5 py-3.5">บทบาทและสิทธิ์ (Role)</th>
                      <th className="px-5 py-3.5">สถานะ</th>
                      <th className="px-5 py-3.5 text-right">การกระทำ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-10 text-center text-slate-400">
                          {isEnglish ? 'No users matching your criteria' : 'ไม่พบข้อมูลผู้ใช้งานที่ตรงกับการค้นหา'}
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map(user => {
                        const userRoleConfig = roles.find(r => r.name === user.role);
                        return (
                          <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs border border-slate-200 shrink-0">
                                  {user.name.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-bold text-slate-800 text-sm">{user.name}</div>
                                  <div className="text-xs text-slate-400">{user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-xs text-slate-600 font-medium">
                              {user.department || 'สำนักงานใหญ่'}
                            </td>
                            <td className="px-5 py-3.5">
                              <span className={cn(
                                "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border",
                                user.role === 'Admin' 
                                  ? "bg-indigo-50 text-indigo-700 border-indigo-200" 
                                  : "bg-slate-50 text-slate-700 border-slate-200"
                              )}>
                                <Shield className="w-3 h-3 text-indigo-500" />
                                {userRoleConfig?.titleTh || user.role}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className={cn(
                                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold",
                                user.status === 'Active' 
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                                  : "bg-rose-50 text-rose-700 border border-rose-200"
                              )}>
                                <span className={cn("w-1.5 h-1.5 rounded-full", user.status === 'Active' ? "bg-emerald-500" : "bg-rose-500")} />
                                {user.status}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1">
                                {canManageUsers && (
                                  <>
                                    <button
                                      onClick={() => openEditUser(user)}
                                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                                      title="แก้ไขข้อมูลผู้ใช้"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => setDeleteUserId(user.id)}
                                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                      title="ลบผู้ใช้งาน"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ROLES & PERMISSIONS MATRIX */}
        {activeTab === 'roles' && (
          <div className="p-4 sm:p-6 space-y-6">
            {/* Top KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">บทบาททั้งหมด</span>
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Shield className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-800 mt-2">{roles.length}</div>
                <div className="text-xs text-slate-400 mt-0.5">ตำแหน่งตามโครงสร้างองค์กร</div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">สิทธิ์ย่อยในระบบ</span>
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                    <KeyRound className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-800 mt-2">{totalPermissionsCount}</div>
                <div className="text-xs text-slate-400 mt-0.5">สิทธิ์ละเอียด 9 โมดูลงาน</div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">บทบาทแอดมิน</span>
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-indigo-700 mt-2">Superuser</div>
                <div className="text-xs text-slate-400 mt-0.5">เข้าถึงทุกส่วน 100% มีสิทธิ์แก้ไข</div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">ความปลอดภัย</span>
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                    <Lock className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-800 mt-2">Protected</div>
                <div className="text-xs text-slate-400 mt-0.5">กลไกป้องกัน Admin ถูกลบ/ปิดสิทธิ์</div>
              </div>
            </div>

            {/* Admin Tool Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 w-fit">
                <button
                  onClick={() => setRoleViewMode('grid')}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                    roleViewMode === 'grid' 
                      ? "bg-indigo-600 text-white shadow-xs" 
                      : "text-slate-600 hover:bg-slate-100"
                  )}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  การ์ดบทบาท (Cards)
                </button>
                <button
                  onClick={() => setRoleViewMode('matrix')}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                    roleViewMode === 'matrix' 
                      ? "bg-indigo-600 text-white shadow-xs" 
                      : "text-slate-600 hover:bg-slate-100"
                  )}
                >
                  <Table className="w-3.5 h-3.5" />
                  ตารางเปรียบเทียบสิทธิ์ (Matrix)
                </button>
              </div>

              <div className="flex items-center gap-2">
                {canManageRoles && (
                  <>
                    <button
                      onClick={resetRolesToDefault}
                      className="inline-flex items-center px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
                      title="คืนค่าสิทธิ์ทุกตำแหน่งเป็นค่ามาตรฐานโรงงาน"
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1 text-slate-500" />
                      คืนค่ามาตรฐาน
                    </button>
                    <button
                      onClick={openAddRole}
                      className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 shadow-xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4 mr-1.5" />
                      สร้างบทบาทใหม่
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* VIEW 1: ROLE CARDS GRID */}
            {roleViewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {roles.map(role => {
                  const permCount = role.isAdmin ? totalPermissionsCount : role.permissions.length;
                  const permPercentage = Math.round((permCount / totalPermissionsCount) * 100);
                  const isCurrentActive = activeRole === role.name;

                  return (
                    <div 
                      key={role.id}
                      className={cn(
                        "bg-white rounded-2xl border p-5 transition-all relative flex flex-col justify-between group",
                        isCurrentActive ? "border-indigo-500 ring-2 ring-indigo-500/20 shadow-md" : "border-slate-200 hover:border-indigo-300 hover:shadow-md"
                      )}
                    >
                      {/* Top Header */}
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs", role.color || "bg-indigo-600 text-white")}>
                              {role.avatarText || 'RO'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-slate-900 text-base leading-tight">{role.name}</h3>
                                {role.isAdmin && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-purple-100 text-purple-700 border border-purple-200">
                                    Admin
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-indigo-600 font-semibold mt-0.5">{role.titleTh}</p>
                            </div>
                          </div>

                          {/* Quick Menu */}
                          {canManageRoles && (
                            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => openEditRole(role)}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                                title="แก้ไขชื่อ/รายละเอียดบทบาท"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              {!role.isSystem && (
                                <button
                                  onClick={() => setDeleteRoleId(role.id)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title="ลบบทบาทนี้"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-500 line-clamp-2 min-h-[32px] mb-4">
                          {role.descTh}
                        </p>

                        {/* Permission Coverage Meter */}
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2 mb-4">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-700 flex items-center gap-1.5">
                              <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
                              ขอบเขตสิทธิ์การใช้งาน
                            </span>
                            <span className="font-bold text-indigo-600">
                              {permCount} / {totalPermissionsCount} ({permPercentage}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={cn("h-full rounded-full transition-all duration-500", role.isAdmin ? "bg-purple-600" : "bg-indigo-600")}
                              style={{ width: `${permPercentage}%` }}
                            />
                          </div>
                        </div>

                        {/* Module Access Chips */}
                        <div className="flex flex-wrap gap-1 mb-4">
                          {(['pr', 'approvals', 'po', 'inventory', 'vendors', 'reports', 'users', 'settings'] as PermissionModule[]).map(mod => {
                            const hasModAccess = role.isAdmin || role.permissions.some(p => p.startsWith(`${mod}:`));
                            return (
                              <span
                                key={mod}
                                className={cn(
                                  "px-2 py-0.5 rounded text-[10px] font-semibold border",
                                  hasModAccess
                                    ? "bg-slate-100 text-slate-700 border-slate-200 font-bold"
                                    : "bg-slate-50 text-slate-300 border-slate-100 line-through"
                                )}
                              >
                                {MODULE_INFO[mod].labelTh.split(' ')[0]}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                        <button
                          onClick={() => handleOpenPermissionMatrix(role)}
                          className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5" />
                          {isEnglish ? 'Configure Permissions' : 'กำหนดสิทธิ์บทบาทนี้'}
                        </button>

                        <button
                          onClick={() => switchRole(role.name)}
                          className={cn(
                            "px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border",
                            isCurrentActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-black cursor-default"
                              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                          )}
                          title="สลับเป็นบทบาทนี้เพื่อทดลองใช้งานจริง"
                        >
                          {isCurrentActive ? (
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              ใช้งานอยู่
                            </span>
                          ) : (
                            'สลับใช้'
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* VIEW 2: FULL PERMISSION MATRIX COMPARISON TABLE */}
            {roleViewMode === 'matrix' && (
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">ตารางเปรียบเทียบสิทธิ์ทุกบทบาทในองค์กร (Enterprise Permission Matrix)</h3>
                    <p className="text-xs text-slate-500 mt-0.5">แสดงภาพรวมการเข้าถึงของทุกตำแหน่งในระดับ Granular Permissions</p>
                  </div>
                  <button 
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 print-hidden cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    พิมพ์ตารางสิทธิ์
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-bold">
                        <th className="px-4 py-3 min-w-[260px] sticky left-0 bg-slate-100 z-10">โมดูลและสิทธิ์การทำงาน</th>
                        {roles.map(role => (
                          <th key={role.id} className="px-3 py-3 text-center min-w-[120px]">
                            <div className="font-bold text-slate-800">{role.name}</div>
                            <div className="text-[10px] text-slate-500 font-normal">{role.titleTh}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(Object.keys(permissionsByModule) as PermissionModule[]).map(mod => {
                        const modulePerms = permissionsByModule[mod];
                        return (
                          <React.Fragment key={mod}>
                            {/* Module Header Divider */}
                            <tr className="bg-slate-50/90 font-bold text-indigo-900 border-y border-slate-200">
                              <td colSpan={roles.length + 1} className="px-4 py-2 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block" />
                                {MODULE_INFO[mod].labelTh} ({MODULE_INFO[mod].labelEn})
                              </td>
                            </tr>

                            {/* Module Permissions Rows */}
                            {modulePerms.map(perm => (
                              <tr key={perm.key} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-4 py-2.5 font-medium text-slate-700 sticky left-0 bg-white">
                                  <div className="font-semibold text-slate-800">{perm.labelTh}</div>
                                  <div className="text-[10px] text-slate-400 font-mono">{perm.key}</div>
                                </td>
                                {roles.map(role => {
                                  const hasPerm = role.isAdmin || role.permissions.includes(perm.key);
                                  return (
                                    <td key={role.id} className="px-3 py-2.5 text-center">
                                      {hasPerm ? (
                                        <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 mx-auto">
                                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                                        </div>
                                      ) : (
                                        <div className="inline-flex items-center justify-center w-6 h-6 text-slate-300 mx-auto">
                                          <Minus className="w-3.5 h-3.5" />
                                        </div>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: AUDIT TRAIL LOGS */}
        {activeTab === 'audit' && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">ประวัติความปลอดภัยและการกระทำในระบบ (Audit Trail)</h3>
                <p className="text-xs text-slate-500 mt-0.5">เก็บบันทึกการกำหนดสิทธิ์ การสลับบทบาท และกิจกรรมของผู้ดูแลระบบอย่างละเอียด</p>
              </div>
              <button
                onClick={loadLogs}
                disabled={isLoadingLogs}
                className="inline-flex items-center px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs cursor-pointer transition-colors"
              >
                <RefreshCw className={cn("w-3.5 h-3.5 mr-1.5", isLoadingLogs && "animate-spin text-indigo-600")} />
                รีเฟรชประวัติ
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3">วันเวลา</th>
                      <th className="px-5 py-3">ผู้กระทำ (User)</th>
                      <th className="px-5 py-3">การกระทำ (Action)</th>
                      <th className="px-5 py-3">รายละเอียดกิจกรรม</th>
                      <th className="px-5 py-3 text-right">IP Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isLoadingLogs ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                          กำลังดึงข้อมูลประวัติกิจกรรม...
                        </td>
                      </tr>
                    ) : logs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                          ยังไม่มีบันทึกประวัติการกระทำในขณะนี้
                        </td>
                      </tr>
                    ) : (
                      logs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-50 font-mono">
                          <td className="px-5 py-3 text-slate-500">{log.time}</td>
                          <td className="px-5 py-3 font-sans font-bold text-slate-800">{log.user}</td>
                          <td className="px-5 py-3 font-sans">
                            <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-200 rounded text-indigo-700 font-bold">
                              {log.action}
                            </span>
                          </td>
                          <td className="px-5 py-3 font-sans text-slate-600">{log.detail}</td>
                          <td className="px-5 py-3 text-right text-slate-400">{log.ip}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: PERMISSION MATRIX EDITOR FOR A ROLE */}
      <DetailsModal
        isOpen={!!permissionModalRole}
        onClose={() => setPermissionModalRole(null)}
        title={permissionModalRole ? `กำหนดสิทธิ์บทบาท: ${permissionModalRole.titleTh} (${permissionModalRole.name})` : 'กำหนดสิทธิ์'}
        maxWidth="max-w-5xl"
        footer={
          <div className="flex items-center justify-between w-full">
            <div className="text-xs text-slate-500">
              สิทธิ์ที่เลือก: <strong className="text-indigo-600 font-black">{selectedPermissions.length}</strong> จาก {totalPermissionsCount} รายการ
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPermissionModalRole(null)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveRolePermissions}
                className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-sm cursor-pointer"
              >
                บันทึกการกำหนดสิทธิ์
              </button>
            </div>
          </div>
        }
      >
        {permissionModalRole && (
          <div className="space-y-6">
            {/* Role Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-50/80 to-purple-50/80 border border-indigo-100">
              <div className="flex items-center gap-3">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center font-black text-base shadow-xs", permissionModalRole.color || "bg-indigo-600 text-white")}>
                  {permissionModalRole.avatarText || 'RO'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-lg leading-tight">{permissionModalRole.titleTh}</h3>
                    <span className="text-xs text-slate-500 font-mono">({permissionModalRole.name})</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{permissionModalRole.descTh}</p>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleSelectAllPermissions}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-indigo-600 hover:bg-indigo-50 shadow-xs cursor-pointer"
                >
                  เลือกทั้งหมด
                </button>
                <button
                  type="button"
                  onClick={handleClearAllPermissions}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 shadow-xs cursor-pointer"
                >
                  ล้างสิทธิ์
                </button>
              </div>
            </div>

            {/* Admin Superuser Alert Banner */}
            {(permissionModalRole.isAdmin || permissionModalRole.name.toLowerCase() === 'admin') && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                <div className="text-xs text-purple-900">
                  <p className="font-bold text-sm">บทบาทผู้ดูแลระบบสูงสุด (System Superuser)</p>
                  <p className="mt-0.5 text-purple-700">
                    แอดมินได้รับสิทธิ์เข้าถึงและควบคุมทุกโมดูลในระบบ 100% เสมอตามหลักความปลอดภัยสูงสุดเพื่อป้องกันระบบถูกล็อกเอาท์โดยไม่ได้ตั้งใจ
                  </p>
                </div>
              </div>
            )}

            {/* Module Checklist Sections */}
            <div className="space-y-6">
              {(Object.keys(permissionsByModule) as PermissionModule[]).map(mod => {
                const modulePerms = permissionsByModule[mod];
                const activeInModCount = modulePerms.filter(p => selectedPermissions.includes(p.key)).length;

                return (
                  <div key={mod} className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                    <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                        <h4 className="font-bold text-slate-800 text-sm">{MODULE_INFO[mod].labelTh}</h4>
                        <span className="text-xs text-slate-400">({MODULE_INFO[mod].labelEn})</span>
                      </div>
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                        {activeInModCount} / {modulePerms.length} สิทธิ์
                      </span>
                    </div>

                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {modulePerms.map(perm => {
                        const isChecked = selectedPermissions.includes(perm.key);
                        return (
                          <div
                            key={perm.key}
                            onClick={() => handleTogglePermission(perm.key)}
                            className={cn(
                              "flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none",
                              isChecked
                                ? "bg-indigo-50/40 border-indigo-300 ring-1 ring-indigo-200"
                                : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                            )}
                          >
                            <div className={cn(
                              "w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                              isChecked 
                                ? "bg-indigo-600 border-indigo-600 text-white" 
                                : "bg-white border-slate-300"
                            )}>
                              {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className={cn("text-xs font-bold leading-tight", isChecked ? "text-indigo-900" : "text-slate-800")}>
                                {perm.labelTh}
                              </p>
                              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                                {perm.descTh}
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono mt-1">
                                {perm.key}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </DetailsModal>

      {/* MODAL 2: USER CREATE/EDIT MODAL */}
      <DetailsModal
        isOpen={isUserFormOpen}
        onClose={() => setIsUserFormOpen(false)}
        title={editingUser ? 'แก้ไขข้อมูลผู้ใช้งาน' : 'เพิ่มผู้ใช้งานใหม่'}
        footer={
          <>
            <button 
              onClick={() => setIsUserFormOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer"
            >
              ยกเลิก
            </button>
            <button 
              onClick={handleSaveUser}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm cursor-pointer"
            >
              บันทึกข้อมูลผู้ใช้
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">ชื่อ-นามสกุล <span className="text-rose-500">*</span></label>
            <input 
              type="text" 
              placeholder="เช่น สมชาย ช่างก่อสร้าง"
              value={userFormData.name || ''}
              onChange={e => setUserFormData({...userFormData, name: e.target.value})}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">อีเมลสำหรับเข้าสู่ระบบ <span className="text-rose-500">*</span></label>
            <input 
              type="email" 
              placeholder="user@company.com"
              value={userFormData.email || ''}
              onChange={e => setUserFormData({...userFormData, email: e.target.value})}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">แผนก / สังกัดโครงการ</label>
            <input 
              type="text" 
              placeholder="เช่น ฝ่ายจัดซื้อและสัญญา (ส่วนกลาง)"
              value={userFormData.department || ''}
              onChange={e => setUserFormData({...userFormData, department: e.target.value})}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">บทบาทและสิทธิ์ (Role Assignment) <span className="text-rose-500">*</span></label>
            <select 
              value={userFormData.role || ''}
              onChange={e => setUserFormData({...userFormData, role: e.target.value})}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {roles.map(r => (
                <option key={r.id} value={r.name}>{r.titleTh} ({r.name})</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">สถานะการใช้งาน <span className="text-rose-500">*</span></label>
            <select 
              value={userFormData.status || 'Active'}
              onChange={e => setUserFormData({...userFormData, status: e.target.value as 'Active' | 'Inactive'})}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="Active">Active (เปิดใช้งาน)</option>
              <option value="Inactive">Inactive (ระงับชั่วคราว)</option>
            </select>
          </div>
        </div>
      </DetailsModal>

      {/* MODAL 3: ROLE METADATA CREATE/EDIT MODAL */}
      <DetailsModal
        isOpen={isRoleFormOpen}
        onClose={() => setIsRoleFormOpen(false)}
        title={editingRole ? 'แก้ไขข้อมูลบทบาท' : 'สร้างบทบาทใหม่ในระบบ'}
        footer={
          <>
            <button 
              onClick={() => setIsRoleFormOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer"
            >
              ยกเลิก
            </button>
            <button 
              onClick={handleSaveRole}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm cursor-pointer"
            >
              บันทึกข้อมูลบทบาท
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">รหัสบทบาทภาษาอังกฤษ (Role Key) <span className="text-rose-500">*</span></label>
            <input 
              type="text" 
              placeholder="เช่น Quality Assurance หรือ Auditor"
              value={roleFormData.name || ''}
              onChange={e => setRoleFormData({...roleFormData, name: e.target.value})}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">ชื่อตำแหน่งภาษาไทย (Title TH) <span className="text-rose-500">*</span></label>
            <input 
              type="text" 
              placeholder="เช่น ผู้ตรวจสอบคุณภาพงาน หรือ ผู้ตรวจสอบบัญชี"
              value={roleFormData.titleTh || ''}
              onChange={e => setRoleFormData({...roleFormData, titleTh: e.target.value})}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">คำย่อ Avatar (2 ตัวอักษร)</label>
            <input 
              type="text" 
              maxLength={2}
              placeholder="QA"
              value={roleFormData.avatarText || ''}
              onChange={e => setRoleFormData({...roleFormData, avatarText: e.target.value.toUpperCase()})}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">คำอธิบายหน้าที่และความรับผิดชอบ</label>
            <textarea 
              rows={3}
              placeholder="อธิบายลักษณะงานและสิทธิ์ที่เกี่ยวข้องของบทบาทนี้"
              value={roleFormData.descTh || ''}
              onChange={e => setRoleFormData({...roleFormData, descTh: e.target.value})}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
        </div>
      </DetailsModal>

      {/* Delete User Confirm */}
      <ConfirmDialog
        isOpen={!!deleteUserId}
        onClose={() => setDeleteUserId(null)}
        onConfirm={handleDeleteUser}
        title="ยืนยันการลบผู้ใช้งาน"
        message="คุณแน่ใจหรือไม่ที่จะลบผู้ใช้งานรายนี้? เมื่อลบแล้วจะไม่สามารถเข้าสู่ระบบหรือจัดการเอกสารได้อีก"
        confirmText="ลบผู้ใช้งาน"
        cancelText="ยกเลิก"
        isDestructive={true}
      />

      {/* Delete Role Confirm */}
      <ConfirmDialog
        isOpen={!!deleteRoleId}
        onClose={() => setDeleteRoleId(null)}
        onConfirm={handleConfirmDeleteRole}
        title="ยืนยันการลบบทบาท"
        message="คุณแน่ใจหรือไม่ที่จะลบบทบาทนี้? ผู้ใช้งานที่สังกัดบทบาทนี้จะต้องได้รับการเปลี่ยนบทบาทใหม่"
        confirmText="ลบบทบาท"
        cancelText="ยกเลิก"
        isDestructive={true}
      />
    </div>
  );
}
