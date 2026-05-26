import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header />
      <main className="pb-12 min-h-[calc(100vh-120px)]">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;