// components/FeedbackPanel.tsx
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Message } from "ai";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  messages: Message[];
  isLoading: boolean;
}

export function FeedbackPanel({ messages, isLoading }: Props) {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-xl">AI Feedback</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          messages
            .filter((m) => m.role === "assistant")
            .map((m) =>
              m?.parts?.map((part, i) =>
                part.type === "text" ? (
                  <p
                    key={`${m.id}-${i}`}
                    className="whitespace-pre-wrap text-sm text-muted-foreground"
                  >
                    {part.text}
                  </p>
                ) : null
              )
            )
        )}
      </CardContent>
    </Card>
  );
}
