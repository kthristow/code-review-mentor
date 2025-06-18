"use client";

import { useEffect, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { trpc } from "./_trpc/client";
import { CodeEditor } from "@/components/CodeEditor";
import { FeedbackPanel } from "@/components/FeedbackPanel";
import { SubmissionSidebar } from "@/components/SubmissionSidebar";
import * as babelParser from "@babel/parser";

type Language = "javascript" | "typescript" | "python";

export default function Page() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState<Language>("javascript");
  const [localError, setLocalError] = useState("");
  const [chatKey, setChatKey] = useState(0);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);
  const [latestSubmissionId, setLatestSubmissionId] = useState<string | null>(
    null
  );
  const [latestSubmissionReaction, setLatestSubmissionReaction] = useState<
    "UP" | "DOWN" | null
  >(null);

  const createSubmission = trpc.submission.create.useMutation({
    onError: () => setLocalError("❌ Failed to save submission to database."),
  });

  const getSubmissions = trpc.submission.getAll.useQuery();

  const {
    append,
    messages,
    status,
    error: aiError,
  } = useChat({
    api: "/api/chat",
    id: `chat-${chatKey}`,
    onFinish: async (message) => {
      const feedback =
        message?.parts?.find((p) => p.type === "text")?.text || "";
      const submission = await createSubmission.mutateAsync({
        code,
        language,
        feedback,
      });
      setLatestSubmissionId(submission.id);
      setLatestSubmissionReaction(submission.reaction ?? null);
      getSubmissions.refetch();
    },
    onError: () => setLocalError("AI API failed. Try again."),
  });

  const isLoading = status === "streaming";

  async function validatePythonSyntax(
    code: string
  ): Promise<{ valid: boolean; error?: string }> {
    const res = await fetch("/api/python-validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    const data = await res.json();
    return { valid: data.valid, error: data.error };
  }

  const isSyntaxValid = async (
    code: string,
    language: Language
  ): Promise<{ valid: boolean; error?: string }> => {
    if (language === "python") {
      return await validatePythonSyntax(code);
    }

    try {
      babelParser.parse(code, {
        sourceType: "module",
        plugins: language === "typescript" ? ["typescript"] : ["jsx"],
      });
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error:
          (error as Error).message || "Invalid JavaScript/TypeScript syntax",
      };
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 30 || code.length > 500) {
      setLocalError("Code must be between 30 and 500 characters.");
      return;
    }

    const { valid, error } = await isSyntaxValid(code, language);
    if (!valid) {
      setLocalError(`❌ ${error || "Invalid syntax"}`);
      return;
    }

    setLocalError("");

    const prompt = `Act as a senior Security Specialist. Analyze this ${language} code for security issues.

Format response as:

1. Brief summary (1 sentence)
2. Key findings (bulleted list)
3. Most critical recommendation

Avoid markdown. Be technical but concise.

\`\`\`${language}
${code}
\`\`\``;

    setPendingPrompt(prompt);
    setChatKey((prev) => prev + 1);
  };

  useEffect(() => {
    if (pendingPrompt) {
      append({ role: "user", content: pendingPrompt });
      setPendingPrompt(null);
    }
  }, [chatKey]);

  const handleNewSubmission = () => {
    setCode("");
    setLocalError("");
    setLatestSubmissionId(null);
    setLatestSubmissionReaction(null);
    setChatKey((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col md:flex-row relative min-h-screen">
      <SubmissionSidebar
        submissions={getSubmissions.data}
        isLoading={getSubmissions.isPending}
        onNewSubmission={handleNewSubmission}
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
            syntaxError={false}
          />
        </section>

        <section className="bg-white dark:bg-zinc-950 p-6 rounded-2xl shadow-md">
          <FeedbackPanel
            messages={messages}
            isLoading={isLoading}
            submissionId={latestSubmissionId}
            reaction={latestSubmissionReaction}
          />
        </section>
      </main>
    </div>
  );
}
