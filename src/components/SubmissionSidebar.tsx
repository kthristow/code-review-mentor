"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  submissions: { id: string; code: string; feedback: string }[] | undefined;
  isLoading: boolean;
  onNewSubmission: () => void;
  open: boolean;
  setOpen: (val: boolean) => void;
}

export function SubmissionSidebar({
  submissions,
  isLoading,
  onNewSubmission,
  open,
  setOpen,
}: Props) {
  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "fixed top-4 z-50 bg-zinc-900 text-white p-2 rounded-full shadow-md transition-all hover:bg-zinc-800",
          open ? "left-64" : "left-4"
        )}
        aria-label={open ? "Hide sidebar" : "Show sidebar"}
      >
        {open ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
      </button>

      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-white dark:bg-zinc-950 shadow-md transition-transform duration-300 z-40 overflow-y-auto",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-md font-semibold">Submission History</h2>
            <Button variant="outline" size="sm" onClick={onNewSubmission}>
              <Plus size={16} />
              New
            </Button>
          </div>

          {isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            submissions?.map((sub) => (
              <Link key={sub.id} href={`/submission/${sub.id}`}>
                <Card className="hover:bg-zinc-100 dark:hover:bg-zinc-900 transition cursor-pointer mt-[10px]">
                  <CardContent className="p-3 space-y-1">
                    <pre className="text-xs font-mono line-clamp-2 text-muted-foreground">
                      {sub.code}
                    </pre>
                    <p className="text-xs text-zinc-500">
                      Feedback: {sub.feedback.slice(0, 50)}...
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </aside>
    </>
  );
}
