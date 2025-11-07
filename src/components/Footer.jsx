import React, { useState } from "react";
import { FaFacebookF, FaTwitter, FaInstagram, FaArrowUp, FaHeadset } from "react-icons/fa";
import SupportChat from "./SupportChat"; // Import the chat component

const Footer = () => {
    const [chatOpen, setChatOpen] = useState(false);

    return (
        <>
            <footer className="bg-[#1a202c] text-gray-300 pt-10 pb-0 relative hidden md:block">
                <div className="max-w-auto mx-auto px-6">
                    <div className="grid grid-cols-4 gap-8 pb-8">
                        {/* Brand & Contact */}
                        <div>
                            <h2 className="text-2xl font-bold mb-2">
                                <span className="text-purple-600">Sarker</span>
                                <span className="text-white"> Shop</span>
                            </h2>
                            <p>Botrish, Kishoreganj<br />Dhaka</p>
                            <p className="mt-2">Email:<br />support@sarker.shop</p>
                            <p>Phone: +01781 355 377</p>
                        </div>
                        {/* Customer Service */}
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">Customer Service</h3>
                            <ul>
                                <li className="mb-1"><span className="font-semibold text-white">FAQs</span></li>
                                <li className="mb-1">Shipping &amp; Returns</li>
                                <li>Order Tracking</li>
                            </ul>
                        </div>
                        {/* Social */}
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">Follow Us</h3>
                            <div className="flex space-x-4 mt-2">
                                <a href="#" className="hover:text-primary-500"><FaFacebookF size={22} /></a>
                                <a href="#" className="hover:text-primary-500"><FaTwitter size={22} /></a>
                                <a href="#" className="hover:text-primary-500"><FaInstagram size={22} /></a>
                            </div>
                        </div>
                        {/* Newsletter */}
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">Stay in the Loop</h3>
                            <p className="mb-3">Get special offers and more.</p>
                            <form className="flex border-2 border-purple-500 rounded-md overflow-hidden">
                                <input
                                    type="email"
                                    placeholder="Your email"
                                    className="rounded-l-md px-4 py-2 w-full text-gray-900 focus:outline-none"
                                />
                                <button
                                    type="submit"
                                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-r-md font-semibold"
                                >
                                    Subscribe
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
                {/* Bottom bar */}
                <div className="bg-black text-center py-3 text-gray-300 text-sm relative">
                    © 2026 Sarker Shop. All rights reserved.
                    {/* Scroll to top button */}
                    {/* Support Button */}
                    <button
                        onClick={() => setChatOpen(true)}
                        className="fixed right-8 bottom-8 bg-purple-500 hover:bg-purple-600 text-white rounded-full p-3 shadow-lg transition-colors z-50 cursor-pointer"
                        aria-label="Support"
                        title="Support"
                    >
                        <FaHeadset size={20} />
                    </button>
                </div>
            </footer>

            {/* Chat Window */}
            {chatOpen && <SupportChat onClose={() => setChatOpen(false)} />}
        </>
    );
};

export default Footer;