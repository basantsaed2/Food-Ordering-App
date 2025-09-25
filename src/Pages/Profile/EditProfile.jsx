import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { usePost } from '../../Hooks/usePost';
import { FaTimes, FaEnvelope, FaPhone, FaUser, FaCamera, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../../Context/Auth';

const EditProfile = ({ isOpen, onClose, profileData, onUpdate }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const [formData, setFormData] = useState({
    f_name: '',
    l_name: '',
    email: '',
    phone: '',
    phone_2: '',
    bio: '',
    password: '',
    image: null,
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [hasUpdated, setHasUpdated] = useState(false); // Flag to prevent multiple updates

  const { postData, loading: loadingPost, response: responseData, error: postError } = usePost({
    url: `${apiUrl}/customer/profile/update`,
  });

  // Phone validation regex
  const phoneRegex = /^01[0-9]{9}$/;

  useEffect(() => {
    if (profileData && isOpen) {
      console.log('EditProfile: Initializing formData', { profileData });
      setFormData({
        f_name: profileData.f_name || '',
        l_name: profileData.l_name || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        phone_2: profileData.phone_2 || '',
        bio: profileData.bio || '',
        password: '',
        image: null,
      });
      setPreviewImage(profileData.image_link || null);
      setErrors({});
      setHasUpdated(false); // Reset flag when modal opens
    }
  }, [profileData, isOpen]);

  useEffect(() => {
    if (responseData && !loadingPost && !hasUpdated) {
      setHasUpdated(true); // Prevent further triggers
      onUpdate(responseData);
      onClose();
    }
  }, [responseData, loadingPost, onClose, onUpdate, hasUpdated]);

  const handleChange = useCallback((e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
    if (name === 'image' && files[0]) {
      setPreviewImage(URL.createObjectURL(files[0]));
    }
    setErrors((prev) => ({ ...prev, [name]: '' }));
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.f_name.trim()) newErrors.f_name = t('FirstNameRequired');
    if (!formData.l_name.trim()) newErrors.l_name = t('LastNameRequired');
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('ValidEmailRequired');
    }
    if (!formData.phone.trim()) {
      newErrors.phone = t('PhoneRequired');
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = t('Phone must be 11 digits and start with "01"');
    }
    if (formData.phone_2.trim() && !phoneRegex.test(formData.phone_2)) {
      newErrors.phone_2 = t('Phone2 must be 11 digits and start with "01"');
    }
    if (formData.password && formData.password.length < 6) {
      newErrors.password = t('PasswordMinLength6');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, t]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!validateForm()) {
        return;
      }
      if (!phoneRegex.test(formData.phone)) {
        auth.toastError(t('Primary phone must be 11 digits and start with "01".'));
        return;
      }
      if (formData.phone_2 && !phoneRegex.test(formData.phone_2)) {
        auth.toastError(t('Secondary phone must be 11 digits and start with "01".'));
        return;
      }

      const submitData = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== '') {
          if (key === 'phone_2' && !formData.phone_2.trim()) {
            return;
          }
          submitData.append(key, formData[key]);
        }
      });

      postData(submitData, t('Profile updated successfully'));
    },
    [formData, postData, auth, t, validateForm]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
        <div className="bg-gradient-to-r from-mainColor to-mainColor/80 rounded-t-xl p-4 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">{t('EditProfile')}</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors duration-200 p-1 rounded-full"
            >
              <FaTimes className="w-6 h-6" />
            </button>
          </div>
        </div>
        <div className="p-6">
          {postError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-600 text-sm">{t('UpdateFailed')}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center border-2 border-gray-200">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Profile Preview"
                      className="w-full h-full rounded-2xl object-cover"
                    />
                  ) : (
                    <FaUserCircle className="w-20 h-20 text-blue-400" />
                  )}
                </div>
                <label className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-gray-50 transition-colors border">
                  <FaCamera className="w-4 h-4 text-blue-500" />
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-gray-500 text-sm mt-2">{t('Click camera icon to change photo')}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('FirstName')} *</label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    name="f_name"
                    value={formData.f_name}
                    onChange={handleChange}
                    className={`w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-mainColor focus:border-transparent transition-all duration-200 ${
                      errors.f_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={t('First Name')}
                  />
                </div>
                {errors.f_name && <p className="text-red-500 text-xs mt-1">{errors.f_name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('LastName')} *</label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    name="l_name"
                    value={formData.l_name}
                    onChange={handleChange}
                    className={`w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-mainColor focus:border-transparent transition-all duration-200 ${
                      errors.l_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={t('Last Name')}
                  />
                </div>
                {errors.l_name && <p className="text-red-500 text-xs mt-1">{errors.l_name}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('Email')} *</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-mainColor focus:border-transparent transition-all duration-200 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={t('email@example.com')}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('Phone')} *</label>
                <div className="relative">
                  <FaPhone className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-mainColor focus:border-transparent transition-all duration-200 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={t('01XXXXXXXXX')}
                    maxLength="11"
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('Phone2')} ({t('Optional')})</label>
                <div className="relative">
                  <FaPhone className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="tel"
                    name="phone_2"
                    value={formData.phone_2}
                    onChange={handleChange}
                    className={`w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-mainColor focus:border-transparent transition-all duration-200 ${
                      errors.phone_2 ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={t('01XXXXXXXXX')}
                    maxLength="11"
                  />
                </div>
                {errors.phone_2 && <p className="text-red-500 text-xs mt-1">{errors.phone_2}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('Bio')} ({t('Optional')})</label>
              <textarea
                name="bio"
                value={formData.bio || ''}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mainColor focus:border-transparent transition-all duration-200"
                rows="3"
                placeholder={t('Tell us about yourself...')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('Password')} ({t('Optional')})</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-mainColor focus:border-transparent transition-all duration-200 ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder={t('Leave blank to keep current password')}
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              <p className="text-gray-500 text-xs mt-1">{t('Minimum 6 characters')}</p>
            </div>
            <div className="flex gap-4 mt-6 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-300"
              >
                {t('Cancel')}
              </button>
              <button
                type="submit"
                disabled={loadingPost}
                className={`flex-1 bg-mainColor text-white py-3 rounded-lg font-semibold hover:bg-mainColor/90 transition-all duration-300 ${
                  loadingPost ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loadingPost ? t('Updating...') : t('UpdateProfile')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;