"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  submissions: { id: string; code: string; feedback: string }[] | undefined;
  isLoading: boolean;
}

export function SubmissionHistory({ submissions, isLoading }: Props) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold mb-2">Submission History</h2>
      <div className="flex flex-col gap-3 max-h-[calc(100vh-120px)] overflow-y-auto pr-2">
        {isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          submissions?.map((sub) => (
            <Link key={sub.id} href={`/submission/${sub.id}`} className="block">
              <Card className="p-3 hover:shadow-md transition-all border-muted cursor-pointer">
                <CardContent className="p-0 space-y-2">
                  <pre className="text-xs font-mono line-clamp-2 whitespace-pre-wrap text-muted-foreground">
                    {sub.code}
                  </pre>
                  <p className="text-xs text-zinc-500 line-clamp-2">
                    Feedback: {sub.feedback}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
