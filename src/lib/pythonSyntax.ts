export function isLikelyValidPython(code: string): { valid: boolean; error?: string } {
  const stack: string[] = [];
  const pairs: Record<string, string> = { "(": ")", "{": "}", "[": "]" };
  const lines = code.split("\n");

  const blockStarters = /^(def|class|if|for|while|try|except|with)\b.*:\s*$/;
  let insideBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    for (const char of line) {
      if (pairs[char]) {
        stack.push(pairs[char]);
      } else if (Object.values(pairs).includes(char)) {
        if (stack.pop() !== char) {
          return {
            valid: false,
            error: `Unmatched brackets on line ${i + 1}`,
          };
        }
      }
    }

    const trimmed = line.trim();
    if (trimmed.length === 0 || trimmed.startsWith("#")) continue;

    const indentMatch = line.match(/^(\s+)/);
    if (indentMatch) {
      const indent = indentMatch[1];

      if (indent.includes("\t") && indent.includes(" ")) {
        return { valid: false, error: `Mixed tabs and spaces on line ${i + 1}` };
      }

      if (!indent.includes("\t") && indent.length % 4 !== 0) {
        return { valid: false, error: `Indentation not a multiple of 4 on line ${i + 1}` };
      }

      if (insideBlock && indent.length === 0) {
        return { valid: false, error: `Expected indentation after block on line ${i}` };
      }
    } else {
      if (insideBlock) {
        return { valid: false, error: `Expected indentation after block on line ${i}` };
      }
    }
    insideBlock = blockStarters.test(trimmed);
  }

  if (stack.length > 0) {
    return { valid: false, error: "Unclosed brackets or parentheses." };
  }

  const keywords = ["def", "class", "import", "print", "return"];
  const containsKeyword = keywords.some((kw) => code.includes(kw));

  if (!containsKeyword) {
    return { valid: false, error: "Missing common Python keywords." };
  }

  return { valid: true };
}