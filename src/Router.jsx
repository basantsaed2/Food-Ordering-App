import React from "react";
import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Home from "./Pages/Home/Home";
import LoginPage from "./Pages/Authentication/Login";
import Products from "./Pages/Products/Product";
import LandingPage from "./Pages/LandingPage/LandingPage";
import Menu from "./Pages/Menu/Menu";
import Branch from "./Pages/Branch/Branch";
import Cart from "./Pages/Cart/Cart";
import FavoriteProducts from "./Pages/FavoriteProducts/FavoriteProducts";
import OrderType from "./Pages/OrderType/OrderType";
import AddNewAddress from "./Pages/OrderType/AddNewAddress";

export const router = createBrowserRouter(
  [
    {
      path:'login',
      element : <LoginPage/>
    },
    {
      path: '',
      element: <App />,
      children: [
        {
          path:'',
          element:<LandingPage/>
        },
        {
          path:'home',
          element:<Home/>
        },
        {
          path:'menu',
          element:<Menu/>
        },
         {
          path:'branches',
          element:<Branch/>
        },
         {
          path:'products/:id',
          element:<Products/>
        },
        {
          path:'favorite_product',
          element:<FavoriteProducts/>
        },
        {
          path:'order_online',
          element:<OrderType/>
        },
        {
          path:'add_address',
          element:<AddNewAddress/>
        },
        {
          path:'cart',
          element:<Cart/>
        },
      ]
    },
  ],
);
