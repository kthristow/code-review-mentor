"use client";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type Language = "javascript" | "typescript" | "python";

interface Props {
  code: string;
  setCode: (val: string) => void;
  language: Language;
  setLanguage: (val: Language) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  error: string;
}

export function CodeEditor({
  code,
  setCode,
  language,
  setLanguage,
  onSubmit,
  isLoading,
  error,
}: Props) {
  return (
    <Card className="shadow-md">
      <form onSubmit={onSubmit}>
        <CardHeader>
          <CardTitle className="text-xl">Submit Your Code</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Paste your code..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="min-h-[200px] font-mono"
          />

          <Select
            value={language}
            onValueChange={(val) => setLanguage(val as Language)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="typescript">TypeScript</SelectItem>
              <SelectItem value="python">Python</SelectItem>
            </SelectContent>
          </Select>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Analyzing..." : "Submit for Review"}
          </Button>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </CardContent>
      </form>
    </Card>
  );
}
