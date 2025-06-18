import { NextRequest, NextResponse } from "next/server";
import { spawnSync } from "child_process";

export async function POST(req: NextRequest) {
  const { code } = await req.json();

  const wrappedCode = `compile(${JSON.stringify(code)}, "<string>", "exec")`;

  const result = spawnSync("python3", ["-c", wrappedCode]);

  if (result.status === 0) {
    return NextResponse.json({ valid: true });
  } else {
    const stderr = result.stderr.toString().trim();
    const lines = stderr.split("\n");
    const lastLine = lines[lines.length - 1];
    return NextResponse.json({
      valid: false,
      error: lastLine || "Unknown Python syntax error.",
    });
  }
}