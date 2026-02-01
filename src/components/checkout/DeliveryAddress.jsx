import React from "react";
import { FaHome, FaBuilding, FaCheck } from "react-icons/fa";

const DeliveryAddress = ({
    email,
    fullName,
    phone,
    division,
    district,
    subDistrict,
    address,
    addressType,
    onEmailChange,
    onFullNameChange,
    onPhoneChange,
    onDivisionChange,
    onDistrictChange,
    onSubDistrictChange,
    onAddressChange,
    onAddressTypeChange
}) => {
    return (
        <div className="mt-6 bg-white border rounded-lg p-4">
            <h2 className="text-xl font-bold mb-4 text-neutral-800">
                Delivery Address
            </h2>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                </label>
                <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full border rounded-md px-3 py-2"
                    value={email}
                    onChange={onEmailChange}
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        placeholder="Full Name"
                        className="w-full border rounded-md px-3 py-2"
                        value={fullName}
                        onChange={onFullNameChange}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        placeholder="Ex:01xxxxxxxxx"
                        className="w-full border rounded-md px-3 py-2"
                        value={phone}
                        onChange={onPhoneChange}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Division <span className="text-red-500">*</span>
                    </label>
                    <select
                        className="w-full border rounded-md px-3 py-2"
                        value={division}
                        onChange={onDivisionChange}
                    >
                        <option value="">Select Division</option>
                        <option>Dhaka</option>
                        <option>Chattogram</option>
                        <option>Rajshahi</option>
                        <option>Khulna</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        District <span className="text-red-500">*</span>
                    </label>
                    <select
                        className="w-full border rounded-md px-3 py-2"
                        value={district}
                        onChange={onDistrictChange}
                    >
                        <option value="">Select District</option>
                        {district && !["Dhaka", "Gazipur", "Narayanganj", "Kishoreganj", "Comilla", "Sylhet"].includes(district) && (
                            <option value={district}>{district}</option>
                        )}
                        <option>Dhaka</option>
                        <option>Gazipur</option>
                        <option>Narayanganj</option>
                        <option>Kishoreganj</option>
                        <option>Comilla</option>
                        <option>Sylhet</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sub District <span className="text-red-500">*</span>
                    </label>
                    <select
                        className="w-full border rounded-md px-3 py-2"
                        value={subDistrict}
                        onChange={onSubDistrictChange}
                    >
                        <option value="">Select Sub District</option>
                        {subDistrict && !["Uttara", "Banani", "Mirpur", "Kishoreganj", "Sadar"].includes(subDistrict) && (
                            <option value={subDistrict}>{subDistrict}</option>
                        )}
                        <option>Uttara</option>
                        <option>Banani</option>
                        <option>Mirpur</option>
                        <option>Kishoreganj</option>
                        <option>Sadar</option>
                    </select>
                </div>
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    placeholder="House no. / Building / Street"
                    className="w-full border rounded-md px-3 py-2"
                    value={address}
                    onChange={onAddressChange}
                />
            </div>
            <div className="flex gap-3">
                <button
                    className={`px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 ${addressType === "home" ? "" : "opacity-70"}`}
                    onClick={() => onAddressTypeChange("home")}
                >
                    <FaHome /> Home{" "}
                    {addressType === "home" && <FaCheck className="ml-1" />}
                </button>
                <button
                    className={`px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 ${addressType === "office" ? "" : "opacity-70"}`}
                    onClick={() => onAddressTypeChange("office")}
                >
                    <FaBuilding /> Office{" "}
                    {addressType === "office" && <FaCheck className="ml-1" />}
                </button>
            </div>
        </div>
    );
};

export default DeliveryAddress;

