import { lazy, Suspense } from "react";

const GameScreen = lazy(() => import("../views/GameScreen"));

const GameRoutes = [
  {
    path: "/game",
    element: (
      <Suspense fallback={null}>
        <GameScreen />
      </Suspense>
    ),
  },
];

export default GameRoutes;
