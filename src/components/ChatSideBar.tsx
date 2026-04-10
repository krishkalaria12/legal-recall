"use client";
import { DrizzleChat } from "@/lib/db/schema";
import Link from "next/link";
import { Button } from "./ui/button";
import { ArrowLeft, MessageCircle, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  chats: DrizzleChat[];
  chatId: number;
};

const ChatSideBar = ({ chats, chatId }: Props) => {
  return (
    <div className="flex h-full min-h-screen flex-col gap-4 overflow-hidden bg-transparent p-4 text-slate-700">
      <div className="space-y-2">
        <Button
          asChild
          className="w-full bg-rose-500 text-white shadow-sm hover:bg-rose-500/90"
        >
          <Link href="/">
            <PlusCircle className="mr-2 h-4 w-4" />
            New chat
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="w-full border-slate-200 bg-white/70 text-slate-700 backdrop-blur hover:bg-white"
        >
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Link>
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto pb-6">
        <div className="space-y-2">
          {chats.map((chat) => (
            <Button
              asChild
              key={chat.id}
              variant="ghost"
              className={cn(
                "flex w-full items-center justify-start rounded-xl border border-transparent bg-white/60 px-4 py-3 text-sm font-medium text-slate-600 shadow-sm transition hover:border-rose-200 hover:bg-white hover:text-slate-900",
                {
                  "border-rose-300 bg-rose-50 text-rose-900": chat.id === chatId,
                }
              )}
            >
              <Link href={`/chat/${chat.id}`}>
                <div className="flex w-full items-center gap-3">
                  <MessageCircle className="h-4 w-4" />
                  <span className="flex-1 truncate text-left">{chat.pdfName}</span>
                </div>
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatSideBar;
