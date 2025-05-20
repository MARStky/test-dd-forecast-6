"use client"

import { Badge } from "@/components/ui/badge"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot, Send, User, RefreshCw, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"

interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
}

// Fallback responses when API calls fail
const fallbackResponses = [
  "I'm having trouble connecting to the backend services right now. SageMaker Autopilot automates the machine learning workflow from data preparation to model deployment.",
  "There seems to be a connection issue. SageMaker Autopilot can automatically build, train, and tune the best machine learning models based on your data.",
  "I'm currently operating in offline mode. SageMaker Autopilot helps you build ML models without requiring ML expertise by automating algorithm selection and hyperparameter tuning.",
]

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "👋 Hi there! I'm your Amazon Bedrock powered assistant. Ask me anything about Amazon SageMaker Autopilot and how it can help with your machine learning workflows.",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOfflineMode, setIsOfflineMode] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setError(null)

    try {
      if (isOfflineMode) {
        throw new Error("Operating in offline mode")
      }

      // Call the API route that connects to Amazon Bedrock
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || `Error: ${response.status}`)
      }

      const data = await response.json()

      // Add assistant response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      console.error("Error sending message:", err)

      // Use fallback response in case of error
      const fallbackResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: fallbackResponse,
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsOfflineMode(true)
      setError("Connected in offline mode due to backend service issues. Using pre-defined responses.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="bg-gradient-to-r from-purple-100 to-purple-50 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-purple-600 p-2 rounded-lg">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>Amazon Bedrock Assistant</CardTitle>
              <CardDescription>Powered by Amazon Bedrock and SageMaker knowledge</CardDescription>
            </div>
          </div>
          {isOfflineMode && (
            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
              Offline Mode
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px] p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex gap-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <Avatar className={message.role === "assistant" ? "bg-purple-600" : "bg-blue-600"}>
                    {message.role === "assistant" ? (
                      <Image src="/images/sagemaker-logo.png" alt="Assistant" width={40} height={40} />
                    ) : (
                      <User className="h-5 w-5 text-white" />
                    )}
                  </Avatar>
                  <div
                    className={`rounded-lg p-3 ${
                      message.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-3 max-w-[80%]">
                  <Avatar className="bg-purple-600">
                    <Image src="/images/sagemaker-logo.png" alt="Assistant" width={40} height={40} />
                  </Avatar>
                  <div className="rounded-lg p-3 bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100 flex items-center">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span className="ml-2 text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            {error && (
              <Alert variant="warning" className="mx-auto max-w-[80%] bg-amber-50 border-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">{error}</AlertDescription>
              </Alert>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t p-3">
        <div className="flex w-full items-center space-x-2">
          <Input
            placeholder="Ask about SageMaker Autopilot..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
