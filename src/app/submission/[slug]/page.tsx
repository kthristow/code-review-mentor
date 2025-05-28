import { prisma } from "@/server/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

type Params = Promise<{ slug: string }>;

export default async function SubmissionPage({ params }: { params: Params }) {
  const { slug } = await params;

  const submission = await prisma.submission.findUnique({
    where: { id: slug },
  });

  if (!submission) return notFound();

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
        <CardContent className="p-4 space-y-2">
          <h2 className="font-semibold text-lg">AI Feedback</h2>
          <div className="bg-muted p-4 rounded text-sm whitespace-pre-wrap">
            {submission.feedback}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
