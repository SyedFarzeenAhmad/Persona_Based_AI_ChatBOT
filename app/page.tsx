"use client"

import { useEffect, useRef, useState } from "react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

interface StreamPayload {
  content?: string
  error?: string
}

const PERSONAS = [
  {
    id: "anshuman",
    name: "Anshuman Singh",
    color: "from-blue-500 to-blue-600",
    description: "Calm, exacting, Socratic",
  },
  {
    id: "abhimanyu",
    name: "Abhimanyu Saxena",
    color: "from-purple-500 to-purple-600",
    description: "Direct, strategic, founder-mode",
  },
  {
    id: "kshitij",
    name: "Kshitij Mishra",
    color: "from-pink-500 to-pink-600",
    description: "Warm, energetic, hands-on",
  },
] as const

type PersonaId = (typeof PERSONAS)[number]["id"]

const SUGGESTION_CHIPS: Record<PersonaId, string[]> = {
  anshuman: [
    "Be strict: what is wrong with my DP thinking?",
    "Help me reason from first principles",
    "Don't give code, guide my algorithm approach",
  ],
  abhimanyu: [
    "Give me the blunt production view",
    "Should I optimize for speed or scale right now?",
    "What breaks first in this architecture?",
  ],
  kshitij: [
    "Pair-debug this Next.js bug with me",
    "Tell me the most likely root cause first",
    "Give me one practical fix to try right now",
  ],
}

function createMessage(role: Message["role"], content: string): Message {
  return {
    id: crypto.randomUUID(),
    role,
    content,
  }
}

function parseSseEvent(block: string) {
  let event = "message"
  const dataLines: string[] = []

  for (const line of block.split("\n")) {
    if (!line || line.startsWith(":")) {
      continue
    }

    if (line.startsWith("event:")) {
      event = line.slice(6).trim()
      continue
    }

    if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).trim())
    }
  }

  if (dataLines.length === 0) {
    return null
  }

  try {
    return {
      event,
      payload: JSON.parse(dataLines.join("\n")) as StreamPayload,
    }
  } catch {
    throw new Error("Received a malformed streaming response from the server.")
  }
}

async function readErrorMessage(response: Response) {
  const contentType = response.headers.get("content-type") ?? ""

  if (contentType.includes("application/json")) {
    const data = await response.json().catch(() => null)
    if (data?.error) {
      return data.error as string
    }
  }

  const text = await response.text().catch(() => "")
  return text || `Request failed with status ${response.status}`
}

async function readAssistantStream(
  stream: ReadableStream<Uint8Array>,
  onContent: (content: string) => void
) {
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let buffer = ""
  let latestContent = ""

  const processBuffer = (flush = false) => {
    let delimiterIndex = buffer.indexOf("\n\n")

    while (delimiterIndex !== -1) {
      const rawEvent = buffer.slice(0, delimiterIndex).trim()
      buffer = buffer.slice(delimiterIndex + 2)

      if (rawEvent) {
        const parsedEvent = parseSseEvent(rawEvent)
        if (parsedEvent?.event === "token" || parsedEvent?.event === "done") {
          if (typeof parsedEvent.payload.content === "string") {
            latestContent = parsedEvent.payload.content
            onContent(latestContent)
          }
        }

        if (parsedEvent?.event === "error") {
          throw new Error(parsedEvent.payload.error || "The model stream failed.")
        }
      }

      delimiterIndex = buffer.indexOf("\n\n")
    }

    if (flush && buffer.trim()) {
      const parsedEvent = parseSseEvent(buffer.trim())
      buffer = ""

      if (parsedEvent?.event === "token" || parsedEvent?.event === "done") {
        if (typeof parsedEvent.payload.content === "string") {
          latestContent = parsedEvent.payload.content
          onContent(latestContent)
        }
      }

      if (parsedEvent?.event === "error") {
        throw new Error(parsedEvent.payload.error || "The model stream failed.")
      }
    }
  }

  while (true) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }

    buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n")
    processBuffer()
  }

  buffer += decoder.decode().replace(/\r\n/g, "\n")
  processBuffer(true)

  return latestContent
}

