import {
    LayoutDashboard, Users, Gamepad2, Brain, Settings,
    UsersRound, UserCheck, ShieldCheck, Swords, Clock,
    Trophy, Sliders, KeyRound, Lock, LayoutGrid, BrainCircuit,
    BarChart, SlidersHorizontal,
    // Exclusivos superadmin
    UserCog, Cpu, FileText, BarChart2, Wrench, History,
} from "lucide-react";

export const C = {
  navy: "#1a2b4b", red: "#b6171e", surface: "#f7f9fb",
  white: "#ffffff", outline: "#75777f", border: "#e2e8f0",
  textPrimary: "#031635", emerald: "#10b981", orange: "#ea580c", blue: "#3b82f6",
  // Superadmin
  superNavy: "#1a0f2e",
};

// ── Menú del Administrador (igual que antes, sin tocar) ───────
export const NAV = [
  { icon: LayoutDashboard, label: "nav_dashboard", path: "/admin" },
  {
    icon: Users, label: "nav_players",
    children: [
      { icon: UsersRound,  label: "nav_sub_player_list",      path: "/admin/players" },
      { icon: Trophy,      label: "nav_sub_leaderboard",      path: "/admin/players/leaderboard" },
      { icon: UsersRound,  label: "nav_sub_player_profiles",  path: "/admin/players/profiles" },
    ],
  },
  {
    icon: Gamepad2, label: "nav_active_games",
    children: [
      { icon: Swords,  label: "nav_sub_create_room", path: "/admin/matches/live" },
      { icon: BarChart, label: "nav_sub_statistics",  path: "/admin/matches/history" },
    ],
  },
  {
    icon: Brain, label: "nav_ia_analysis",
    children: [
      { icon: Settings,    label: "nav_sub_ia_configuration", path: "/admin/analysis/ia-configuration" },
      { icon: LayoutGrid,  label: "nav_sub_categories",       path: "/admin/analysis/categories" },
      { icon: BrainCircuit,label: "nav_sub_question_bank",    path: "/admin/analysis/question-bank" },
    ],
  },
  { icon: SlidersHorizontal, label: "nav_sub_game_settings", path: "/admin/game-config" },
];

// ── Menú del Superadministrador ───────────────────────────────
// Incluye TODO lo del admin + sección exclusiva marcada con superAdminOnly: true
export const SUPERADMIN_NAV = [
  // === Mismas secciones del Admin ===
  ...NAV,

  // === Sección exclusiva Superadmin ===
  {
    icon: UserCog,
    label: "nav_sa_admins",
    path: "/admin/superadmin/admins",
    superAdminOnly: true,
  },
  {
    icon: Cpu,
    label: "nav_sa_ia_models",
    superAdminOnly: true,
    children: [
      { icon: Cpu,             label: "nav_sa_models_list",  path: "/admin/superadmin/ia-models" },
      { icon: SlidersHorizontal, label: "nav_sa_ia_prompts", path: "/admin/superadmin/ia-prompts" },
    ],
  },
  {
    icon: BarChart2,
    label: "nav_sa_global_stats",
    path: "/admin/superadmin/global-stats",
    superAdminOnly: true,
  },
  {
    icon: Wrench,
    label: "nav_sa_config",
    superAdminOnly: true,
    children: [
      { icon: SlidersHorizontal, label: "nav_sa_config_page", path: "/admin/superadmin/config" },
      { icon: FileText,          label: "nav_sa_logs",        path: "/admin/superadmin/logs" },
    ],
  },
  {
    icon: History,
    label: "nav_sa_historial",
    path: "/admin/superadmin/historial-importaciones",
    superAdminOnly: true,
  },
];