import { lazy, Suspense } from 'react';
import { useRoutes } from 'react-router-dom';
import AuthRoutes from '../features/auth/routes/AuthRoutes';
import GameRoutes from '../features/game/routes/GameRoutes';
import AdminPanelLegacyRedirect from './AdminPanelLegacyRedirect';
import NotFound from '../features/auth/views/NotFound';
import Loader from '../components/ui/Loader';

// Carga diferida del bundle admin: decenas de vistas y dependencias se cargan
// solo cuando se visita /admin/*, reduciendo el JS inicial al mínimo.
const AdminRoutes = lazy(() => import('../features/admin/routes/AdminRoutes'));

const AppRouter = () => {
  const routes = useRoutes([
    ...AuthRoutes,   // /  y /admin-login
    ...GameRoutes,   // /game
    // Redirige URLs antiguas /admin-panel/* que puedan estar en marcadores externos
    { path: '/admin-panel/*', element: <AdminPanelLegacyRedirect /> },
    {
      path: '/admin/*',
      element: (
        <Suspense fallback={<Loader loading />}>
          <AdminRoutes />
        </Suspense>
      ),
    },
    { path: '*', element: <NotFound /> },
  ]);

  return routes;
};

export default AppRouter;