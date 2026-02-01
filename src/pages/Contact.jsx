import React, { useState } from "react";
import {
    FaEnvelope,
    FaPhoneAlt,
    FaMapMarkerAlt,
    FaFacebookF,
    FaFacebookMessenger,
    FaWhatsapp,
    FaComments,
} from "react-icons/fa";

const Contact = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(formData);
        alert("Thank you for contacting us! We'll get back to you soon.");
        setFormData({ name: "", email: "", message: "" });
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Page Title */}
            <h1 className="text-3xl md:text-4xl font-bold mb-6 text-purple-700 text-center">
                Contact Us
            </h1>

            <p className="text-center text-gray-700 mb-10">
                Have questions or need support? Fill out the form below or reach us
                directly through email, phone, social media, or live chat.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Contact Form */}
                <form
                    onSubmit={handleSubmit}
                    className="bg-purple-50 p-6 rounded-lg shadow-md space-y-4"
                >
                    <input
                        type="text"
                        name="name"
                        placeholder="Your Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full p-3 rounded border border-gray-300 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 outline-none"
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Your Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full p-3 rounded border border-gray-300 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 outline-none"
                    />
                    <textarea
                        name="message"
                        placeholder="Your Message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        className="w-full p-3 rounded border border-gray-300 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 outline-none resize-none"
                    />
                    <button
                        type="submit"
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded transition-colors"
                    >
                        Send Message
                    </button>
                </form>

                {/* Contact Info & Social */}
                <div className="space-y-6">
                    {/* Email */}
                    <div className="flex items-start gap-4">
                        <FaEnvelope className="text-purple-600 mt-1" size={24} />
                        <div>
                            <h3 className="font-semibold text-purple-700">Email</h3>
                            <p className="text-gray-700">support@sarkershop.com</p>
                        </div>
                    </div>

                    {/* Phone */}
                    <div className="flex items-start gap-4">
                        <FaPhoneAlt className="text-purple-600 mt-1" size={24} />
                        <div>
                            <h3 className="font-semibold text-purple-700">Phone</h3>
                            <p className="text-gray-700">+880 1234 567 890</p>
                        </div>
                    </div>

                    {/* Address */}
                    <div className="flex items-start gap-4">
                        <FaMapMarkerAlt className="text-purple-600 mt-1" size={24} />
                        <div>
                            <h3 className="font-semibold text-purple-700">Address</h3>
                            <p className="text-gray-700">
                                123 Market Street, Dhaka, Bangladesh
                            </p>
                        </div>
                    </div>

                    {/* Social Media */}
                    <div className="flex flex-wrap gap-4 mt-4">
                        <a
                            href="https://www.facebook.com/shopsarker"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        >
                            <FaFacebookF /> Facebook
                        </a>
                        <a
                            href="https://m.me/shopsarker"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                        >
                            <FaFacebookMessenger /> Messenger
                        </a>
                        <a
                            href="https://wa.me/+8801781355377"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                        >
                            <FaWhatsapp /> WhatsApp
                        </a>
                        <button
                            onClick={() => alert("Live chat opened!")}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
                        >
                            <FaComments /> Live Chat
                        </button>
                    </div>

                    {/* Map Placeholder */}
                    <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 mt-6">
                        Map Placeholder
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
