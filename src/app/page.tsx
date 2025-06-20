"use client";

import { useEffect, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { trpc } from "./_trpc/client";
import { CodeEditor } from "@/components/CodeEditor";
import { FeedbackPanel } from "@/components/FeedbackPanel";
import { SubmissionSidebar } from "@/components/SubmissionSidebar";
import * as babelParser from "@babel/parser";
import { isLikelyValidPython } from "@/lib/pythonSyntax";
import { cn } from "@/lib/utils";

type Language = "javascript" | "typescript" | "python";

export default function Page() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState<Language>("javascript");
  const [localError, setLocalError] = useState("");
  const [chatKey, setChatKey] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
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

  const isSyntaxValid = async (
    code: string,
    language: Language
  ): Promise<{ valid: boolean; error?: string }> => {
    if (language === "python") return isLikelyValidPython(code);

    try {
      babelParser.parse(code, {
        sourceType: "module",
        plugins: language === "typescript" ? ["typescript"] : ["jsx"],
      });
      return { valid: true };
    } catch (err) {
      return {
        valid: false,
        error: (err as Error).message,
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
      setLocalError(`❌ ${error}`);
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
    <div className="flex relative min-h-screen">
      <SubmissionSidebar
        submissions={getSubmissions.data}
        isLoading={getSubmissions.isPending}
        onNewSubmission={handleNewSubmission}
        open={sidebarOpen}
        setOpen={setSidebarOpen}
      />

      <main
        className="flex-1 p-6 md:ml-64 transition-all duration-300 ease-in-out"
        style={{ marginLeft: sidebarOpen ? "16rem" : "0" }}
      >
        <div className="w-full max-w-7xl mx-auto space-y-6 transition-all duration-300 ease-in-out">
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

          {messages.length > 0 && (
            <section className="bg-white dark:bg-zinc-950 p-6 rounded-2xl shadow-md">
              <FeedbackPanel
                messages={messages}
                isLoading={isLoading}
                submissionId={latestSubmissionId}
                reaction={latestSubmissionReaction}
              />
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
