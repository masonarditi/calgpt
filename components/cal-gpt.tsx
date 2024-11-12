'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"

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
   
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim()) {
      setMessages(prevMessages => [...prevMessages, { text: input, sender: 'user' }]);
      setIsLoading(true);
      
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          query: input,
          limit: 1,
          wishlist: {} 
        })
      };

      console.log('Sending request:', options);

      fetch('http://localhost:3001/proxy', options)
        .then(async response => {
          console.log('Response status:', response.status);
          const data = await response.json();
          console.log('Response data:', JSON.stringify(data, null, 2));
          if (!response.ok) throw new Error(data.error || 'Server error');
          return data;
        })
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
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-100 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-500">
      <header className="py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-center text-blue-600 dark:text-blue-400 animate-fade-in-down">
          CalGPT
        </h1>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl">
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden transition-shadow duration-300 hover:shadow-xl">
            <div className="p-6 space-y-4">
              <div className="space-y-4 mb-4 h-60 overflow-y-auto">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded-lg ${
                      message.sender === 'user' ? 'bg-blue-100 dark:bg-blue-900 ml-auto' : 'bg-gray-100 dark:bg-gray-700'
                    } max-w-[80%] ${message.sender === 'user' ? 'text-right' : 'text-left'}`}
                  >
                    {message.text}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                      <svg 
                        className="animate-spin h-5 w-5 text-blue-500" 
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
              </div>
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-grow"
                  disabled={isLoading}
                />
                <Button type="submit" size="icon" disabled={isLoading}>
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send</span>
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-4 px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500 dark:text-gray-400">
        © 2023 CalGPT. All rights reserved.
      </footer>
    </div>
  );
}
