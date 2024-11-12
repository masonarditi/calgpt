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

export function CalGpt() {
  // Specify the type of messages
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
   
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim()) {
      setMessages(prevMessages => [...prevMessages, { text: input, sender: 'user' }]);
      
      const options = {
        method: 'POST',
        headers: {
          Authorization: 'Bearer sid-sk-hxjGI-w3qIhCePjRM6_NK-xkTSaLkqq7_jl7SVMNn7LY',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: input, limit: 123, wishlist: {} })
      };

      fetch('https://designer-linear-algebra.sid.ai/query', options)
        .then(response => response.json())
        .then((response: { content: string }[]) => {
          const formattedResponse = response.map(item => item.content).join('\n\n');
          setMessages(prevMessages => [...prevMessages, { text: formattedResponse || "No response data", sender: 'bot' }]);
        })
        .catch(err => console.error(err));

      setInput('');
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
        <div className="w-full max-w-md">
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
              </div>
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-grow"
                />
                <Button type="submit" size="icon">
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
