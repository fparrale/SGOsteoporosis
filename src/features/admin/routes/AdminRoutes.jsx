import { useRoutes } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import RequireAdminAuth from '../../auth/components/RequireAdminAuth';
import AdminLayout from '../layout/AdminLayout';
import RoleRouteGuard from '../../auth/components/RoleRouteGuard';
import Loader from '../../../components/ui/Loader';

// ── Vistas compartidas (Admin + Superadmin) ───────────────────
const Dashboard        = lazy(() => import('../views/Dashboard/Dashboard'));
const Auditoria        = lazy(() => import('../views/Auditoria/Auditoria'));
const IAConfiguration  = lazy(() => import('../views/AnalysisIA/IAConfiguration'));
const Categories       = lazy(() => import('../views/AnalysisIA/Categories'));
const QuestionBank     = lazy(() => import('../views/AnalysisIA/QuestionBank'));
const PlayerList       = lazy(() => import('../views/Players/PlayerList'));
const Leaderboard      = lazy(() => import('../views/Players/Leaderboard'));
const PlayerProfiles   = lazy(() => import('../views/Players/PlayerProfiles'));
const LiveMatches      = lazy(() => import('../views/Matches/LiveMatches'));
const MatchHistory     = lazy(() => import('../views/Matches/MatchHistory'));
const GameConfig       = lazy(() => import('../views/GameConfig/GameConfig'));
const Permissions      = lazy(() => import('../views/Settings/Permissions'));

// ── Vistas exclusivas Superadmin ─────────────────────────────
const HistorialImportaciones = lazy(() => import('../views/SuperAdmin/HistorialImportaciones'));
const GestionAdmins    = lazy(() => import('../views/SuperAdmin/GestionAdmins'));
const ModelosIA        = lazy(() => import('../views/SuperAdmin/ModelosIA'));
const IAPrompts        = lazy(() => import('../views/SuperAdmin/IAPrompts'));
const GlobalStats      = lazy(() => import('../views/SuperAdmin/GlobalStats'));
const LogsSistema      = lazy(() => import('../views/SuperAdmin/LogsSistema'));
const ConfigGeneral    = lazy(() => import('../views/SuperAdmin/ConfigGeneral'));

const S = ({ children }) => <Suspense fallback={<Loader loading inline />}>{children}</Suspense>;

export default function AdminRoutes() {
  const routes = useRoutes([
    {
      path: '/',
      element: (
        <RequireAdminAuth>
          <AdminLayout />
        </RequireAdminAuth>
      ),
      children: [
        // ── Rutas accesibles por Admin Y Superadmin ──────────────
        { index: true,                       element: <S><Dashboard /></S> },
        { path: 'auditoria',                 element: <S><Auditoria /></S> },
        { path: 'analysis/ia-configuration', element: <S><IAConfiguration /></S> },
        { path: 'analysis/categories',       element: <S><Categories /></S> },
        { path: 'analysis/question-bank',    element: <S><QuestionBank /></S> },
        { path: 'players',                   element: <S><PlayerList /></S> },
        { path: 'players/leaderboard',       element: <S><Leaderboard /></S> },
        { path: 'players/profiles',          element: <S><PlayerProfiles /></S> },
        { path: 'players/profiles/:playerId', element: <S><PlayerProfiles /></S> },
        { path: 'matches/live',              element: <S><LiveMatches /></S> },
        { path: 'matches/history',           element: <S><MatchHistory /></S> },
        { path: 'game-config',               element: <S><GameConfig /></S> },
        { path: 'settings/permissions',      element: <S><Permissions /></S> },

        // ── Rutas EXCLUSIVAS del Superadministrador ───────────────
        // RoleRouteGuard con allowedRoles bloquea a cualquier otro rol
        {
          element: <RoleRouteGuard allowedRoles={['Superadministrador']} />,
          children: [
            { path: 'superadmin/historial-importaciones', element: <S><HistorialImportaciones /></S> },
            { path: 'superadmin/admins',      element: <S><GestionAdmins /></S> },
            { path: 'superadmin/ia-models',   element: <S><ModelosIA /></S> },
            { path: 'superadmin/ia-prompts',  element: <S><IAPrompts /></S> },
            { path: 'superadmin/global-stats',element: <S><GlobalStats /></S> },
            { path: 'superadmin/logs',        element: <S><LogsSistema /></S> },
            { path: 'superadmin/config',      element: <S><ConfigGeneral /></S> },
          ],
        },
      ],
    },
  ]);

  return routes;
}
