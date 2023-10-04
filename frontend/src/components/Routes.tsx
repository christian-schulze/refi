import { observer } from 'mobx-react-lite';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { Root } from 'screens/Root';
import { MainScreen } from 'screens/MainScreen';
import { SettingsScreen } from 'screens/SettingsScreen';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      { path: '/', element: <MainScreen /> },
      { path: '/settings', element: <SettingsScreen /> }
    ]
  },
]);

export const Routes = observer(() => {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
});
