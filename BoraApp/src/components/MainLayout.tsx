import { Outlet } from 'react-router-dom';

import { BottomNavigation } from './BottomNavigation';

export function MainLayout() {
  return (
    <div className="app-shell bg-background">
      <div className="pb-24">
        <Outlet />
      </div>
      <BottomNavigation />
    </div>
  );
}