export default function ChatPage() {
  const [activePersona, setActivePersona] = useState<PersonaId>("anshuman")
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const activeRequestIdRef = useRef(0)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: isLoading ? "auto" : "smooth",
    })
  }, [isLoading, messages])

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  const updateAssistantMessage = (messageId: string, content: string) => {
    setMessages((prev) =>
      prev.map((message) =>
        message.id === messageId ? { ...message, content } : message
      )
    )
  }

  const handlePersonaChange = (personaId: PersonaId) => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
    activeRequestIdRef.current += 1

    setActivePersona(personaId)
    setMessages([])
    setError(null)
    setInputValue("")
    setIsLoading(false)
  }

  const handleSendMessage = async (rawMessageText: string) => {
    const messageText = rawMessageText.trim()
    if (!messageText || isLoading) {
      return
    }

    abortControllerRef.current?.abort()

    const requestId = activeRequestIdRef.current + 1
    activeRequestIdRef.current = requestId

    const controller = new AbortController()
    abortControllerRef.current = controller

    const personaAtSend = activePersona
    const userMessage = createMessage("user", messageText)
    const assistantMessage = createMessage("assistant", "")
    const requestMessages = [
      ...messages.map(({ role, content }) => ({ role, content })),
      { role: "user" as const, content: messageText },
    ]

    setMessages((prev) => [...prev, userMessage, assistantMessage])
    setInputValue("")
    setError(null)
    setIsLoading(true)

    let latestAssistantContent = ""

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          messages: requestMessages,
          activePersona: personaAtSend,
        }),
      })

      if (!response.ok) {
        throw new Error(await readErrorMessage(response))
      }

      if (!response.body) {
        throw new Error("The response stream was empty.")
      }

      const contentType = response.headers.get("content-type") ?? ""

      if (contentType.includes("text/event-stream")) {
        latestAssistantContent = await readAssistantStream(response.body, (content) => {
          latestAssistantContent = content

          if (activeRequestIdRef.current !== requestId) {
            return
          }

          updateAssistantMessage(assistantMessage.id, content)
        })
      } else {
        const data = await response.json()
        if (typeof data.content !== "string" || !data.content.trim()) {
          throw new Error("The model returned an empty response.")
        }

        latestAssistantContent = data.content
        if (activeRequestIdRef.current === requestId) {
          updateAssistantMessage(assistantMessage.id, data.content)
        }
      }

      if (!latestAssistantContent.trim()) {
        throw new Error("The model returned an empty response.")
      }
    } catch (err) {
      if (controller.signal.aborted) {
        return
      }

      const errorMessage =
        err instanceof Error ? err.message : "Failed to get response"

      if (activeRequestIdRef.current === requestId) {
        setMessages((prev) => {
          if (latestAssistantContent) {
            return prev.map((message) =>
              message.id === assistantMessage.id
                ? { ...message, content: latestAssistantContent }
                : message
            )
          }

          return prev.filter((message) => message.id !== assistantMessage.id)
        })
        setError(errorMessage)
      }

      console.error("Chat error:", err)
    } finally {
      if (activeRequestIdRef.current === requestId) {
        abortControllerRef.current = null
        setIsLoading(false)
        inputRef.current?.focus()
      }
    }
  }

  const currentPersona =
    PERSONAS.find((persona) => persona.id === activePersona) ?? PERSONAS[0]
  const suggestions = SUGGESTION_CHIPS[activePersona]
  const showTypingIndicator =
    isLoading &&
    messages[messages.length - 1]?.role === "assistant" &&
    messages[messages.length - 1]?.content === ""

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="border-b border-slate-700 bg-slate-800/50 p-4 backdrop-blur">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-2 text-2xl font-bold">Persona-Based AI Chatbot</h1>
          <p className="text-sm text-slate-300">
            Chat with distinct AI personalities - each with unique perspectives
          </p>
        </div>
      </header>

      <div className="border-b border-slate-700 bg-slate-800/30 p-4 backdrop-blur">
        <div className="mx-auto max-w-4xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Select Persona
          </p>
          <div className="flex flex-wrap gap-3">
            {PERSONAS.map((persona) => (
              <button
                key={persona.id}
                onClick={() => handlePersonaChange(persona.id)}
                className={`rounded-lg px-4 py-2 font-medium transition-all duration-200 ${
                  activePersona === persona.id
                    ? `bg-gradient-to-r ${persona.color} scale-105 text-white shadow-lg`
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

      <div className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto flex h-full w-full max-w-4xl flex-col gap-4">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center space-y-6 py-12 text-center">
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r ${currentPersona.color}`}
              >
                <span className="text-lg font-bold">AI</span>
              </div>
              <div>
                <h2 className="mb-2 text-2xl font-bold">
                  Chat with {currentPersona.name}
                </h2>
                <p className="max-w-sm text-slate-400">
                  {currentPersona.description} - Ask me anything!
                </p>
              </div>

              <div className="flex w-full max-w-sm flex-col gap-2">
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Suggested Questions
                </p>
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSendMessage(suggestion)}
                    disabled={isLoading}
                    className="rounded-lg border border-slate-600 bg-slate-700/50 p-3 text-left text-sm transition-colors hover:border-slate-500 hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-2xl rounded-lg px-4 py-3 ${
                  message.role === "user"
                    ? "rounded-br-none bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                    : "rounded-bl-none bg-slate-700 text-slate-100"
                }`}
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content}
                </p>
              </div>
            </div>
          ))}

          {showTypingIndicator && (
            <div className="flex items-center space-x-2 p-3">
              <div className="flex items-center space-x-1">
                <span className="typing-dot inline-block h-2 w-2 rounded-full bg-slate-400" />
                <span
                  className="typing-dot inline-block h-2 w-2 rounded-full bg-slate-400"
                  style={{ animationDelay: "0.2s" }}
                />
                <span
                  className="typing-dot inline-block h-2 w-2 rounded-full bg-slate-400"
                  style={{ animationDelay: "0.4s" }}
                />
              </div>
              <span className="text-sm text-slate-400">
                {currentPersona.name} is thinking...
              </span>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-700 bg-red-900/20 p-4 text-sm text-red-200">
              <p className="mb-1 font-semibold">Oops! Something went wrong</p>
              <p>{error}</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-slate-700 bg-slate-800/50 p-4 backdrop-blur">
        <div className="mx-auto max-w-4xl">
          <form
            onSubmit={(event) => {
              event.preventDefault()
              handleSendMessage(inputValue)
            }}
            className="flex gap-3"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              disabled={isLoading}
              placeholder={`Ask ${currentPersona.name}...`}
              className="flex-1 rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-white placeholder-slate-400 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-medium text-white transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Streaming..." : "Send"}
            </button>
          </form>
          <p className="mt-2 text-xs text-slate-400">
            Press Enter or click Send to message {currentPersona.name}
          </p>
        </div>
      </div>
    </div>
  )
}
