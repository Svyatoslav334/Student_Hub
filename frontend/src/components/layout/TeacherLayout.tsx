import { Outlet } from 'react-router-dom';
import TeacherSidebar from './TeacherSidebar';
import Header from './Header';
import Footer from './Footer';

const TeacherLayout = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header />
      <div className="flex">
        <TeacherSidebar />
        <main className="flex-1 p-6 lg:p-8 overflow-auto pb-20 lg:pb-8">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default TeacherLayout;