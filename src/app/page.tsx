import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import {
  ArrowRight,
  Clock,
  FileText,
  LogIn,
  MessageSquare,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import FileUpload from "@/components/FileUpload";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function Home() {
  const { userId } = await auth();
  const isAuth = !!userId;
  let firstChat;
  if (userId) {
    firstChat = await db.select().from(chats).where(eq(chats.userId, userId));
    if (firstChat) {
      firstChat = firstChat[0];
    }
  }
  const features = [
    {
      title: "Understand Every Clause",
      description:
        "Instantly surface obligations, definitions, and red flags from complex legal documents.",
      icon: FileText,
    },
    {
      title: "Ask Contextual Questions",
      description:
        "Converse with your documents and get precise answers backed by cited passages.",
      icon: MessageSquare,
    },
    {
      title: "Enterprise-Grade Security",
      description:
        "Your uploads stay encrypted end-to-end with role-based access controls.",
      icon: ShieldCheck,
    },
  ];

  const workflow = [
    {
      title: "Upload & organize",
      description: "Drop pleadings, case law, or statutes to create a secure workspace.",
      icon: Sparkles,
    },
    {
      title: "Interrogate in seconds",
      description: "Summaries, comparisons, and key obligations appear in natural language.",
      icon: ArrowRight,
    },
    {
      title: "Deliver faster",
      description: "Export findings or jump back into the chat for deeper analysis anytime.",
      icon: Clock,
    },
  ];
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-rose-50 via-white to-teal-50">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-32 h-64 w-64 rounded-full bg-rose-200/40 blur-3xl" />
        <div className="absolute bottom-0 right-12 h-72 w-72 rounded-full bg-teal-200/40 blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-col px-6 pb-16 pt-10 sm:pt-12 lg:px-12">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-white/70 px-3 py-1 text-sm font-medium text-slate-600 backdrop-blur">
              Legal Recall
            </span>
            <span className="hidden text-sm text-slate-500 sm:inline">
              AI-powered legal research assistant
            </span>
          </div>
          <div className="flex items-center gap-3">
            {isAuth ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <Button asChild variant="ghost" className="font-medium text-slate-700">
                <Link href="/sign-in">Sign in</Link>
              </Button>
            )}
            {isAuth && firstChat ? (
              <Button asChild>
                <Link href={`/chat/${firstChat.id}`}>
                  Resume chat
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button asChild>
                <Link href="/sign-up">
                  Start free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </header>

        <section className="mt-16 grid gap-12 lg:grid-cols-[1.1fr,1fr] lg:gap-20">
          <div className="space-y-8 text-slate-800">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-sm font-medium text-rose-600 shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Trusted by legal teams and students
            </div>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Understand complex legal documents in moments, not hours.
            </h1>
            <p className="max-w-xl text-lg text-slate-600">
              Legal Recall combines secure document upload, AI-powered search, and conversational analysis so you can focus on strategy—not manual review.
            </p>

            <div className="flex flex-wrap gap-3">
              {isAuth ? (
                <Button asChild size="lg" className="shrink-0">
                  <a href="#upload">
                    Upload a file
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
              ) : (
                <Button asChild size="lg" className="shrink-0">
                  <Link href="/sign-in">
                    Login to get started
                    <LogIn className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              )}
              <Button
                asChild
                variant="outline"
                size="lg"
                className="shrink-0 bg-white/80 backdrop-blur"
              >
                <Link href="#features">Explore capabilities</Link>
              </Button>
            </div>

            <div className="grid gap-6 sm:grid-cols-3 sm:gap-8">
              {features.map(({ title, description, icon: Icon }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur"
                >
                  <Icon className="mb-4 h-8 w-8 text-rose-500" />
                  <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{description}</p>
                </div>
              ))}
            </div>
          </div>

          <div id="upload" className="relative">
            <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-rose-200/40 via-white to-teal-200/40 blur-2xl" />
            <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur">
              <h2 className="text-lg font-semibold text-slate-900">
                {isAuth ? "Upload a document" : "Ready when you are"}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {isAuth
                  ? "Drop your PDFs here to spin up a new AI workspace tailored for legal analysis."
                  : "Create an account to start analyzing contracts, case law, and filings with AI support."}
              </p>
              <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-white p-4">
                {isAuth ? (
                  <FileUpload />
                ) : (
                  <Button asChild className="w-full justify-center">
                    <Link href="/sign-in">
                      Sign in to upload
                      <LogIn className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
              <div className="mt-6 grid gap-3 rounded-2xl bg-slate-50/70 p-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-teal-500" />
                  <span>Confidential uploads with granular sharing controls.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-rose-500" />
                  <span>Extract timelines, obligations, and summaries instantly.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mt-24 rounded-3xl border border-slate-200/80 bg-white/80 px-6 py-12 backdrop-blur lg:px-12">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-semibold text-slate-900">How teams use Legal Recall</h2>
            <p className="mt-3 text-base text-slate-600">
              From diligence to classroom prep, streamline your legal research workflow with guided AI assistance.
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {workflow.map(({ title, description, icon: Icon }) => (
              <div key={title} className="space-y-3 rounded-2xl bg-slate-50/70 p-6">
                <Icon className="h-6 w-6 text-rose-500" />
                <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                <p className="text-sm text-slate-600">{description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-500">
            <span className="rounded-full bg-slate-100 px-4 py-1">Law firms</span>
            <span className="rounded-full bg-slate-100 px-4 py-1">Legal clinics</span>
            <span className="rounded-full bg-slate-100 px-4 py-1">Universities</span>
            <span className="rounded-full bg-slate-100 px-4 py-1">In-house counsel</span>
          </div>
        </section>

        <section className="mt-20 rounded-3xl bg-gradient-to-r from-rose-400 via-rose-500 to-teal-500 px-6 py-12 text-white shadow-lg lg:px-12">
          <div className="grid gap-8 lg:grid-cols-[1.1fr,1fr] lg:items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-semibold">Stay ahead of deadlines with AI support.</h2>
              <p className="text-base text-white/90">
                Organize case materials, synthesize briefs, and collaborate with your team—all in a single chat-first workspace.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {isAuth ? (
                firstChat ? (
                  <Button
                    asChild
                    className="bg-white text-slate-900 hover:bg-slate-100"
                  >
                    <Link href={`/chat/${firstChat.id}`}>
                      Open your workspace
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button
                    asChild
                    className="bg-white text-slate-900 hover:bg-slate-100"
                  >
                    <a href="#upload">
                      Start a new workspace
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                )
              ) : (
                <Button
                  asChild
                  className="bg-white text-slate-900 hover:bg-slate-100"
                >
                  <Link href="/sign-up">
                    Create your free account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
              <Button
                asChild
                variant="outline"
                className="border-white/60 bg-transparent text-white hover:bg-white/10"
              >
                <Link href="/sign-in">
                  {isAuth ? "Switch account" : "Already have an account?"}
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
