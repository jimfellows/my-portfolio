'use client'
import { useState, useRef, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import Image from './Image'

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [localInput, setLocalInput] = useState('')
  const { messages, sendMessage, status, error, setMessages } = useChat({
    onError: (err) => {
      const errString = err.message || JSON.stringify(err);
      if (errString.includes('429') || errString.includes('Rate limit')) {
        // Handled silently for UX
      }
    },
    onFinish: (context) => {
        // The SDK might return { message: ... } or just the message depending on version/stream type
        const msg = (context as any).message || context;

        // Check for content string OR text parts
        const hasContent = msg.content && msg.content.length > 0;
        const hasTextParts = msg.parts && Array.isArray(msg.parts) && msg.parts.some((p: any) => p.type === 'text' && p.text && p.text.length > 0);

        if (!hasContent && !hasTextParts) {
             setMessages(prev => {
                const lastMsg = prev[prev.length - 1] as any;
                if (lastMsg && lastMsg.content && lastMsg.content.includes('*Hiss!*')) return prev;
                
                return [...prev, {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: "🐱 *Hiss!* I'm getting too much attention (rate limited). Please try again in a minute!",
                 } as any];
             });
        }
    }
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const isLoading = status === 'submitted' || status === 'streaming';

  const toggleChat = () => {
    setIsOpen(!isOpen)
  }

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen, isLoading])

  // Handle Rate Limit / Quota Errors
  useEffect(() => {
    if (error) {
        // Combine all possible error sources for checking
        const errorString = (error.message || '') + JSON.stringify(error);
        if (errorString.includes('429') || errorString.includes('Rate limit') || errorString.includes('Resource Exhausted')) {
             setMessages(prev => {
                const lastMsg = prev[prev.length - 1] as any;
                if (lastMsg && lastMsg.content && lastMsg.content.includes('*Hiss!*')) return prev;
                
                return [...prev, {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: "🐱 *Hiss!* I'm getting too much attention (rate limited). Please try again in a minute!",
                 } as any];
             });
        }
    }
  }, [error, setMessages])

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!localInput.trim()) return

    const messageToSend = localInput;
    setLocalInput('') // Optimistic clear
    
    try {
        await sendMessage({ role: 'user', content: messageToSend } as any);
    } catch (err) {
        console.error('SendMessage failed:', err);
    }
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
                  src="/static/winston_headshot.jpg"
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
          <div className="h-[60vh] max-h-[500px] space-y-4 overflow-y-auto bg-gray-50 p-4 dark:bg-gray-900">
            {/* Initial Greeting */}
            {messages.length === 0 && !error && (
              <div className="flex items-start space-x-2">
                <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full">
                  <Image
                    src="/static/winston_headshot.jpg"
                    alt="Winston Avatar"
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                </div>
                <div className="rounded-tr-xl rounded-br-xl rounded-bl-xl border border-gray-100 bg-white p-3 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
                  <p>
                    Hi, I'm an avatar of Jim's cat, trained to answer questions about his
                    professional work. Ask me about Jim, or how I was built!
                  </p>
                </div>
              </div>
            )}
            
            {/* Error Message - Only show if it's NOT a rate limit error */}
            {error && !error.message.includes('429') && !error.message.includes('Rate limit') && !error.message.includes('Resource Exhausted') && (
               <div className="flex items-start space-x-2">
                <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full">
                  <Image
                    src="/static/winston_headshot.jpg"
                    alt="Winston Avatar"
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                </div>
                <div className="rounded-tr-xl rounded-br-xl rounded-bl-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 shadow-sm dark:border-red-900 dark:bg-red-900/20 dark:text-red-200">
                  <p>
                    ⚠️ <strong>Meow?</strong> Something went wrong. I might be having trouble reaching my brain (the API). Please try again later!
                  </p>
                </div>
              </div>
            )}

            {/* Chat History */}
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex items-start space-x-2 ${
                  m.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-full">
                  {m.role === 'user' ? (
                    <div className="flex h-full w-full items-center justify-center bg-gray-300 text-gray-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  ) : (
                    <Image
                      src="/static/winston_headshot.jpg"
                      alt="Winston Avatar"
                      width={32}
                      height={32}
                      className="object-cover"
                    />
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[80%] rounded-xl p-3 text-sm shadow-sm ${
                    m.role === 'user'
                      ? 'bg-primary-500 text-white'
                      : 'border border-gray-100 bg-white dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200'
                  }`}
                >
                  <div className="whitespace-pre-wrap">
                    {(m as any).content}
                    {(m as any).parts?.map((part: any, i: number) => 
                      part.type === 'text' ? <span key={i}>{part.text}</span> : null
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Loading Indicator */}
            {isLoading && (
               <div className="flex items-start space-x-2">
                <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-full">
                  <Image
                    src="/static/winston_headshot.jpg"
                    alt="Winston Avatar"
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                </div>
                <div className="rounded-tr-xl rounded-br-xl rounded-bl-xl border border-gray-100 bg-white p-3 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]"></div>
                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]"></div>
                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
            <form onSubmit={handleFormSubmit} className="flex items-center space-x-2">
              <input
                value={localInput}
                onChange={(e) => setLocalInput(e.target.value)}
                type="text"
                placeholder="Ask me anything..."
                className="focus:border-primary-500 focus:ring-primary-500 flex-1 rounded-full border-gray-300 bg-gray-100 px-4 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              />
              <button
                type="submit"
                className="bg-primary-500 hover:bg-primary-600 rounded-full p-2 text-white focus:outline-none disabled:opacity-50"
                disabled={!localInput.trim()}
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
            </form>
            <div className="mt-2 text-center text-xs text-gray-400">
              <p>AI can make mistakes.</p>
              <p className="font-semibold text-primary-500">Built with Gemini + pgvector</p>
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
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
            <path d="M12.0003 21.0858C11.666 16.4808 8.01918 12.834 3.41422 12.5C8.01918 12.166 11.666 8.51918 12.0003 3.91422C12.3344 8.51918 15.9813 12.166 20.5862 12.5C15.9813 12.834 12.3344 16.4808 12.0003 21.0858Z" />
          </svg>
        </button>
      )}
    </div>
  )
}

export default ChatWidget
