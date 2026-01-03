import React from 'react';

const ProfileSettings = ({
    user,
    profileName,
    setProfileName,
    profileEmail,
    setProfileEmail,
    profilePhone,
    setProfilePhone,
    profileImagePreview,
    onProfileImageChange,
    onProfileSave,
    savingProfile,
}) => {
    return (
        <div className="bg-white border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Profile Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-28 h-28 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                            {profileImagePreview ? (
                                <img src={profileImagePreview} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-3xl font-bold text-gray-400">
                                    {profileName?.[0]?.toUpperCase() || user.name?.[0]?.toUpperCase() || 'U'}
                                </div>
                            )}
                        </div>
                        <label className="cursor-pointer inline-block">
                            <span className="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white">Change Photo</span>
                            <input type="file" accept="image/*" className="hidden" onChange={onProfileImageChange} />
                        </label>
                    </div>
                </div>
                <div className="md:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                value={profileName}
                                onChange={(e) => setProfileName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                value={profileEmail}
                                onChange={(e) => setProfileEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input
                                type="tel"
                                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                value={profilePhone}
                                onChange={(e) => setProfilePhone(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                            <input
                                type="text"
                                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Optional"
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex items-center gap-3">
                        <button
                            onClick={onProfileSave}
                            disabled={savingProfile}
                            className={`px-4 py-2 rounded-md text-white ${savingProfile ? 'bg-gray-400' : 'bg-purple-600 hover:bg-purple-700'}`}
                        >
                            {savingProfile ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                            onClick={() => {
                                setProfileName(user.name || '');
                                setProfileEmail(user.email || '');
                                setProfilePhone('');
                            }}
                            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettings;

