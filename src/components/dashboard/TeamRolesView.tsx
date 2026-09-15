import React, { useState } from 'react';
import {
  Users,
  Shield,
  UserPlus,
  Check,
  X,
  Trash2,
  Lock,
  Unlock,
  ShieldCheck,
  Mail,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { StaffUser, StaffRole, StaffPermissions } from '../../types';

export const TeamRolesView: React.FC = () => {
  const {
    locale,
    staffUsers,
    addStaffUser,
    updateStaffUser,
    deleteStaffUser,
    activeStaffRole,
    setActiveStaffRole
  } = useStore();

  const isAr = locale === 'ar';

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [userForm, setUserForm] = useState<{
    name: string;
    email: string;
    role: StaffRole;
    permissions: StaffPermissions;
  }>({
    name: '',
    email: '',
    role: 'order_support',
    permissions: {
      canManageProducts: false,
      canManageOrders: true,
      canManageSettings: false,
      canViewAnalytics: false,
      canManageContent: false,
      canManageUsers: false
    }
  });

  const roleLabels: Record<StaffRole, { ar: string; en: string; badge: string }> = {
    super_admin: {
      ar: 'مدير عام (كامل الصلاحيات)',
      en: 'Super Admin (Full Access)',
      badge: 'bg-purple-100 text-purple-800 border-purple-200'
    },
    store_manager: {
      ar: 'مدير مبيعات وشحن',
      en: 'Store Manager',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    },
    order_support: {
      ar: 'خدمة عملاء وطلبات',
      en: 'Order Support Specialist',
      badge: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    content_editor: {
      ar: 'محرر محتوى وبانرات',
      en: 'Content & Banner Editor',
      badge: 'bg-amber-100 text-amber-800 border-amber-200'
    }
  };

  const handleRoleChangeInForm = (role: StaffRole) => {
    let perms: StaffPermissions = {
      canManageProducts: false,
      canManageOrders: false,
      canManageSettings: false,
      canViewAnalytics: false,
      canManageContent: false,
      canManageUsers: false
    };

    if (role === 'super_admin') {
      perms = {
        canManageProducts: true,
        canManageOrders: true,
        canManageSettings: true,
        canViewAnalytics: true,
        canManageContent: true,
        canManageUsers: true
      };
    } else if (role === 'store_manager') {
      perms = {
        canManageProducts: true,
        canManageOrders: true,
        canManageSettings: false,
        canViewAnalytics: true,
        canManageContent: false,
        canManageUsers: false
      };
    } else if (role === 'order_support') {
      perms = {
        canManageProducts: false,
        canManageOrders: true,
        canManageSettings: false,
        canViewAnalytics: false,
        canManageContent: false,
        canManageUsers: false
      };
    } else if (role === 'content_editor') {
      perms = {
        canManageProducts: false,
        canManageOrders: false,
        canManageSettings: false,
        canViewAnalytics: false,
        canManageContent: true,
        canManageUsers: false
      };
    }

    setUserForm((prev) => ({
      ...prev,
      role,
      permissions: perms
    }));
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.name.trim() || !userForm.email.trim()) return;

    addStaffUser({
      name: userForm.name.trim(),
      email: userForm.email.trim(),
      role: userForm.role,
      active: true,
      permissions: userForm.permissions
    });

    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header & Role Simulator */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <span>{isAr ? 'إدارة فريق العمل وصلاحيات الوصول المقيدة (RBAC)' : 'Team Management & Restricted Access Control'}</span>
            </h2>
            <p className="text-xs text-stone-500 font-medium">
              {isAr
                ? 'إضافة حسابات موظفين، تعيين الأدوار الوظيفية، وتقييد الصلاحيات الحساسة'
                : 'Manage staff accounts, assign restricted roles, and enforce permissions'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setUserForm({
                name: '',
                email: '',
                role: 'order_support',
                permissions: {
                  canManageProducts: false,
                  canManageOrders: true,
                  canManageSettings: false,
                  canViewAnalytics: false,
                  canManageContent: false,
                  canManageUsers: false
                }
              });
              setIsAddModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>{isAr ? 'إضافة موظف جديد' : 'Add Team Member'}</span>
          </button>
        </div>

        {/* Live Role Simulator Alert Box */}
        <div className="p-4 rounded-xl bg-stone-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-black block">
                {isAr ? 'محاكي صلاحيات الموظفين المباشر:' : 'Live Role Permission Simulator:'}
              </span>
              <span className="text-[11px] text-stone-400">
                {isAr
                  ? 'يمكنك تبديل الدور لاختبار كيفية ظهور لوحة التحكم للموظفين الآخرين بصلاحيات مقيدة'
                  : 'Switch roles to preview the dashboard as restricted team members'}
              </span>
            </div>
          </div>

          <select
            value={activeStaffRole}
            onChange={(e) => setActiveStaffRole(e.target.value as StaffRole)}
            className="px-3 py-1.5 rounded-xl bg-stone-800 border border-stone-700 text-xs font-bold text-emerald-300 focus:outline-none cursor-pointer"
          >
            <option value="super_admin">{isAr ? '👑 المدير العام (كامل الصلاحيات)' : '👑 Super Admin'}</option>
            <option value="store_manager">{isAr ? '📦 مدير المبيعات والشحن' : '📦 Store Manager'}</option>
            <option value="order_support">{isAr ? '🎧 خدمة العملاء' : '🎧 Order Support'}</option>
            <option value="content_editor">{isAr ? '🎨 محرر المحتوى والبانرات' : '🎨 Content Editor'}</option>
          </select>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right rtl:text-right ltr:text-left">
            <thead className="bg-stone-50 text-stone-500 font-black border-b border-stone-200">
              <tr>
                <th className="py-3.5 px-4">{isAr ? 'الموظف' : 'Staff Member'}</th>
                <th className="py-3.5 px-3">{isAr ? 'البريد الإلكتروني' : 'Email'}</th>
                <th className="py-3.5 px-3">{isAr ? 'المستوى الوظيفي' : 'Role'}</th>
                <th className="py-3.5 px-3">{isAr ? 'صلاحيات الوصول' : 'Permissions'}</th>
                <th className="py-3.5 px-3">{isAr ? 'الحالة' : 'Status'}</th>
                <th className="py-3.5 px-4 text-center">{isAr ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {staffUsers.map((user) => {
                const roleInfo = roleLabels[user.role];

                return (
                  <tr key={user.id} className="hover:bg-stone-50/80 transition-colors">
                    {/* User Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-stone-200 border border-stone-300 flex items-center justify-center font-bold text-stone-700 text-xs">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-stone-900 block">{user.name}</span>
                          <span className="text-[10px] text-stone-400 font-mono">
                            {new Date(user.created_at).toLocaleDateString(isAr ? 'ar-SY' : 'en-US')}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3.5 px-3">
                      <span className="font-mono text-stone-600 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-stone-400" />
                        <span>{user.email}</span>
                      </span>
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-3">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black border ${roleInfo.badge}`}>
                        {isAr ? roleInfo.ar : roleInfo.en}
                      </span>
                    </td>

                    {/* Permissions summary */}
                    <td className="py-3.5 px-3">
                      <div className="flex flex-wrap gap-1 max-w-[280px]">
                        {user.permissions.canManageProducts && (
                          <span className="bg-stone-100 text-stone-700 px-1.5 py-0.2 rounded text-[9px] font-bold">
                            {isAr ? 'منتجات' : 'Products'}
                          </span>
                        )}
                        {user.permissions.canManageOrders && (
                          <span className="bg-stone-100 text-stone-700 px-1.5 py-0.2 rounded text-[9px] font-bold">
                            {isAr ? 'طلبات' : 'Orders'}
                          </span>
                        )}
                        {user.permissions.canViewAnalytics && (
                          <span className="bg-stone-100 text-stone-700 px-1.5 py-0.2 rounded text-[9px] font-bold">
                            {isAr ? 'تحليلات' : 'Analytics'}
                          </span>
                        )}
                        {user.permissions.canManageContent && (
                          <span className="bg-stone-100 text-stone-700 px-1.5 py-0.2 rounded text-[9px] font-bold">
                            {isAr ? 'بانرات' : 'Content'}
                          </span>
                        )}
                        {user.permissions.canManageSettings && (
                          <span className="bg-purple-50 text-purple-700 px-1.5 py-0.2 rounded text-[9px] font-bold">
                            {isAr ? 'إعدادات' : 'Settings'}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Active toggle */}
                    <td className="py-3.5 px-3">
                      <button
                        type="button"
                        onClick={() => updateStaffUser(user.id, { active: !user.active })}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                          user.active
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-stone-200 text-stone-600'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${user.active ? 'bg-emerald-600' : 'bg-stone-400'}`} />
                        <span>{user.active ? (isAr ? 'نشط' : 'Active') : (isAr ? 'معطّل' : 'Inactive')}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center">
                      {user.id !== 'staff-1' && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(isAr ? `حذف الموظف ${user.name}؟` : `Remove ${user.name}?`)) {
                              deleteStaffUser(user.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title={isAr ? 'حذف الموظف' : 'Delete'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <h3 className="text-sm font-black text-stone-900">
                {isAr ? 'إضافة موظف جديد وتعيين الصلاحيات' : 'Add Team Member & Assign Role'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {isAr ? 'اسم الموظف الكامل *' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="مثال: يوسف الخالد"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {isAr ? 'البريد الإلكتروني المهني *' : 'Email Address *'}
                </label>
                <input
                  type="email"
                  required
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="staff@allaith-telecom.sy"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {isAr ? 'الدور الوظيفي المحدد' : 'Staff Role'}
                </label>
                <select
                  value={userForm.role}
                  onChange={(e) => handleRoleChangeInForm(e.target.value as StaffRole)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                >
                  <option value="store_manager">{isAr ? 'مدير مبيعات وشحن (منتجات + طلبات + إحصائيات)' : 'Store Manager'}</option>
                  <option value="order_support">{isAr ? 'خدمة عملاء وطلبات (إدارة الطلبات فقط)' : 'Order Support'}</option>
                  <option value="content_editor">{isAr ? 'محرر محتوى (بانرات ومعلومات الواجهة فقط)' : 'Content Editor'}</option>
                  <option value="super_admin">{isAr ? 'مدير عام (كافة الصلاحيات والإعدادات)' : 'Super Admin'}</option>
                </select>
              </div>

              {/* Granular Permission Checklist */}
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                <span className="text-[11px] font-black text-stone-700 block">
                  {isAr ? 'تخصيص الصلاحيات الفردية:' : 'Granular Permission Overrides:'}
                </span>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={userForm.permissions.canManageProducts}
                      onChange={(e) =>
                        setUserForm({
                          ...userForm,
                          permissions: { ...userForm.permissions, canManageProducts: e.target.checked }
                        })
                      }
                      className="rounded text-emerald-600"
                    />
                    <span>{isAr ? 'إدارة المنتجات والأسعار' : 'Products & Pricing'}</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={userForm.permissions.canManageOrders}
                      onChange={(e) =>
                        setUserForm({
                          ...userForm,
                          permissions: { ...userForm.permissions, canManageOrders: e.target.checked }
                        })
                      }
                      className="rounded text-emerald-600"
                    />
                    <span>{isAr ? 'إدارة وفواتير الطلبات' : 'Orders & Shipments'}</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={userForm.permissions.canViewAnalytics}
                      onChange={(e) =>
                        setUserForm({
                          ...userForm,
                          permissions: { ...userForm.permissions, canViewAnalytics: e.target.checked }
                        })
                      }
                      className="rounded text-emerald-600"
                    />
                    <span>{isAr ? 'مشاهدة التحليلات' : 'View Analytics'}</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={userForm.permissions.canManageContent}
                      onChange={(e) =>
                        setUserForm({
                          ...userForm,
                          permissions: { ...userForm.permissions, canManageContent: e.target.checked }
                        })
                      }
                      className="rounded text-emerald-600"
                    />
                    <span>{isAr ? 'تخصيص البانرات' : 'Homepage Banners'}</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-50"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs"
                >
                  {isAr ? 'إضافة الموظف' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
