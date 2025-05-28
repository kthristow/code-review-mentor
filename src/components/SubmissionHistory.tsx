"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

interface Props {
  submissions: { id: string; code: string; feedback: string }[] | undefined;
  isLoading: boolean;
}

export function SubmissionHistory({ submissions, isLoading }: Props) {
  return (
    <section className="space-y-2">
      <h2 className="font-semibold text-lg">Submission History</h2>
      {isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : (
        submissions?.map((sub) => (
          <Card key={sub.id} className="shadow-sm">
            <CardContent className="p-4 space-y-1">
              <pre className="text-xs font-mono line-clamp-2 whitespace-pre-wrap text-muted-foreground">
                {sub.code}
              </pre>
              <p className="text-xs text-zinc-500">
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
  );
}
