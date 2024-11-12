'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"
import { sendQuery } from '@/lib/api';

// Define the Message type
type Message = {
  text: string;
  sender: string;
};

// Add this type definition at the top with other types
type SidResponse = {
  item_id: string;
  idx: number;
  content: string;
  uri: string;
  kind: string;
  file_name: string;
  file_type: string;
  time_added: string;
  time_authored: string;
  score: number;
  metadata: Record<string, unknown>;
}[];

export function CalGpt() {
  // Specify the type of messages
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim()) {
      setMessages(prevMessages => [...prevMessages, { text: input, sender: 'user' }]);
      setIsLoading(true);
      
      sendQuery(input)
        .then((response: SidResponse) => {
          console.log('Processing response:', response);
          if (response[0]?.content) {
            setMessages(prevMessages => [...prevMessages, { 
              text: response[0].content, 
              sender: 'bot' 
            }]);
          } else {
            throw new Error('No content in response');
          }
        })
        .catch(err => {
          console.error('Error in request:', err);
          setMessages(prevMessages => [...prevMessages, { 
            text: `Error: ${err.message}`, 
            sender: 'bot' 
          }]);
        })
        .finally(() => {
          setIsLoading(false);
          setInput('');
        });
    }
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-gradient-to-b from-[#003262] via-[#3B7EA1] to-[#FDB515] dark:from-[#003262] dark:via-[#1F3A93] dark:to-[#C4820E] transition-colors duration-500">
      <header className="py-4 px-4 sm:py-6 sm:px-6 lg:px-8 bg-[#003262] shadow-lg">
        <div className="flex items-center justify-center space-x-3">
          <img
            src="/BerkeleyLogoReal.png" 
            alt="Berkeley Logo" 
            className="h-8 w-auto"
          />
          <h1 className="text-2xl sm:text-4xl font-bold text-center text-[#FDB515] animate-fade-in-down">
            CalGPT
          </h1>
        </div>
        <p className="mt-2 text-center text-white text-sm sm:text-base">
          Your Berkeley Course Assistant
        </p>
      </header>

      <main className="flex-grow flex items-center justify-center p-2 sm:p-4 lg:p-8">
        <div className="w-full max-w-2xl">
          <div className="bg-white/95 dark:bg-gray-800/95 shadow-lg rounded-lg overflow-hidden transition-shadow duration-300 hover:shadow-xl backdrop-blur-sm">
            <div className="p-4 sm:p-6 space-y-4">
              <div className="space-y-4 mb-4 h-[60vh] sm:h-[50vh] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-blue-100 dark:scrollbar-thumb-blue-400 dark:scrollbar-track-gray-700">
                {messages.length === 0 && (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                    <p>Welcome to CalGPT! Ask me anything about Berkeley courses.</p>
                    <p className="text-sm mt-2">Example: What are the prerequisites for CS61A?</p>
                  </div>
                )}
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      message.sender === 'user' 
                        ? 'bg-[#003262] text-white ml-auto' 
                        : 'bg-[#FDB515] text-black'
                    } max-w-[85%] ${message.sender === 'user' ? 'text-right' : 'text-left'} shadow-sm`}
                  >
                    {message.text}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="p-3 rounded-lg bg-[#FDB515]/50 dark:bg-[#FDB515]/30">
                      <svg 
                        className="animate-spin h-5 w-5 text-[#003262]" 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24"
                      >
                        <circle 
                          className="opacity-25" 
                          cx="12" 
                          cy="12" 
                          r="10" 
                          stroke="currentColor" 
                          strokeWidth="4"
                        />
                        <path 
                          className="opacity-75" 
                          fill="currentColor" 
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Ask about Berkeley courses..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-grow bg-white/80 dark:bg-gray-700/80 border-[#003262] dark:border-[#FDB515] focus:ring-[#003262] dark:focus:ring-[#FDB515]"
                  disabled={isLoading}
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={isLoading}
                  className="bg-[#003262] hover:bg-[#003262]/80 dark:bg-[#FDB515] dark:hover:bg-[#FDB515]/80"
                >
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send</span>
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-3 px-4 sm:py-4 sm:px-6 lg:px-8 text-center text-xs sm:text-sm text-white bg-[#003262]/80">
        <p>© 2024 UC Berkeley. All rights reserved.</p>
        <p className="text-[#FDB515]">Go Bears! 🐻</p>
      </footer>
    </div>
  );
}
