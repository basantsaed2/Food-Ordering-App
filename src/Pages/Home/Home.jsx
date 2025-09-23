import React, { useEffect, useState } from 'react';
import '@splidejs/react-splide/css';
import Banners from './Sections/Banners';
import Categories from './Sections/Categories';
import RecommendedProduct from './Sections/RecommendedProduct';
import { useGet } from '../../Hooks/useGet';
import StaticSpinner from '../../Components/Spinners/StaticSpinner';
import { useSelector } from 'react-redux';
import OffersProducts from './Sections/OffersProducts';

const Home = () => {
  // const apiUrl = import.meta.env.VITE_API_BASE_URL;
  // const selectedLanguage = useSelector((state) => state.language?.selected ?? 'en');
  // const [webProductsData, setWebProductsData] = useState(null);

  // const {
  //   refetch: refetchWebProducts,
  //   loading: loadingWebProducts,
  //   data: dataWebProducts,
  // } = useGet({
  //   url: `${apiUrl}/customer/home/web_products?&locale=${selectedLanguage}`,
  // });

  // // Refetch products when language changes
  // useEffect(() => {
  //   refetchWebProducts();
  // }, [selectedLanguage, refetchWebProducts]);

  // // Store the data in state
  // useEffect(() => {
  //   if (dataWebProducts && !loadingWebProducts) {
  //     setWebProductsData(dataWebProducts);
  //   }
  // }, [dataWebProducts]);

  // if (loadingWebProducts) {
  //   return (
  //     <div className="flex justify-center items-center py-12">
  //       <StaticSpinner />
  //     </div>
  //   );
  // }

  return (
    <div className="flex flex-col items-center w-screen gap-2">
      <Banners />
      <Categories/>
      <RecommendedProduct />
      <OffersProducts/>
    </div>
  );
};

export default Home;