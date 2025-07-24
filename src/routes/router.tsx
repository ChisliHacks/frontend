import { createBrowserRouter } from "react-router";
import Layout from "./Layout";
import Home from "../pages/Home";
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import Lessons from "../pages/Lessons";
import Jobs from "../pages/Jobs";
import LessonDetail from "../pages/LessonDetail";
import JobDetail from "../pages/JobDetail";
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
        path: "lessons",
        element: <Lessons />,
      },
      {
        path: "lessons/:id",
        element: <LessonDetail />,
      },
      {
        path: "lessons/:id/edit",
        element: <LessonDetail />,
      },
      {
        path: "jobs",
        element: <Jobs />,
      },
      {
        path: "jobs/:id",
        element: <JobDetail />,
      },
      {
        path: "jobs/:id/edit",
        element: <JobDetail />,
      },
      {
        path: "auth/login",
        element: <Login />,
      },
      {
        path: "auth/register",
        element: <Signup />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
