"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { trpc } from "./_trpc/client";
import { CodeEditor } from "@/components/CodeEditor";
import { FeedbackPanel } from "@/components/FeedbackPanel";
import { SubmissionHistory } from "@/components/SubmissionHistory";

type Language = "javascript" | "typescript" | "python";

export default function Page() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState<Language>("javascript");
  const [error, setError] = useState("");

  const createSubmission = trpc.submission.create.useMutation({
    onError: () => {
      setError("❌ Failed to save submission to database.");
    },
  });

  const getSubmissions = trpc.submission.getAll.useQuery();

  const {
    setInput,
    handleSubmit,
    messages,
    status,
    error: aiError,
  } = useChat({
    api: "/api/chat",
    onFinish: async (message) => {
      const feedback =
        message?.parts?.find((p) => p.type === "text")?.text || "";
      await createSubmission.mutateAsync({ code, language, feedback });
      getSubmissions.refetch();
    },
    onError: () => {
      setError("❌ AI API failed. Try again.");
    },
  });

  const isLoading = status === "streaming";

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (code.length < 30 || code.length > 500) {
      setError("Code must be between 30 and 500 characters.");
      return;
    }

    setError("");

    const prompt = `Act as a senior Security Specialist. Analyze this ${language} code for security issues.

Format response as:

1. Brief summary (1 sentence)
2. Key findings (bulleted list)
3. Most critical recommendation

Avoid markdown. Be technical but concise.

\`\`\`${language}
${code}
\`\`\``;

    setInput(prompt);
    handleSubmit(e);
  };

  return (
    <main className="max-w-6xl mx-auto p-6 flex flex-col md:flex-row gap-6">
      {/* Sidebar */}
      <aside className="w-full md:w-[300px] md:sticky md:top-6 h-fit bg-white dark:bg-zinc-950 p-6 rounded-2xl shadow-md">
        <SubmissionHistory
          submissions={getSubmissions.data}
          isLoading={getSubmissions.isPending}
        />
      </aside>
      {/* Main content (code editor + feedback) */}
      <div className="flex-1 space-y-6">
        <section className="bg-white dark:bg-zinc-950 p-6 rounded-2xl shadow-md">
          <CodeEditor
            code={code}
            setCode={setCode}
            language={language}
            setLanguage={setLanguage}
            onSubmit={onSubmit}
            isLoading={isLoading}
            error={error || aiError?.message || ""}
          />
        </section>

        <section className="bg-white dark:bg-zinc-950 p-6 rounded-2xl shadow-md">
          <FeedbackPanel messages={messages} isLoading={isLoading} />
        </section>
      </div>
    </main>
  );
}
