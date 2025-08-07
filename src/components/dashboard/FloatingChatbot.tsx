import React, { useState } from "react";
import ChatBot from "./Chatbot";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/solid"; // Make sure you have @heroicons/react installed

const FloatingChatbot: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Floating button (circle) */}
      {!open && (
        <button
          className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center shadow-lg hover:bg-blue-700 transition"
          onClick={() => setOpen(true)}
          aria-label="Open Chatbot"
        >
          <ChatBubbleLeftRightIcon className="h-8 w-8 text-white" />
        </button>
      )}

      {/* Chatbot window with close button */}
      {open && (
        <div className="relative">
          <ChatBot />
          <button
            className="absolute -top-4 -right-4 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow hover:bg-red-600"
            onClick={() => setOpen(false)}
            aria-label="Close Chatbot"
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
};

export default FloatingChatbot;