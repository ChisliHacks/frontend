import { createBrowserRouter } from "react-router";
import Layout from "./Layout";
import Home from "../pages/Home";
import Login from "../pages/auth/Login";
import NotFound from "../pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "auth/login",
        element: <Login />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
