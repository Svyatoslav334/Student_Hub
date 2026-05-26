import { createBrowserRouter } from 'react-router-dom';

import MainLayout from '../components/layout/MainLayout';
import TeacherLayout from '../components/layout/TeacherLayout';
import AdminLayout from '../components/layout/AdminLayout';

import PrivateRoute from './PrivateRoute';

/* Pages */
import Home from '../pages/Home';

import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

import ProfilePage from '../pages/profile/ProfilePage';

/* News */
import NewsList from '../pages/news/NewsList';
import NewsDetail from '../pages/news/NewsDetail';

/* Clubs */
import ClubsList from '../pages/clubs/ClubsList';
import ClubDetail from '../pages/clubs/ClubDetail';
import MyClubsPage from '../pages/clubs/MyClubsPage';
import ClubChatPage from '../pages/clubs/ClubChatPage';

/* Teachers */
import TeachersList from '../pages/teachers/TeachersList';
import TeacherDetail from '../pages/teachers/TeacherDetail';
import TeacherMaterials from '../pages/teachers/TeacherMaterials';
import TeacherDashboard from '../pages/teachers/TeacherDashboard';
import TeacherMyClubs from '../pages/teachers/TeacherMyClubs';

/* Admin */

/* Materials */
import MaterialsList from '../pages/materials/MaterialsList';

/* FAQ */
import FaqPage from '../pages/faq/FaqPage';

/* Documents */
import DocumentsList from '../pages/documents/DocumentsList';

/* Admin pages */
import AdminUsers from '../pages/admin/AdminUsers';
import AdminNews from '../pages/admin/AdminNews';
import AdminFaq from '../pages/admin/AdminFaq';
import AdminDocuments from '../pages/admin/AdminDocuments';
import AdminDashboard from '../pages/admin/AdminDashboard';

export const router = createBrowserRouter([
  {
    path: '/',

    element: <MainLayout />,

    children: [
      {
        index: true,
        element: <Home />,
      },

      /* NEWS */
      {
        path: 'news',
        element: <NewsList />,
      },

      {
        path: 'news/:id',
        element: <NewsDetail />,
      },

      /* TEACHERS */
      {
        path: 'teachers',
        element: <TeachersList />,
      },

      {
        path: 'teachers/:id',
        element: <TeacherDetail />,
      },

      /* CLUBS */
      {
        path: 'clubs',
        element: <ClubsList />,
      },

      {
        path: 'clubs/:id',
        element: <ClubDetail />,
      },

      {
        path: 'my-clubs',

        element: <PrivateRoute />,

        children: [
          {
            index: true,
            element: <MyClubsPage />,
          },
        ],
      },

      {
        path: 'chat/clubs/:id',

        element: <PrivateRoute />,

        children: [
          {
            index: true,
            element: <ClubChatPage />,
          },
        ],
      },

      /* FAQ */
      {
        path: 'faq',
        element: <FaqPage />,
      },

      /* MATERIALS */
      {
        path: 'materials',
        element: <MaterialsList />,
      },

      /* DOCUMENTS */
      {
        path: 'documents',
        element: <DocumentsList />,
      },

      /* PROFILE */
      {
        path: 'profile',

        element: <PrivateRoute />,

        children: [
          {
            index: true,
            element: <ProfilePage />,
          },
        ],
      },
    ],
  },

  /* =========================
      TEACHER PANEL
  ========================= */

  {
    path: 'teacher',

    element: (
      <PrivateRoute
        allowedRoles={[
          'TEACHER',
          'ADMIN',
        ]}
      />
    ),

    children: [
      {
        element: <TeacherLayout />,

        children: [
          {
            index: true,
            element: <TeacherDashboard />,
          },

          {
            path: 'materials',
            element: <TeacherMaterials />,
          },

          {
            path: 'clubs',
            element: <TeacherMyClubs />,
          },

          {
            path: 'profile',
            element: <ProfilePage />,
          },
        ],
      },
    ],
  },

  /* =========================
      ADMIN PANEL
  ========================= */

  {
    path: 'admin',

    element: (
      <PrivateRoute
        allowedRoles={['ADMIN']}
      />
    ),

    children: [
      {
        element: <AdminLayout />,

        children: [
          {
            index: true,
            element: <AdminDashboard />,
          },

          {
            path: 'users',
            element: <AdminUsers />,
          },
          
          {
            path: 'news',
            element: <AdminNews />,
          },

          {
            path: 'faq',
            element: <AdminFaq />,
          },

          {
            path: 'documents',
            element: <AdminDocuments />,
          },

          {
            path: 'profile',
            element: <ProfilePage />,
          },
        ],
      },
    ],
  },

  /* AUTH */

  {
    path: '/login',
    element: <Login />,
  },

  {
    path: '/register',
    element: <Register />,
  },

  /* 404 */

  {
    path: '*',

    element: (
      <div className="p-10 text-center text-2xl">
        404 — Сторінку не знайдено
      </div>
    ),
  },
]);

export default router;