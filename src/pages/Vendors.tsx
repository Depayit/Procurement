import React, { useState, useMemo } from 'react';
import { Store, Plus, Search, Edit, Trash2, Eye, Star, TrendingUp, Phone, Mail, MapPin, Package } from 'lucide-react';
import { DetailsModal } from '../components/DetailsModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useLanguage } from '../contexts/LanguageContext';

interface Vendor {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  paymentTerms: string;
  rating: number; // out of 5
  onTimeDeliveryRate: number; // percentage
  categories: string[];
}

const MOCK_VENDORS: Vendor[] = [
  {
    id: 'v1',
    name: 'บริษัท วัสดุก่อสร้างไทย จำกัด',
    contactPerson: 'คุณสมชาย ใจดี',
    email: 'somchai@thaibuildmat.com',
    phone: '02-123-4567',
    address: '123 ถ.สุขุมวิท กรุงเทพฯ 10110',
    paymentTerms: 'Credit 30 Days',
    rating: 4.8,
    onTimeDeliveryRate: 95,
    categories: ['ปูนซีเมนต์', 'เหล็กเส้น']
  },
  {
    id: 'v2',
    name: 'โฮมสแควร์ เซ็นเตอร์',
    contactPerson: 'คุณสมหญิง มากมี',
    email: 'sales@homesquare.co.th',
    phone: '02-987-6543',
    address: '456 ถ.บางนา-ตราด สมุทรปราการ 10540',
    paymentTerms: 'Cash on Delivery',
    rating: 4.2,
    onTimeDeliveryRate: 88,
    categories: ['เครื่องมือช่าง', 'สี']
  },
  {
    id: 'v3',
    name: 'ดีดี อินเตอร์เทรดวัสดุ',
    contactPerson: 'คุณวิชัย รุ่งเรือง',
    email: 'contact@ddinter.com',
    phone: '081-234-5678',
    address: '789 ถ.พระราม 2 กรุงเทพฯ 10150',
    paymentTerms: 'Credit 15 Days',
    rating: 4.5,
    onTimeDeliveryRate: 92,
    categories: ['กระเบื้อง', 'สุขภัณฑ์']
  }
];

