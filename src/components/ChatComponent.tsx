"use client";
import React from "react";
import { Input } from "./ui/input";
import { useChat } from "@ai-sdk/react";
import { Button } from "./ui/button";
import { Send, MessageCircle } from "lucide-react";
import MessageList from "./MessageList";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { DefaultChatTransport } from "ai";
type ChatMessage = { id: string; role: 'user' | 'assistant' | 'system' | 'tool'; content: string };

type Props = { chatId: number };

const ChatComponent = ({ chatId }: Props) => {
  const { data, isLoading } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      const response = await axios.post<ChatMessage[]>("/api/get-messages", {
        chatId,
      });
      return response.data;
    },
  });

  const initial = React.useMemo(() => {
    return (data || []).map((m) => ({
      id: String((m as any).id ?? Math.random().toString(36).slice(2)),
      role: (m as any).role,
      parts: [{ type: 'text', text: (m as any).content }],
    }));
  }, [data]);

  const { messages, sendMessage, status } = useChat({
    messages: initial as any,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { chatId },
    }),
  });

  const [input, setInput] = React.useState("");
  const isStreaming = status === 'submitted' || status === 'streaming';
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isStreaming) return;
    await sendMessage({ text });
    setInput("");
  };

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-white/90 via-white to-rose-50">
      <div className="border-b border-rose-100/70 bg-white/80 px-5 py-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600">
            <MessageCircle className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Conversation</h3>
            <p className="text-sm text-slate-500">Ask follow-ups or dive deeper into your document.</p>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto bg-slate-50/60">
        <div className="relative flex h-full flex-col pb-5 pt-6">
          <MessageList messages={messages} isLoading={isLoading} />
          {isStreaming ? (
            <div className="mt-4 px-6">
              <div className="flex justify-start pr-12">
                <div className="rounded-2xl bg-white/90 px-4 py-2 text-sm text-slate-500 shadow-sm ring-1 ring-rose-100">
                  <span className="inline-flex items-center gap-2">
                    <svg className="h-2 w-2 animate-ping text-rose-400" viewBox="0 0 8 8">
                      <circle cx="4" cy="4" r="4" fill="currentColor" />
                    </svg>
                    Assistant is thinking...
                  </span>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <form onSubmit={onSubmit} className="border-t border-rose-100/80 bg-white/90 px-5 py-5 backdrop-blur">
        <div className="flex items-center gap-3 rounded-2xl border border-transparent bg-slate-100/80 p-2 shadow-sm focus-within:border-rose-200 focus-within:bg-white">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask any question about your PDF..."
            className="h-11 flex-1 border-0 bg-transparent px-3 text-sm text-slate-700 placeholder:text-slate-400 focus-visible:ring-0"
          />
          <Button
            type="submit"
            disabled={isStreaming}
            className="h-11 rounded-xl bg-rose-500 px-4 text-sm font-medium text-white shadow hover:bg-rose-500/90 disabled:bg-rose-300"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatComponent;
