"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CopyIcon, CheckIcon } from "lucide-react";

interface Props {
  id: string;
}

export function ShareButton({ id }: Props) {
  const [copied, setCopied] = useState(false);
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/submission/${id}`
      : "";

  const copyToClipboard = async () => {
    if (!shareUrl) return;

    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      onClick={copyToClipboard}
      variant="outline"
      className="flex gap-2 items-center"
    >
      {copied ? (
        <CheckIcon className="w-4 h-4 text-green-500" />
      ) : (
        <CopyIcon className="w-4 h-4" />
      )}
      {copied ? "Copied!" : "Copy Share Link"}
    </Button>
  );
}