export function VendorsPage() {
  const { t, isEnglish } = useLanguage();
  const [vendors, setVendors] = useState<Vendor[]>(MOCK_VENDORS);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [viewVendor, setViewVendor] = useState<Vendor | null>(null);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  
  const [deleteVendorId, setDeleteVendorId] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState<Partial<Vendor>>({});

  const filteredVendors = useMemo(() => {
    return vendors.filter(v => 
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      v.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, vendors]);

  const openAddForm = () => {
    setEditingVendor(null);
    setFormData({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      paymentTerms: 'Credit 30 Days',
      rating: 5,
      onTimeDeliveryRate: 100,
      categories: []
    });
    setIsFormOpen(true);
  };

  const openEditForm = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setFormData({ ...vendor });
    setIsFormOpen(true);
  };

  const handleSaveVendor = () => {
    if (!formData.name || !formData.contactPerson) {
      alert('กรุณากรอกชื่อคู่ค้าและผู้ติดต่อให้ครบถ้วน');
      return;
    }

    if (editingVendor) {
      setVendors(vendors.map(v => v.id === editingVendor.id ? { ...v, ...formData } as Vendor : v));
    } else {
      const newVendor: Vendor = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
        rating: formData.rating || 5, // Default for new vendors
        onTimeDeliveryRate: formData.onTimeDeliveryRate || 100,
        categories: formData.categories || []
      } as Vendor;
      setVendors([...vendors, newVendor]);
    }
    setIsFormOpen(false);
  };

  const handleDelete = () => {
    if (deleteVendorId) {
      setVendors(vendors.filter(v => v.id !== deleteVendorId));
      setDeleteVendorId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">{t('vendors.title')}</h1>
          <p className="text-sm text-slate-500 mt-1">{t('vendors.subtitle')}</p>
        </div>
        <button 
          onClick={openAddForm}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('vendors.addBtn')}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อคู่ค้า, ผู้ติดต่อ..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            />
          </div>
        </div>

        {/* Mobile Vendor Cards List (Visible on < md) */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredVendors.length > 0 ? filteredVendors.map((vendor) => (
            <div key={vendor.id} className="p-4 space-y-3 bg-white hover:bg-slate-50/50 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="h-8 w-8 flex-shrink-0 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center shadow-2xs mt-0.5">
                    <Store className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 leading-snug break-words">{vendor.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{vendor.email}</p>
                  </div>
                </div>
                <div className="inline-flex items-center px-2 py-0.5 rounded-md text-amber-800 bg-amber-50 border border-amber-200 font-bold font-mono text-[10px] whitespace-nowrap">
                  <Star className="h-3 w-3 mr-0.5 fill-amber-500 text-amber-500" />
                  {vendor.rating.toFixed(1)}
                </div>
              </div>

              {/* Middle Grid: Contact & Performance */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50/80 p-2.5 rounded-lg border border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">ผู้ติดต่อ</span>
                  <span className="font-semibold text-slate-800 text-xs block truncate">{vendor.contactPerson}</span>
                  <span className="text-[11px] text-slate-500 font-mono block mt-0.5">{vendor.phone}</span>
                </div>
                <div className="border-l border-slate-200/80 pl-2.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">เงื่อนไข / ส่งมอบ</span>
                  <span className="font-medium text-slate-700 text-[11px] block truncate">{vendor.paymentTerms}</span>
                  <span className="text-[10px] text-emerald-700 font-bold block mt-0.5 whitespace-nowrap">
                    ส่งตรงเวลา {vendor.onTimeDeliveryRate}%
                  </span>
                </div>
              </div>

              {/* Actions Row */}
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                <button 
                  onClick={() => setViewVendor(vendor)}
                  className="flex-1 py-1.5 px-3 text-xs font-bold text-indigo-700 hover:text-white hover:bg-indigo-600 bg-indigo-50/80 border border-indigo-200 rounded-lg transition-colors shadow-2xs flex items-center justify-center gap-1"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>รายละเอียด</span>
                </button>
                <button 
                  onClick={() => openEditForm(vendor)}
                  className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                  title="แก้ไขข้อมูลคู่ค้า"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => setDeleteVendorId(vendor.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-slate-200"
                  title="ลบข้อมูลคู่ค้า"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          )) : (
            <div className="p-8 text-center text-slate-500 text-xs">
              <Store className="h-8 w-8 mx-auto text-slate-400 mb-2" />
              <p>ไม่พบข้อมูลคู่ค้าที่ค้นหา</p>
            </div>
          )}
        </div>

        {/* Desktop Table View (Visible on >= md) */}
        <div className="hidden md:block overflow-x-auto smooth-scroll">
          <table className="w-full text-xs sm:text-sm text-left border-collapse min-w-[960px]">
            <thead className="bg-slate-100/90 text-[11px] text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5 min-w-[260px]">ชื่อคู่ค้า / บริษัท</th>
                <th className="px-4 py-3.5 whitespace-nowrap w-[180px]">ผู้ติดต่อและเบอร์โทร</th>
                <th className="px-4 py-3.5 whitespace-nowrap w-[150px]">เงื่อนไขการชำระเงิน</th>
                <th className="px-3 py-3.5 text-center whitespace-nowrap w-[130px]">คะแนนประเมิน</th>
                <th className="px-3 py-3.5 text-center whitespace-nowrap w-[130px]">ส่งมอบตรงเวลา</th>
                <th className="px-4 py-3.5 text-right whitespace-nowrap w-[140px]">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm bg-white">
              {filteredVendors.length > 0 ? filteredVendors.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Vendor Details */}
                  <td className="px-4 py-3.5 align-top">
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 flex-shrink-0 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center shadow-2xs mt-0.5">
                        <Store className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm leading-snug break-words">{vendor.name}</div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs">
                          <span className="text-slate-500 font-normal">{vendor.email}</span>
                          {vendor.categories && vendor.categories.length > 0 && (
                            <span className="font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100 text-[10px] whitespace-nowrap">
                              {vendor.categories[0]}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Contact Person & Phone */}
                  <td className="px-4 py-3.5 align-top whitespace-nowrap">
                    <div className="text-slate-900 font-semibold text-sm leading-snug">{vendor.contactPerson}</div>
                    <div className="text-slate-500 font-mono text-xs flex items-center gap-1 mt-0.5">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      <span>{vendor.phone}</span>
                    </div>
                  </td>

                  {/* Payment Terms */}
                  <td className="px-4 py-3.5 align-top whitespace-nowrap">
                    <span className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/60">
                      {vendor.paymentTerms}
                    </span>
                  </td>

                  {/* Rating */}
                  <td className="px-3 py-3.5 align-top text-center whitespace-nowrap">
                    <div className="inline-flex items-center justify-center px-2.5 py-1 rounded-md text-amber-800 bg-amber-50 border border-amber-200 font-bold font-mono tabular-nums text-xs leading-none">
                      <Star className="h-3.5 w-3.5 mr-1 fill-amber-500 text-amber-500" />
                      {vendor.rating.toFixed(1)} / 5.0
                    </div>
                  </td>

                  {/* On-Time Rate */}
                  <td className="px-3 py-3.5 align-top text-center whitespace-nowrap">
                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md text-emerald-800 bg-emerald-50 border border-emerald-200 font-bold font-mono tabular-nums text-xs leading-none">
                      <TrendingUp className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                      {vendor.onTimeDeliveryRate}%
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5 align-top text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button 
                        onClick={() => setViewVendor(vendor)}
                        className="px-2.5 py-1.5 text-xs font-bold text-indigo-700 hover:text-white hover:bg-indigo-600 bg-indigo-50/70 border border-indigo-200 rounded-lg transition-colors shadow-2xs flex items-center gap-1"
                        title="ดูรายละเอียดคู่ค้า"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>รายละเอียด</span>
                      </button>
                      <button 
                        onClick={() => openEditForm(vendor)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
                        title="แก้ไขข้อมูลคู่ค้า"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => setDeleteVendorId(vendor.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                        title="ลบข้อมูลคู่ค้า"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <Store className="h-8 w-8 mx-auto text-slate-400 mb-3" />
                    <p>ไม่พบข้อมูลคู่ค้าที่ค้นหา</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DetailsModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingVendor ? 'แก้ไขข้อมูลคู่ค้า' : 'เพิ่มคู่ค้าใหม่'}
        footer={
          <>
            <button 
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              ยกเลิก
            </button>
            <button 
              onClick={handleSaveVendor}
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm"
            >
              บันทึกข้อมูล
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-bold text-slate-700">ชื่อบริษัท / ร้านค้า <span className="text-rose-500">*</span></label>
              <input 
                type="text" 
                value={formData.name || ''}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="ตัวอย่าง: บริษัท วัสดุก่อสร้างไทย จำกัด"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">ชื่อผู้ติดต่อ <span className="text-rose-500">*</span></label>
              <input 
                type="text" 
                value={formData.contactPerson || ''}
                onChange={e => setFormData({...formData, contactPerson: e.target.value})}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">เบอร์โทรศัพท์</label>
              <input 
                type="text" 
                value={formData.phone || ''}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-bold text-slate-700">อีเมล</label>
              <input 
                type="email" 
                value={formData.email || ''}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-bold text-slate-700">ที่อยู่</label>
              <textarea 
                rows={2}
                value={formData.address || ''}
                onChange={e => setFormData({...formData, address: e.target.value})}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
               <div className="flex items-center gap-2 mb-2">
                 <div className="h-px bg-slate-200 flex-1"></div>
                 <span className="text-xs font-bold text-slate-400 uppercase">ข้อมูลการค้า</span>
                 <div className="h-px bg-slate-200 flex-1"></div>
               </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">เงื่อนไขการชำระเงิน</label>
              <select
                value={formData.paymentTerms || 'Cash'}
                onChange={e => setFormData({...formData, paymentTerms: e.target.value})}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Cash">Cash (เงินสด)</option>
                <option value="Cash on Delivery">Cash on Delivery (COD)</option>
                <option value="Credit 15 Days">Credit 15 วัน</option>
                <option value="Credit 30 Days">Credit 30 วัน</option>
                <option value="Credit 45 Days">Credit 45 วัน</option>
                <option value="Credit 60 Days">Credit 60 วัน</option>
              </select>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">หมวดหมู่สินค้า (คั่นด้วยลูกน้ำ)</label>
              <input 
                type="text" 
                value={(formData.categories || []).join(', ')}
                onChange={e => setFormData({...formData, categories: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="เช่น ปูนซีเมนต์, สี, กระเบื้อง"
              />
            </div>

          </div>
        </div>
      </DetailsModal>

      <DetailsModal
        isOpen={!!viewVendor}
        onClose={() => setViewVendor(null)}
        title="รายละเอียดคู่ค้า"
        footer={
          <button 
            onClick={() => setViewVendor(null)}
            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            ปิด
          </button>
        }
      >
        {viewVendor && (
          <div className="space-y-6">
            <div className="flex items-start gap-4 pb-6 border-b border-slate-200">
              <div className="h-16 w-16 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Store className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-800">{viewVendor.name}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                    <Star className="h-3.5 w-3.5 mr-1 fill-emerald-600" />
                    Rating: {viewVendor.rating.toFixed(1)} / 5.0
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    <TrendingUp className="h-3.5 w-3.5 mr-1" />
                    On-time Delivery: {viewVendor.onTimeDeliveryRate}%
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-3">ข้อมูลติดต่อ</h3>
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex items-center text-sm">
                    <div className="w-8 flex justify-center text-slate-400">
                      <Store className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">ผู้ติดต่อ</div>
                      <div className="font-medium text-slate-800">{viewVendor.contactPerson}</div>
                    </div>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="w-8 flex justify-center text-slate-400">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">เบอร์โทรศัพท์</div>
                      <div className="font-medium text-slate-800">{viewVendor.phone || '-'}</div>
                    </div>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="w-8 flex justify-center text-slate-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">อีเมล</div>
                      <div className="font-medium text-slate-800">{viewVendor.email || '-'}</div>
                    </div>
                  </div>
                  <div className="flex items-start text-sm">
                    <div className="w-8 flex justify-center text-slate-400 mt-0.5">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">ที่อยู่</div>
                      <div className="font-medium text-slate-800 leading-snug">{viewVendor.address || '-'}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-3">ข้อมูลการค้า</h3>
                 <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <div className="text-xs text-slate-500 mb-1 flex items-center">
                      <Store className="h-3 w-3 mr-1" /> เงื่อนไขการชำระเงิน
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white text-slate-700 border border-slate-200">
                      {viewVendor.paymentTerms}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-2 mt-3 flex items-center">
                      <Package className="h-3 w-3 mr-1" /> หมวดหมู่สินค้าที่จัดจำหน่าย
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {viewVendor.categories && viewVendor.categories.length > 0 ? (
                        viewVendor.categories.map((cat, i) => (
                          <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-white text-slate-600 border border-slate-200">
                            {cat}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500">-</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        )}
      </DetailsModal>

      <ConfirmDialog
        isOpen={!!deleteVendorId}
        onClose={() => setDeleteVendorId(null)}
        onConfirm={handleDelete}
        title="ยืนยันการลบข้อมูลคู่ค้า"
        message="คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลคู่ค้านี้? เมื่อลบแล้วจะไม่สามารถกู้คืนได้"
        confirmText="ลบข้อมูล"
        cancelText="ยกเลิก"
        isDestructive={true}
      />
    </div>
  );
}
