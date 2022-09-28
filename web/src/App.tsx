import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';

import { Error } from './routes/Error';
import { Admin } from './routes/Admin';
import { User } from './routes/User';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Outlet />,
    errorElement: <Error />,
    children: [
      {
        path: 'admin',
        element: <Admin />,
      },
      {
        path: 'user',
        element: <User />,
      },
    ],
  },
]);

export function App() {
  return (
    <RouterProvider router={router} />
  )
}
