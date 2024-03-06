import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { ToastContainer } from "react-toastify";

import App from "./List.tsx";
import Login from "./admin/Login.tsx";
import Add from "./admin/Add.tsx";
import Edit from "./admin/Edit.tsx";
import Stats from "./admin/Stats.tsx";
import Admin from "./admin/List.tsx";

import "./style.scss";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/admin",
    element: <Admin />,
  },
  {
    path: "/admin/add",
    element: <Add />,
  },
  {
    path: "/admin/edit/:itemId",
    element: <Edit />,
  },
  {
    path: "/admin/stats",
    element: <Stats />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ToastContainer />
    <RouterProvider router={router} />
  </React.StrictMode>
);
