import React, { useState, ChangeEvent, KeyboardEvent } from 'react';
import { searchFAQs } from '@/services/chatbotApi'; // Adjust the import path as necessary

type Message = {
  sender: "user" | "bot";
  text: string;
};

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { sender: "bot", text: "Hi! Ask me anything about our website." }
  ]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages([...messages, { sender: "user", text: input }]);
    setLoading(true);
    try {
      // Call your backend API using your client
      const data = await searchFAQs(input);
      if (data.answers && data.answers.length > 0) {
        data.answers.forEach(answer =>
          setMessages(prev => [
            ...prev,
            { sender: "bot", text: answer }
          ])
        );
      } else {
        setMessages(prev => [
          ...prev,
          { sender: "bot", text: "Sorry, I couldn't find anything related." }
        ]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { sender: "bot", text: "Sorry, there was an error fetching the answer." }
      ]);
    }
    setInput("");
    setLoading(false);
  };

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value);
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="w-80 bg-white rounded-xl shadow-lg p-4 font-sans">
      <div className="flex flex-col gap-2 min-h-[200px] max-h-[300px] overflow-y-auto mb-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`max-w-[80%] p-2 rounded ${
              msg.sender === "user"
                ? "self-end bg-blue-100"
                : "self-start bg-gray-100"
            }`}
          >
            <b>{msg.sender === "user" ? "You" : "Bot"}:</b> {msg.text}
          </div>
        ))}
        {loading && (
          <div className="self-start bg-gray-100 p-2 rounded max-w-[80%] animate-pulse">
            <b>Bot:</b> Searching...
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Type your question..."
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          className="flex-1 p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          disabled={loading}
        />
        <button
          onClick={handleSend}
          className={`bg-blue-600 text-white px-4 py-2 rounded transition ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"}`}
          disabled={loading}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBot;