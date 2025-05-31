"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Message } from "ai";
import { trpc } from "@/app/_trpc/client";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  messages: Message[];
  isLoading: boolean;
  submissionId: string | null;
  reaction: "UP" | "DOWN" | null;
}

export function FeedbackPanel({
  messages,
  isLoading,
  submissionId,
  reaction: initialReaction,
}: Props) {
  const [reaction, setReaction] = useState<"UP" | "DOWN" | null>(
    initialReaction
  );
  const updateReaction = trpc.submission.updateReaction.useMutation();

  const handleReaction = (type: "UP" | "DOWN") => {
    if (!submissionId) return;
    setReaction(type);
    updateReaction.mutate({ id: submissionId, reaction: type });
  };

  return (
    <section className="bg-white dark:bg-zinc-900 border rounded-lg p-4 shadow-sm">
      <h2 className="font-semibold mb-2">AI Feedback</h2>

      {isLoading && <Skeleton className="h-24 w-full" />}

      {messages
        .filter((m) => m.role === "assistant")
        .map((m) =>
          m?.parts?.map(
            (part, i) =>
              part.type === "text" && (
                <p
                  key={`${m.id}-${i}`}
                  className="whitespace-pre-wrap text-sm mb-2"
                >
                  {part.text}
                </p>
              )
          )
        )}

      {submissionId && (
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => handleReaction("UP")}
            className={cn(
              "text-xl px-2 py-1 rounded transition-colors",
              reaction === "UP"
                ? "bg-green-100 text-green-700"
                : "bg-transparent text-gray-500 hover:bg-green-50 hover:text-green-600"
            )}
          >
            👍
          </button>
          <button
            onClick={() => handleReaction("DOWN")}
            className={cn(
              "text-xl px-2 py-1 rounded transition-colors",
              reaction === "DOWN"
                ? "bg-red-100 text-red-700"
                : "bg-transparent text-gray-500 hover:bg-red-50 hover:text-red-600"
            )}
          >
            👎
          </button>
        </div>
      )}
    </section>
  );
}
