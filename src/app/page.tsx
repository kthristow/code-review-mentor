"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { trpc } from "./_trpc/client";
import { CodeEditor } from "@/components/CodeEditor";
import { FeedbackPanel } from "@/components/FeedbackPanel";
import { SubmissionSidebar } from "@/components/SubmissionSidebar";

type Language = "javascript" | "typescript" | "python";

export default function Page() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState<Language>("javascript");
  const [localError, setLocalError] = useState("");
  const [chatKey, setChatKey] = useState(0); // 👈 key to reset chat hook

  const createSubmission = trpc.submission.create.useMutation({
    onError: () => {
      setLocalError("❌ Failed to save submission to database.");
    },
  });

  const getSubmissions = trpc.submission.getAll.useQuery();

  const {
    append,
    messages,
    status,
    error: aiError,
  } = useChat({
    api: "/api/chat",
    id: `chat-${chatKey}`, // 👈 gives each chat its own isolated session
    onFinish: async (message) => {
      const feedback =
        message?.parts?.find((p) => p.type === "text")?.text || "";
      await createSubmission.mutateAsync({ code, language, feedback });
      getSubmissions.refetch();
    },
    onError: () => {
      setLocalError("❌ AI API failed. Try again.");
    },
  });

  const isLoading = status === "streaming";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (code.length < 30 || code.length > 500) {
      setLocalError("Code must be between 30 and 500 characters.");
      return;
    }

    setLocalError("");

    // 🔄 Reset chat session to prevent message accumulation
    setChatKey((prev) => prev + 1);

    const prompt = `Act as a senior Security Specialist. Analyze this ${language} code for security issues.

Format response as:

1. Brief summary (1 sentence)
2. Key findings (bulleted list)
3. Most critical recommendation

Avoid markdown. Be technical but concise.

\`\`\`${language}
${code}
\`\`\``;

    // Wait for hook reset before sending
    setTimeout(() => {
      append({ role: "user", content: prompt });
    }, 0);
  };

  return (
    <div className="flex flex-col md:flex-row relative min-h-screen">
      <SubmissionSidebar
        submissions={getSubmissions.data}
        isLoading={getSubmissions.isPending}
      />

      <main className="flex-1 p-6 md:ml-64 space-y-6">
        <section className="bg-white dark:bg-zinc-950 p-6 rounded-2xl shadow-md">
          <CodeEditor
            code={code}
            setCode={setCode}
            language={language}
            setLanguage={setLanguage}
            onSubmit={onSubmit}
            isLoading={isLoading}
            error={localError || aiError?.message || ""}
          />
        </section>

        <section className="bg-white dark:bg-zinc-950 p-6 rounded-2xl shadow-md">
          <FeedbackPanel
            key={chatKey}
            messages={messages}
            isLoading={isLoading}
          />
        </section>
      </main>
    </div>
  );
}
