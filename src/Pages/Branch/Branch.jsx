import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaHome,
  FaClock,
  FaUtensils,
  FaExternalLinkAlt
} from 'react-icons/fa';
import { MdOutlineDirections } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { useGet } from '../../Hooks/useGet';
import StaticSpinner from '../../Components/Spinners/StaticSpinner';

const Branch = () => {
  const { t, i18n } = useTranslation();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const { refetch: refetchLocations, loading: loadingLocationsData, data: dataLocations } = useGet({
    url: `${apiUrl}/customer/address`,
    required: true,
  });
  const [branches, setBranches] = useState([]);
  const [callCenterPhone, setCallCenterPhone] = useState('');
  
  useEffect(() => {
    refetchLocations();
  }, [refetchLocations]);

  useEffect(() => {
    if (dataLocations && dataLocations.branches && dataLocations.call_center_phone) {
      setBranches(dataLocations.branches);
      setCallCenterPhone(dataLocations.call_center_phone);
    }
  }, [dataLocations]);

  const formatWorkingHours = (hours) => {
    if (!hours) return t('NotAvailable');
   
    try {
      const hoursObj = typeof hours === 'string' ? JSON.parse(hours) : hours;
      return Object.entries(hoursObj)
        .map(([day, time]) => `${t(day)}: ${time}`)
        .join(', ');
    } catch (e) {
      return hours;
    }
  };

  // Phone number formatter
  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    
    // Remove non-digits
    const cleaned = phone.replace(/\D/g, '');
    
    // Format based on length (adjust for your country's format)
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `(${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    
    return phone;
  };

  if (loadingLocationsData) {
    return (
      <div className="flex justify-center items-center py-12">
        <StaticSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 w-full">
      {/* Header Section */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-mainColor mb-2">{t('Our Branches')}</h1>
        <p className="text-gray-600 max-w-md mx-auto">{t('Find Our Locations NearYou')}</p>
      </div>

      {branches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {branches.map((branch, index) => (
            <div
              key={index}
              className="flex w-full max-w-full p-4 bg-white rounded-xl shadow-md hover:shadow-lg border border-gray-100 transition-all duration-300 overflow-hidden group"
            >
              {/* Image Section - Left Side */}
              <div className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-100 mr-4">
                <img
                  src={branch.image_link || '/api/placeholder/300/200'}
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                  alt={branch.name}
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5YzlkYWEiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIwLjM1ZW0iPkJyYW5jaCBJbWFnZTwvdGV4dD48L3N2Zz4=';
                  }}
                />
              </div>

              {/* Content Section - Right Side */}
              <div className="flex flex-col justify-between flex-1 min-w-0">
                {/* Branch Name and Details */}
                <div className="flex flex-col gap-2 mb-3">
                  {/* Branch Name */}
                  <div className="flex items-start gap-2">
                    <FaMapMarkerAlt className="text-red-500 flex-shrink-0 mt-0.5 text-sm" />
                    <div className="min-w-0 flex-1">
                      <h2 className="text-base font-semibold text-gray-800 truncate pr-1 line-clamp-1">
                        {branch.name}
                      </h2>
                    </div>
                  </div>

                  {/* Branch Details */}
                  <div className="space-y-1.5 text-gray-600 text-xs leading-tight">
                    {/* Address */}
                    <div className="flex items-start gap-1.5">
                      <FaHome className="text-blue-500 flex-shrink-0 mt-0.5 text-sm" />
                      <p className="line-clamp-2 break-words flex-1 pr-1">
                        {branch.address || t('AddressNotAvailable')}
                      </p>
                    </div>
                   
                    {/* Phone */}
                    <div className="flex items-center gap-1.5">
                      <FaPhoneAlt className="text-green-500 flex-shrink-0 text-sm" />
                      <span className="font-medium truncate">
                        {branch.phone_status === 1 
                          ? formatPhoneNumber(branch.phone) 
                          : formatPhoneNumber(callCenterPhone)
                        }
                      </span>
                    </div>
                   
                    {/* Working Hours */}
                    {branch.working_hours && (
                      <div className="flex items-start gap-1.5">
                        <FaClock className="text-purple-500 flex-shrink-0 mt-0.5 text-sm" />
                        <span className="line-clamp-2 break-words flex-1 pr-1 text-gray-500">
                          {formatWorkingHours(branch.working_hours)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  {/* View Products Button */}
                  <Link
                    to={`/products?branch=${branch.id}`}
                    className="group/btn flex items-center gap-1.5 px-2.5 py-1.5 bg-mainColor text-white rounded-lg hover:bg-mainColor/90 transition-all duration-200 font-medium text-xs flex-shrink-0 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                    title={`${t('ViewProducts')} - ${branch.name}`}
                  >
                    <FaUtensils className="text-xs" />
                    <span className="whitespace-nowrap">{t('ViewProducts')}</span>
                  </Link>
                 
                  {/* Directions Button */}
                  {branch.map && (
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={branch.map}
                      className="group/btn flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-mainColor hover:text-mainColor transition-all duration-200 font-medium text-xs flex-shrink-0 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                      title={`${t('GetDirections')} - ${branch.name}`}
                    >
                      <MdOutlineDirections className="text-sm" />
                      <span className="whitespace-nowrap">{t('Directions')}</span>
                    </a>
                  )}
                  
                  {/* Overflow Menu Button (if no map) */}
                  {!branch.map && (
                    <button className="flex items-center justify-center w-6 h-6 ml-1 text-gray-400 hover:text-gray-600 transition-colors duration-200 rounded-full hover:bg-gray-100 flex-shrink-0">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl shadow-md border border-gray-100">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <FaMapMarkerAlt className="text-xl text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">{t('NoBranchesAvailable')}</h3>
          <p className="text-gray-500 text-sm">{t('CheckBackLaterForNewLocations')}</p>
        </div>
      )}

      {/* Call Center Information */}
      {callCenterPhone && (
        <div className="bg-gradient-to-r from-mainColor/10 to-mainColor/5 border border-mainColor/10 text-mainColor rounded-xl p-4 md:p-6 mt-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-10 h-10 bg-mainColor bg-opacity-10 rounded-full flex items-center justify-center">
              <FaPhoneAlt className="text-white text-sm" />
            </div>
            <h3 className="text-base font-semibold">{t('Need Help')}</h3>
          </div>
          <p className="text-sm opacity-90 mb-4">{t('Call Our Customer Service')}</p>
          <a
            href={`tel:${callCenterPhone}`}
            className="inline-flex items-center gap-2 bg-white text-mainColor px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-50 hover:shadow-md transition-all duration-200 border border-gray-200 shadow-sm"
            title={`Call ${formatPhoneNumber(callCenterPhone)}`}
          >
            <FaPhoneAlt className="text-sm" />
            <span className="whitespace-nowrap">{formatPhoneNumber(callCenterPhone)}</span>
          </a>
        </div>
      )}
    </div>
  );
};

export default Branch;