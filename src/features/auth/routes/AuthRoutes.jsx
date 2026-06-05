import { lazy, Suspense } from 'react';

const Login = lazy(() => import('../views/Login'));
const AdminLogin = lazy(() => import('../views/AdminLogin'));

const AuthRoutes = [
  { 
    path: '/', 
    element: (
      <Suspense fallback={null}>
        <Login />
      </Suspense>
    )
  },
  { 
    path: '/admin-login', 
    element: (
      <Suspense fallback={null}>
        <AdminLogin />
      </Suspense>
    )
  },
];

export default AuthRoutes;