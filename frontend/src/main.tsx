import ReactDOM from 'react-dom/client'
import './index.css'
import Root from "./routes/root";
import ErrorPage from "./routes/error-page";
import '@mantine/charts/styles.css';

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import UploadPage from './routes/upload-page';
import PositionPage from './routes/position';
import { BackendAPIClient } from './api/b3loader';
const api = new BackendAPIClient()
const router = createBrowserRouter([
  {
    path: "/",
    element: <Root api={api}/>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/upload",
    element: <UploadPage api={api}/>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/position",
    element: <PositionPage />,
    errorElement: <ErrorPage />
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <RouterProvider router={router} />
)
