import { createBrowserRouter } from 'react-router-dom';

import MainLayout from '../components/layout/MainLayout';
import TeacherLayout from '../components/layout/TeacherLayout';
import AdminLayout from '../components/layout/AdminLayout';

import PrivateRoute from './PrivateRoute';


import Home from '../pages/Home';
import NotFoundPage from '../pages/NotFoundPage';

import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

import ProfilePage from '../pages/profile/ProfilePage';


import NewsList from '../pages/news/NewsList';
import NewsDetail from '../pages/news/NewsDetail';


import ClubsList from '../pages/clubs/ClubsList';
import ClubDetail from '../pages/clubs/ClubDetail';
import MyClubsPage from '../pages/clubs/MyClubsPage';
import ClubChatPage from '../pages/clubs/ClubChatPage';


import TeachersList from '../pages/teachers/TeachersList';
import TeacherDetail from '../pages/teachers/TeacherDetail';
import TeacherMaterials from '../pages/teachers/TeacherMaterials';
import TeacherDashboard from '../pages/teachers/TeacherDashboard';
import TeacherMyClubs from '../pages/teachers/TeacherMyClubs';




import MaterialsList from '../pages/materials/MaterialsList';


import FaqPage from '../pages/faq/FaqPage';


import DocumentsList from '../pages/documents/DocumentsList';


import AdminUsers from '../pages/admin/AdminUsers';
import AdminNews from '../pages/admin/AdminNews';
import AdminFaq from '../pages/admin/AdminFaq';
import AdminDocuments from '../pages/admin/AdminDocuments';
import AdminDashboard from '../pages/admin/AdminDashboard';
import MyGroup from '../pages/student-groups/MyGroup';
import AdminStudentGroups from '../pages/admin/AdminStudentGroups';
import StudentGroupsList from '../pages/student-groups/StudentGroupsList';
import StudentGroupDetail from '../pages/student-groups/StudentGroupDetail';
import MapPage from '../pages/map/MapPage';
import MapEditor from '../pages/admin/MapEditor';

export const router = createBrowserRouter([
  {
    path: '/',

    element: <MainLayout />,

    children: [
      {
        index: true,
        element: <Home />,
      },

      
      {
        path: 'news',
        element: <NewsList />,
      },

      {
        path: 'news/:id',
        element: <NewsDetail />,
      },

      {
        path: 'teachers',
        element: <TeachersList />,
      },

      {
        path: 'teachers/:id',
        element: <TeacherDetail />,
      },

      {
        path: 'clubs',
        element: <ClubsList />,
      },

      {
        path: 'map',
        element: <MapPage />,
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

      {
        path: 'my-group',
        element: <PrivateRoute />,
        children: [
          { index: true, element: <MyGroup /> }
        ]
      },

      {
        path: 'faq',
        element: <FaqPage />,
      },

      
      {
        path: 'materials',
        element: <MaterialsList />,
      },

      {
        path: 'student-groups',
        element: <StudentGroupsList />,
      },

      
      {
        path: 'documents',
        element: <DocumentsList />,
      },

      
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
            path: 'map-editor',
            element: <MapEditor />,
          },

          {
            path: 'groups',
            element: <AdminStudentGroups />,
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

  

  {
    path: '/login',
    element: <Login />,
  },

  {
    path: '/register',
    element: <Register />,
  },

  

  {
    path: '*',
    element: <NotFoundPage />,
  },

  {
    path: 'student-groups/:id',
    element: <PrivateRoute />,
    children: [
      { index: true, element: <StudentGroupDetail /> }
    ]
  },
]);

export default router;
