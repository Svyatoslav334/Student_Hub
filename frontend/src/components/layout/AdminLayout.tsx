import { Outlet } from 'react-router-dom';

import Header from './Header';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header />

      <div className="flex">
        <AdminSidebar />

        <main className="flex-1 p-6 lg:p-8 overflow-auto pb-20 lg:pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;