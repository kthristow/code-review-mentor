"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { trpc } from "./_trpc/client";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

type Language = "javascript" | "typescript" | "python";

export default function Page() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState<Language>("javascript");
  const [error, setError] = useState("");

  const createSubmission = trpc.submission.create.useMutation();
  const getSubmissions = trpc.submission.getAll.useQuery();

  const { setInput, handleSubmit, messages, status } = useChat({
    api: "/api/chat",
    onFinish: async (message) => {
      const feedback =
        message?.parts?.find((p) => p.type === "text")?.text || "";
      await createSubmission.mutateAsync({ code, language, feedback });
      getSubmissions.refetch();
    },
  });

  const isLoading = status === "streaming";

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 30 || code.length > 500) {
      setError("Code must be 30-500 characters.");
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
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <form onSubmit={onSubmit} className="space-y-4">
        <Textarea
          placeholder="Paste your code..."
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="min-h-[200px]"
        />
        <Select
          value={language}
          onValueChange={(val) => setLanguage(val as Language)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="javascript">JavaScript</SelectItem>
            <SelectItem value="typescript">TypeScript</SelectItem>
            <SelectItem value="python">Python</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Analyzing..." : "Submit for Review"}
        </Button>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </form>

      <section className="bg-white dark:bg-zinc-900 border rounded-lg p-4 shadow-sm">
        <h2 className="font-semibold mb-2">AI Feedback</h2>
        {isLoading && <Skeleton className="h-24 w-full" />}
        {messages
          .filter((m) => m.role === "assistant")
          .map((m) =>
            m.parts.map((part, i) =>
              part.type === "text" ? (
                <p key={`${m.id}-${i}`} className="whitespace-pre-wrap text-sm">
                  {part.text}
                </p>
              ) : null
            )
          )}
      </section>

      <section>
        <h2 className="font-semibold text-lg mb-2">Submission History</h2>
        {getSubmissions.isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          getSubmissions.data?.map((sub) => (
            <Card key={sub.id}>
              <CardContent className="p-4 space-y-1">
                <pre className="text-xs line-clamp-2 whitespace-pre-wrap">
                  {sub.code}
                </pre>
                <p className="text-xs text-muted-foreground">
                  Feedback: {sub.feedback.slice(0, 50)}...
                </p>
                <Link
                  href={`/submission/${sub.id}`}
                  className="text-blue-500 text-xs underline"
                >
                  View Full
                </Link>
              </CardContent>
            </Card>
          ))
        )}
      </section>
    </main>
  );
}
