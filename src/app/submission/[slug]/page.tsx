import { prisma } from "@/server/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ShareButton } from "@/components/ShareButton";
import { ThumbsUp, ThumbsDown } from "lucide-react";

// Simulate getting reaction - in real app, fetch from DB or API
const getReaction = async (id: string) => {
  const submission = await prisma.submission.findUnique({ where: { id } });
  return submission?.reaction || null;
};

type Params = Promise<{ slug: string }>;

export default async function SubmissionPage({ params }: { params: Params }) {
  const { slug } = await params;
  const submission = await prisma.submission.findUnique({
    where: { id: slug },
  });

  if (!submission) return notFound();

  const reaction = submission.reaction;

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Submission Details</h1>
        <Link href="/" className="text-sm underline text-muted-foreground">
          ← Back
        </Link>
      </div>

      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-lg">Submitted Code</h2>
            <Badge variant="outline">{submission.language}</Badge>
          </div>
          <pre className="bg-muted p-4 rounded text-sm whitespace-pre-wrap overflow-auto">
            {submission.code}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div>
            <h2 className="font-semibold text-lg">AI Feedback</h2>
            <div className="bg-muted p-4 rounded text-sm whitespace-pre-wrap">
              {submission.feedback}
            </div>
          </div>
          <div className="flex items-center justify-start gap-4">
            <button
              className={`p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition ${
                reaction === "UP"
                  ? "bg-green-100 text-green-600"
                  : "bg-muted text-gray-500"
              }`}
              aria-label="Thumbs up"
            >
              <ThumbsUp size={18} />
            </button>
            <button
              className={`p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition ${
                reaction === "DOWN"
                  ? "bg-red-100 text-red-600"
                  : "bg-muted text-gray-500"
              }`}
              aria-label="Thumbs down"
            >
              <ThumbsDown size={18} />
            </button>
            <ShareButton id={slug} />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
