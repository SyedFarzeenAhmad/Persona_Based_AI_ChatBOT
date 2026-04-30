"use client"

import { useState, useRef, useEffect } from "react"

interface Message {
  role: "user" | "assistant"
  content: string
}

const PERSONAS = [
  {
    id: "anshuman",
    name: "Anshuman Singh",
    color: "from-blue-500 to-blue-600",
    description: "First-Principles Master",
  },
  {
    id: "abhimanyu",
    name: "Abhimanyu Saxena",
    color: "from-purple-500 to-purple-600",
    description: "System Architecture Realist",
  },
  {
    id: "kshitij",
    name: "Kshitij Mishra",
    color: "from-pink-500 to-pink-600",
    description: "Pragmatic Full-Stack Mentor",
  },
]

const SUGGESTION_CHIPS = {
  anshuman: [
    "How do I optimize my algorithm?",
    "Explain time and space complexity",
    "What's the best approach for dynamic programming?",
  ],
  abhimanyu: [
    "How should I design my system for scale?",
    "SQL vs NoSQL - which should I use?",
    "What are the key trade-offs in microservices?",
  ],
  kshitij: [
    "Help me debug my Next.js app",
    "How do I fix CORS errors?",
    "What's the best way to structure a full-stack app?",
  ],
}

export default function ChatPage() {
  const [activePersona, setActivePersona] = useState<string>("anshuman")
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Reset messages when persona changes
  const handlePersonaChange = (personaId: string) => {
    setActivePersona(personaId)
    setMessages([])
    setError(null)
    setInputValue("")
  }

  // Handle sending a message
  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim()) return

    // Add user message to the chat
    const userMessage: Message = { role: "user", content: messageText }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInputValue("")
    setError(null)
    setIsLoading(true)

    try {
      // Send request to backend API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: newMessages,
          activePersona,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.error || `API error: ${response.statusText}`
        )
      }

      // Handle streaming or standard JSON response
      if (response.headers.get("content-type")?.includes("text/event-stream")) {
        // Handle streaming response
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        let assistantMessage = ""

        if (reader) {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value)
            const lines = chunk.split("\n")

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const data = JSON.parse(line.slice(6))
                  if (data.content) {
                    assistantMessage += data.content
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }

            // Update message in real-time for streaming
            setMessages((prev) => [
              ...prev.slice(0, -1),
              { role: "assistant", content: assistantMessage },
            ])
          }
        }
      } else {
        // Handle standard JSON response
        const data = await response.json()
        const assistantMessage: Message = {
          role: "assistant",
          content: data.content,
        }
        setMessages((prev) => [...prev, assistantMessage])
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to get response"
      setError(errorMessage)
      console.error("Chat error:", err)
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const currentPersona = PERSONAS.find((p) => p.id === activePersona)!
  const suggestions = SUGGESTION_CHIPS[activePersona as keyof typeof SUGGESTION_CHIPS]

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur border-b border-slate-700 p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">Persona-Based AI Chatbot</h1>
          <p className="text-sm text-slate-300">
            Chat with distinct AI personalities - each with unique perspectives
          </p>
        </div>
      </header>

      {/* Persona Switcher */}
      <div className="bg-slate-800/30 backdrop-blur border-b border-slate-700 p-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
            Select Persona
          </p>
          <div className="flex flex-wrap gap-3">
            {PERSONAS.map((persona) => (
              <button
                key={persona.id}
                onClick={() => handlePersonaChange(persona.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activePersona === persona.id
                    ? `bg-gradient-to-r ${persona.color} text-white shadow-lg scale-105`
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                <div className="text-sm font-semibold">{persona.name}</div>
                <div className="text-xs opacity-75">{persona.description}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="max-w-4xl mx-auto w-full">
          {/* Empty State with Suggestions */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-12 space-y-6">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${currentPersona.color} flex items-center justify-center`}>
                <span className="text-2xl font-bold">✨</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  Chat with {currentPersona.name}
                </h2>
                <p className="text-slate-400 max-w-sm">
                  {currentPersona.description} - Ask me anything!
                </p>
              </div>

              {/* Suggestion Chips */}
              <div className="flex flex-col gap-2 w-full max-w-sm">
                <p className="text-xs text-slate-400 uppercase font-semibold">
                  Suggested Questions
                </p>
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(suggestion)}
                    className="p-3 text-left rounded-lg bg-slate-700/50 hover:bg-slate-600 transition-colors text-sm border border-slate-600 hover:border-slate-500"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((message, idx) => (
            <div
              key={idx}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-2xl rounded-lg px-4 py-3 ${
                  message.role === "user"
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-none"
                    : "bg-slate-700 text-slate-100 rounded-bl-none"
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex items-center space-x-2 p-3">
              <div className="flex items-center space-x-1">
                <span className="inline-block w-2 h-2 bg-slate-400 rounded-full typing-dot" />
                <span className="inline-block w-2 h-2 bg-slate-400 rounded-full typing-dot" style={{ animationDelay: "0.2s" }} />
                <span className="inline-block w-2 h-2 bg-slate-400 rounded-full typing-dot" style={{ animationDelay: "0.4s" }} />
              </div>
              <span className="text-sm text-slate-400">
                {currentPersona.name} is thinking...
              </span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-lg bg-red-900/20 border border-red-700 text-red-200 text-sm">
              <p className="font-semibold mb-1">Oops! Something went wrong</p>
              <p>{error}</p>
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-slate-800/50 backdrop-blur border-t border-slate-700 p-4">
        <div className="max-w-4xl mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessage(inputValue)
            }}
            className="flex gap-3"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              placeholder={`Ask ${currentPersona.name}...`}
              className="flex-1 px-4 py-3 rounded-lg bg-slate-700 text-white placeholder-slate-400 border border-slate-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 transition-all"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all text-white hover:shadow-lg"
            >
              Send
            </button>
          </form>
          <p className="text-xs text-slate-400 mt-2">
            Press Enter or click Send to message {currentPersona.name}
          </p>
        </div>
      </div>
    </div>
  )
}
