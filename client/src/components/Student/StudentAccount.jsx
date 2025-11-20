import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  Camera,
  Edit3,
  Save,
  X,
  Lock,
  Bell,
  Globe,
  Loader,
  Upload
} from 'lucide-react';
import { getUserProfile, updateUserProfile, uploadProfilePicture } from '../../Api/userApi.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { toast } from 'react-hot-toast';

const StudentAccount = () => {
  const { updateUserProfile: updateAuthUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    birthDate: '',
    avatar: null
  });
  const [originalData, setOriginalData] = useState({});
  const fileInputRef = useRef(null);

  // Load user profile data on component mount
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const response = await getUserProfile();
      if (response.success && response.user) {
        const userData = {
          name: response.user.name || '',
          email: response.user.email || '',
          phone: response.user.phone || '',
          location: response.user.location || '',
          bio: response.user.bio || '',
          birthDate: response.user.birthDate || '',
          avatar: response.user.avatar || null
        };
        setProfileData(userData);
        setOriginalData(userData);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Prepare data to send to backend
      const updateData = {
        name: profileData.name,
        phone: profileData.phone,
        location: profileData.location,
        bio: profileData.bio,
        birthDate: profileData.birthDate
      };

      const response = await updateUserProfile(updateData);
      
      if (response.success) {
        toast.success('Profile updated successfully!');
        setOriginalData(profileData);
        setIsEditing(false);
        
        // Update the profile data with the response from server
        if (response.user) {
          const updatedData = {
            name: response.user.name || '',
            email: response.user.email || '',
            phone: response.user.phone || '',
            location: response.user.location || '',
            bio: response.user.bio || '',
            birthDate: response.user.birthDate || '',
            avatar: response.user.avatar || null
          };
          setProfileData(updatedData);
          setOriginalData(updatedData);
          
          // Update the auth context so navbar reflects changes immediately
          updateAuthUser({
            name: response.user.name,
            avatar: response.user.avatar
          });
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to original data from server
    setProfileData(originalData);
    setIsEditing(false);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      const response = await uploadProfilePicture(file);
      
      if (response.success) {
        toast.success('Profile picture updated successfully!');
        setProfileData(prev => ({
          ...prev,
          avatar: response.avatar
        }));
        setOriginalData(prev => ({
          ...prev,
          avatar: response.avatar
        }));
        
        // Update the auth context with only the avatar
        updateAuthUser({ avatar: response.avatar });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  // Show loading state while fetching profile data
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 pt-24 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-300 text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 pt-24">
      <div className="container mx-auto px-6 lg:px-8 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              My Account
            </h1>
            <p className="text-xl text-slate-300">
              Manage your profile and account settings
            </p>
          </motion.div>

          {/* Profile Card */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.2 }}
            className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl mb-8"
          >
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  {profileData.avatar ? (
                    <img 
                      src={profileData.avatar} 
                      alt="Profile" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 text-white" />
                  )}
                </div>
                
                {(isEditing || !isEditing) && (
                  <>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
                    >
                      {uploadingImage ? (
                        <Loader className="w-5 h-5 text-white animate-spin" />
                      ) : (
                        <Camera className="w-5 h-5 text-white" />
                      )}
                    </button>
                  </>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                      {profileData.name || 'Your Name'}
                    </h2>
                    <p className="text-slate-300 text-lg">Student</p>
                  </div>
                  
                  <div className="flex space-x-3 mt-4 md:mt-0">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="px-6 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {saving ? (
                            <Loader className="w-4 h-4 inline mr-2 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4 inline mr-2" />
                          )}
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={handleCancel}
                          disabled={saving}
                          className="px-6 py-3 border border-slate-600 text-slate-300 font-medium rounded-xl hover:border-slate-500 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <X className="w-4 h-4 inline mr-2" />
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                      >
                        <Edit3 className="w-4 h-4 inline mr-2" />
                        Edit Profile
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-slate-400 leading-relaxed">
                  {profileData.bio || 'Add a bio to tell others about yourself...'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <div className="border-b border-slate-700">
              <nav className="flex space-x-8">
                {[
                  { id: 'profile', label: 'Profile Details', icon: User },
                 
                ].map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-400'
                          : 'border-transparent text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </motion.div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl"
          >
            {activeTab === 'profile' && (
              <div className="space-y-8">
                <h3 className="text-2xl font-semibold text-white mb-6">Profile Information</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-medium text-slate-300">
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={profileData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-slate-900/30 border border-slate-700 rounded-xl text-slate-300">
                        {profileData.name || 'Not provided'}
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      {isEditing ? (
                        <input
                          type="email"
                          name="email"
                          value={profileData.email}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          placeholder="Enter your email"
                        />
                      ) : (
                        <div className="pl-12 pr-4 py-3 bg-slate-900/30 border border-slate-700 rounded-xl text-slate-300">
                          {profileData.email || 'Not provided'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      {isEditing ? (
                        <input
                          type="tel"
                          name="phone"
                          value={profileData.phone}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          placeholder="Enter your phone number"
                        />
                      ) : (
                        <div className="pl-12 pr-4 py-3 bg-slate-900/30 border border-slate-700 rounded-xl text-slate-300">
                          {profileData.phone || 'Not provided'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300">
                      Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      {isEditing ? (
                        <input
                          type="text"
                          name="location"
                          value={profileData.location}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          placeholder="Enter your location"
                        />
                      ) : (
                        <div className="pl-12 pr-4 py-3 bg-slate-900/30 border border-slate-700 rounded-xl text-slate-300">
                          {profileData.location || 'Not provided'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Birth Date */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300">
                      Birth Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      {isEditing ? (
                        <input
                          type="date"
                          name="birthDate"
                          value={profileData.birthDate}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      ) : (
                        <div className="pl-12 pr-4 py-3 bg-slate-900/30 border border-slate-700 rounded-xl text-slate-300">
                          {profileData.birthDate || 'Not provided'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      name="bio"
                      value={profileData.bio}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <div className="px-4 py-3 bg-slate-900/30 border border-slate-700 rounded-xl text-slate-300 min-h-[100px]">
                      {profileData.bio || 'No bio provided'}
                    </div>
                  )}
                </div>
              </div>
            )}

            

           
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default StudentAccount;