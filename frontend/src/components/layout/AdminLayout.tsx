import { Outlet } from 'react-router-dom';

import Header from './Header';
import Footer from './Footer';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header />

      <div className="flex">
        <AdminSidebar />

        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default AdminLayout;