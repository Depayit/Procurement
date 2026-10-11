import React, { useState, useEffect } from 'react';
import { Users, Shield, Clock, Plus, Search, Edit, Trash2, CheckCircle2, XCircle, MoreVertical, RefreshCw } from 'lucide-react';
import { DetailsModal } from '../components/DetailsModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { fetchAuditLogs, AuditLogEntry, logSystemAction } from '../lib/auditLog';
import { useLanguage } from '../contexts/LanguageContext';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive';
  lastLogin?: string;
}

interface Role {
  id: string;
  name: string;
  usersCount: number;
  desc: string;
}

export function UsersPage() {
  const { t, isEnglish } = useLanguage();
  const [activeTab, setActiveTab] = useState('users');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock Users
  const [users, setUsers] = useState<User[]>([
    { id: '1', name: 'สมชาย ใจดี', email: 'somchai@company.com', role: 'Admin', status: 'Active', lastLogin: '2024-05-18 10:30' },
    { id: '2', name: 'วิภาวี สุขขี', email: 'wipawee@company.com', role: 'Purchasing Manager', status: 'Active', lastLogin: '2024-05-19 08:45' },
    { id: '3', name: 'สมศักดิ์ ขยันงาน', email: 'somsak@company.com', role: 'Purchasing Staff', status: 'Active', lastLogin: '2024-05-19 09:12' },
    { id: '4', name: 'นารี ร่ำรวย', email: 'naree@company.com', role: 'Approver', status: 'Inactive', lastLogin: '2024-05-10 16:20' },
    { id: '5', name: 'บุญมี สต๊อก', email: 'boonmee@company.com', role: 'Inventory Control', status: 'Active', lastLogin: '2024-05-19 07:30' },
  ]);

  // Mock Roles
  const [roles, setRoles] = useState<Role[]>([
    { id: 'r1', name: 'Admin', usersCount: 1, desc: 'เข้าถึงทุกระบบและจัดการสิทธิ์ผู้ใช้อื่นได้' },
    { id: 'r2', name: 'Purchasing Manager', usersCount: 1, desc: 'ดูรายงาน, สร้าง PO, อนุมัติ PR(เบื้องต้น)' },
    { id: 'r3', name: 'Purchasing Staff', usersCount: 3, desc: 'สร้าง PR, ดูรายการสินค้า' },
    { id: 'r4', name: 'Approver', usersCount: 2, desc: 'อนุมัติ PR และ PO ขั้นสุดท้าย' },
    { id: 'r5', name: 'Inventory Control', usersCount: 4, desc: 'จัดการคลังสินค้า รับ-เบิกสินค้า' },
  ]);

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

  // Users State
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userFormData, setUserFormData] = useState<Partial<User>>({});
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  // Roles State
  const [isRoleFormOpen, setIsRoleFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleFormData, setRoleFormData] = useState<Partial<Role>>({});
  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null);

  const openAddUser = () => {
    setEditingUser(null);
    setUserFormData({ name: '', email: '', role: roles[0]?.name || 'Admin', status: 'Active' });
    setIsUserFormOpen(true);
  };

  const openEditUser = (user: User) => {
    setEditingUser(user);
    setUserFormData({ ...user });
    setIsUserFormOpen(true);
  };

  const handleSaveUser = () => {
    if (!userFormData.name || !userFormData.email) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    
    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...userFormData } as User : u));
      logSystemAction('Current Admin', 'Update User', `แก้ไขข้อมูลผู้ใช้: ${userFormData.name}`);
    } else {
      setUsers([...users, { ...userFormData, id: Math.random().toString(36).substr(2, 9), lastLogin: '-' } as User]);
      logSystemAction('Current Admin', 'Create User', `เพิ่มลบผู้ใช้ใหม่: ${userFormData.name}`);
    }
    setIsUserFormOpen(false);
  };

  const handleDeleteUser = () => {
    if (deleteUserId) {
      const userToDelete = users.find(u => u.id === deleteUserId);
      setUsers(users.filter(u => u.id !== deleteUserId));
      setDeleteUserId(null);
      if (userToDelete) {
        logSystemAction('Current Admin', 'Delete User', `ลบผู้ใช้: ${userToDelete.name}`);
      }
    }
  };

  const openAddRole = () => {
    setEditingRole(null);
    setRoleFormData({ name: '', desc: '' });
    setIsRoleFormOpen(true);
  };

  const openEditRole = (role: Role) => {
    setEditingRole(role);
    setRoleFormData({ ...role });
    setIsRoleFormOpen(true);
  };

  const handleSaveRole = () => {
    if (!roleFormData.name) {
      alert('กรุณากรอกชื่อบทบาท');
      return;
    }
    if (editingRole) {
      setRoles(roles.map(r => r.id === editingRole.id ? { ...r, ...roleFormData } as Role : r));
      logSystemAction('Current Admin', 'Update Role', `แก้ไขบทบาท: ${roleFormData.name}`);
    } else {
      setRoles([...roles, { ...roleFormData, usersCount: 0, id: Math.random().toString(36).substr(2, 9) } as Role]);
      logSystemAction('Current Admin', 'Create Role', `เพิ่มบทบาท: ${roleFormData.name}`);
    }
    setIsRoleFormOpen(false);
  };

  const handleDeleteRole = () => {
    if (deleteRoleId) {
      const roleToDelete = roles.find(r => r.id === deleteRoleId);
      setRoles(roles.filter(r => r.id !== deleteRoleId));
      setDeleteRoleId(null);
      if (roleToDelete) {
        logSystemAction('Current Admin', 'Delete Role', `ลบบทบาท: ${roleToDelete.name}`);
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">{t('users.title')}</h1>
        <p className="text-sm text-slate-500 mt-1">{t('users.subtitle')}</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64 flex-shrink-0">
          <nav className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-1 overflow-x-auto pb-2 md:pb-0">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeTab === 'users' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Users className="h-4 w-4 mr-3" />
              {isEnglish ? 'All Users' : 'ผู้ใช้งานทั้งหมด'}
            </button>
            <button
              onClick={() => setActiveTab('roles')}
              className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeTab === 'roles' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Shield className="h-4 w-4 mr-3" />
              {isEnglish ? 'Roles & Permissions' : 'บทบาทและสิทธิ์ (Roles)'}
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeTab === 'audit' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Clock className="h-4 w-4 mr-3" />
              {isEnglish ? 'Audit Logs' : 'ประวัติการใช้งาน (Audit Logs)'}
            </button>
          </nav>
        </div>

        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px]">
          
          {activeTab === 'users' && (
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="ค้นหาชื่อ, อีเมล..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>
                <button 
                  onClick={openAddUser}
                  className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm ml-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  เพิ่มผู้ใช้งาน
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm text-left border-collapse min-w-[840px]">
                  <thead className="bg-slate-100/90 text-[11px] text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3.5 min-w-[260px]">ผู้ใช้งานในระบบ</th>
                      <th className="px-4 py-3.5 whitespace-nowrap w-[160px]">บทบาทและสิทธิ์ (Role)</th>
                      <th className="px-3 py-3.5 text-center whitespace-nowrap w-[120px]">สถานะ</th>
                      <th className="px-4 py-3.5 whitespace-nowrap w-[150px]">เข้าสู่ระบบล่าสุด</th>
                      <th className="px-4 py-3.5 text-right whitespace-nowrap w-[110px]">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs sm:text-sm bg-white">
                    {users.filter(u => u.name.includes(searchQuery) || u.email.includes(searchQuery)).map(user => (
                      <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3.5 align-top whitespace-nowrap">
                          <div className="flex items-start gap-3">
                            <div className="h-9 w-9 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs shadow-2xs mt-0.5 flex-shrink-0">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-sm leading-snug">{user.name}</div>
                              <div className="text-xs text-slate-500 mt-0.5">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 align-top whitespace-nowrap">
                          <span className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {user.role}
                          </span>
                        </td>
                        <td className="px-3 py-3.5 align-top text-center whitespace-nowrap">
                          {user.status === 'Active' ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 leading-none">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200 leading-none">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5"></span>
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 align-top text-slate-600 font-mono text-xs whitespace-nowrap">
                          <span className="text-slate-700">{user.lastLogin || '-'}</span>
                        </td>
                        <td className="px-4 py-3.5 align-top text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button 
                              onClick={() => openEditUser(user)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
                              title="แก้ไขข้อมูลผู้ใช้"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => setDeleteUserId(user.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                              title="ลบผู้ใช้งาน"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'roles' && (
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <h2 className="font-bold text-slate-800">บทบาทและสิทธิ์การใช้งาน</h2>
                <button 
                  onClick={openAddRole}
                  className="inline-flex items-center px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 shadow-sm transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  สร้างบทบาทใหม่
                </button>
              </div>
              <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                {roles.map(role => (
                  <div key={role.id} className="border border-slate-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-md transition-all bg-white relative group">
                    <div className="absolute top-4 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditRole(role)} className="p-1 text-slate-400 hover:text-indigo-600"><Edit className="h-4 w-4" /></button>
                      <button onClick={() => setDeleteRoleId(role.id)} className="p-1 text-slate-400 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                       <Shield className="h-5 w-5 text-indigo-600" />
                       <h3 className="text-lg font-bold text-slate-800">{role.name}</h3>
                    </div>
                    <p className="text-sm text-slate-500 mb-4 h-10">{role.desc}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 flex items-center"><Users className="h-4 w-4 mr-1"/> {role.usersCount} ผู้ใช้งาน</span>
                      <button className="text-indigo-600 font-semibold hover:underline text-xs">ดูสิทธิ์ทั้งหมด</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                 <h2 className="font-bold text-slate-800">ประวัติการใช้งานระบบ (Audit Logs)</h2>
                 <button 
                   onClick={loadLogs}
                   disabled={isLoadingLogs}
                   className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50"
                 >
                   <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingLogs ? 'animate-spin' : ''}`} />
                   รีเฟรช
                 </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-xs text-slate-500 font-bold uppercase tracking-wide border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3">วันเวลา</th>
                      <th className="px-6 py-3">ผู้ใช้งาน</th>
                      <th className="px-6 py-3">การกระทำ (Action)</th>
                      <th className="px-6 py-3">รายละเอียด</th>
                      <th className="px-6 py-3">IP Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isLoadingLogs ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-indigo-500" />
                          กำลังโหลดข้อมูล...
                        </td>
                      </tr>
                    ) : logs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                          ไม่มีข้อมูลประวัติการใช้งาน
                        </td>
                      </tr>
                    ) : logs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50 font-mono text-xs text-slate-600">
                        <td className="px-6 py-3">{log.time}</td>
                        <td className="px-6 py-3 font-sans font-semibold text-slate-800">{log.user}</td>
                        <td className="px-6 py-3">
                          <span className="px-2 py-1 bg-slate-100 border border-slate-200 rounded font-semibold text-slate-700">{log.action}</span>
                        </td>
                        <td className="px-6 py-3 font-sans">{log.detail}</td>
                        <td className="px-6 py-3 text-slate-400">{log.ip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* User Form Modal */}
      <DetailsModal
        isOpen={isUserFormOpen}
        onClose={() => setIsUserFormOpen(false)}
        title={editingUser ? 'แก้ไขผู้ใช้งาน' : 'เพิ่มผู้ใช้งานใหม่'}
        footer={
          <>
            <button 
              onClick={() => setIsUserFormOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              ยกเลิก
            </button>
            <button 
              onClick={handleSaveUser}
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm"
            >
              บันทึกข้อมูล
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">ชื่อ-นามสกุล <span className="text-rose-500">*</span></label>
            <input 
              type="text" 
              value={userFormData.name || ''}
              onChange={e => setUserFormData({...userFormData, name: e.target.value})}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">อีเมล <span className="text-rose-500">*</span></label>
            <input 
              type="email" 
              value={userFormData.email || ''}
              onChange={e => setUserFormData({...userFormData, email: e.target.value})}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">บทบาท (Role) <span className="text-rose-500">*</span></label>
            <select 
              value={userFormData.role || ''}
              onChange={e => setUserFormData({...userFormData, role: e.target.value})}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {roles.map(r => (
                <option key={r.id} value={r.name}>{r.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">สถานะ <span className="text-rose-500">*</span></label>
            <select 
              value={userFormData.status || 'Active'}
              onChange={e => setUserFormData({...userFormData, status: e.target.value as 'Active' | 'Inactive'})}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </DetailsModal>

      {/* Delete User Confirm */}
      <ConfirmDialog
        isOpen={!!deleteUserId}
        onClose={() => setDeleteUserId(null)}
        onConfirm={handleDeleteUser}
        title="ยืนยันการลบผู้ใช้งาน"
        message="คุณแน่ใจหรือไม่ที่จะลบผู้ใช้งานรายนี้? เมื่อลบแล้วจะไม่สามารถเข้าสู่ระบบได้อีก"
        confirmText="ลบผู้ใช้งาน"
        cancelText="ยกเลิก"
        isDestructive={true}
      />

      {/* Role Form Modal */}
      <DetailsModal
        isOpen={isRoleFormOpen}
        onClose={() => setIsRoleFormOpen(false)}
        title={editingRole ? 'แก้ไขบทบาท' : 'สร้างบทบาทใหม่'}
        footer={
          <>
            <button 
              onClick={() => setIsRoleFormOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              ยกเลิก
            </button>
            <button 
              onClick={handleSaveRole}
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm"
            >
              บันทึกข้อมูล
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">ชื่อบทบาท (Role Name) <span className="text-rose-500">*</span></label>
            <input 
              type="text" 
              value={roleFormData.name || ''}
              onChange={e => setRoleFormData({...roleFormData, name: e.target.value})}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">รายละเอียด (Description)</label>
            <textarea 
              rows={3}
              value={roleFormData.desc || ''}
              onChange={e => setRoleFormData({...roleFormData, desc: e.target.value})}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
        </div>
      </DetailsModal>

      {/* Delete Role Confirm */}
      <ConfirmDialog
        isOpen={!!deleteRoleId}
        onClose={() => setDeleteRoleId(null)}
        onConfirm={handleDeleteRole}
        title="ยืนยันการลบบทบาท"
        message="คุณแน่ใจหรือไม่ที่จะลบบทบาทนี้? ผู้ใช้งานที่อยู่ภายใต้บทบาทนี้อาจได้รับผลกระทบ"
        confirmText="ลบบทบาท"
        cancelText="ยกเลิก"
        isDestructive={true}
      />
    </div>
  );
}
