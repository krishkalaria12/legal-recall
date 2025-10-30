import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import React from "react";

type TextPart = { type: 'text'; text: string };
type AnyPart = TextPart | { type: string; [k: string]: any };
type ChatMessage = { id: string; role: 'user' | 'assistant' | 'system' | 'tool'; parts?: AnyPart[]; content?: string };
type Props = { isLoading: boolean; messages: ChatMessage[] };

const MessageList = ({ messages, isLoading }: Props) => {
  if (isLoading) {
    return (
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <Loader2 className="h-6 w-6 animate-spin text-rose-500" />
      </div>
    );
  }
  if (!messages) return <></>;
  return (
    <div className="flex flex-col gap-3 px-6">
      {messages.map((message) => {
        const text = Array.isArray(message.parts)
          ? message.parts
              .filter((p) => (p as AnyPart).type === 'text')
              .map((p) => (p as TextPart).text)
              .join("")
          : message.content || "";
        return (
          <div
            key={message.id}
            className={cn("flex", {
              "justify-end pl-12": message.role === "user",
              "justify-start pr-12": message.role === "assistant",
            })}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm",
                {
                  "bg-gradient-to-r from-rose-500 via-rose-500 to-rose-400 text-white shadow-md":
                    message.role === "user",
                  "bg-white/90 text-slate-700 ring-1 ring-rose-100": message.role !== "user",
                }
              )}
            >
              <p className="whitespace-pre-wrap leading-relaxed">{text}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;
