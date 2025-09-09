import React, { useState, useEffect } from "react";

const SupportChat = ({ onClose }) => {
    const [messages, setMessages] = useState([
        { from: "support", text: "Hi! How can we help you today?" }
    ]);
    const [input, setInput] = useState("");
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Trigger the animation after mount
        setVisible(true);
        return () => setVisible(false);
    }, []);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        setMessages([...messages, { from: "user", text: input }]);
        setInput("");
        // Here you could add logic to send the message to a backend or bot
    };

    // Handle close with animation
    const handleClose = () => {
        setVisible(false);
        setTimeout(onClose, 300); // Match the transition duration
    };

    return (
        <div
            className={`
        fixed bottom-24 right-8 w-80 bg-white rounded-lg shadow-lg flex flex-col z-50
        transition-all duration-300
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"}
      `}
            style={{ willChange: "opacity, transform" }}
        >
            <div className="bg-primary-500 text-white px-1 py-1 rounded-t-lg flex justify-between items-center">
                <span>Support Chat</span>
                <button onClick={handleClose} className="bg-white text-primary-500 p-1 text-2xl cursor-pointer rounded-sm font-bold">&times;</button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto max-h-64">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`mb-2 ${msg.from === "user" ? "text-right" : "text-left"}`}
                    >
                        <span
                            className={`inline-block px-3 py-1 rounded-lg ${msg.from === "user"
                                    ? "bg-primary-100 text-primary-700"
                                    : "bg-gray-200 text-gray-800"
                                }`}
                        >
                            {msg.text}
                        </span>
                    </div>
                ))}
            </div>
            <form onSubmit={handleSend} className="flex border-t">
                <input
                    className="flex-1 px-3 py-2 outline-none"
                    type="text"
                    placeholder="Type your message..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                />
                <button
                    type="submit"
                    className="bg-primary-500 text-white px-4 py-2 rounded-r-lg hover:bg-primary-600"
                >
                    Send
                </button>
            </form>
        </div>
    );
};

export default SupportChat;