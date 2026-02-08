'use client'
import { useState } from 'react'
import Image from './Image'

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleChat = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className="fixed right-4 bottom-4 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 flex w-80 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl transition-all duration-300 ease-in-out dark:border-gray-700 dark:bg-gray-800">
          {/* Header */}
          <div className="bg-primary-500 flex items-center justify-between p-4 text-white">
            <div className="flex items-center space-x-2">
              <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-white">
                <Image
                  src="/static/winston_glasses_down.png"
                  alt="Winston Avatar"
                  width={48}
                  height={48}
                  className="object-cover"
                />
              </div>
              <h3 className="text-sm font-bold">Chat with Winston</h3>
            </div>
            <button
              onClick={toggleChat}
              className="text-white hover:text-gray-200 focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* Messages Area */}
          <div className="h-64 space-y-4 overflow-y-auto bg-gray-50 p-4 dark:bg-gray-900">
            <div className="flex items-start space-x-2">
              <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full">
                <Image
                  src="/static/winston_glasses_down.png"
                  alt="Winston Avatar"
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
              <div className="rounded-tr-xl rounded-br-xl rounded-bl-xl border border-gray-100 bg-white p-3 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
                <p>
                  Hi, I'm an avatar of Jim's cat, trained to answer questions about his professional
                  work. Ask me about Jim, or how I was built!
                </p>
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Ask me anything..."
                className="focus:border-primary-500 focus:ring-primary-500 flex-1 rounded-full border-gray-300 bg-gray-100 px-4 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                disabled
              />
              <button
                className="bg-primary-500 hover:bg-primary-600 rounded-full p-2 text-white focus:outline-none disabled:opacity-50"
                disabled
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
            <div className="mt-2 text-center text-xs text-gray-400">
              <p>AI can make mistakes.</p>
              <p className="text-primary-500 font-semibold">Built with Gemini + pgvector</p>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="bg-primary-500 hover:bg-primary-600 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-110 focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </button>
      )}
    </div>
  )
}

export default ChatWidget
