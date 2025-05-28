# 🚀 CodeReview Mentor

> Submit your code. Get expert feedback—instantly.

**CodeReview Mentor** is a developer-focused tool that lets users submit code snippets and receive real-time AI-generated feedback from a specialized reviewer persona (e.g., Security Specialist). The app is built to showcase streaming UX, tRPC architecture, and Vercel AI SDK integration.

---

## 🔧 Tech Stack

- **Frontend**: Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: tRPC, Prisma, SQLite, Zod
- **AI Integration**: Vercel AI SDK (GPT-4o)
- **Database**: Prisma ORM with SQLite
- **UI Kit**: shadcn/ui (Buttons, Cards, Textareas, Skeletons)

---

## 🎯 Objective

Build a fast, modern web app that offers developers:

- A simple code input form
- Real-time AI feedback via streaming
- A persistent submission history view

> ✅ **Focus on high-quality UX and implementation over feature-bloat.**

---

## 📸 Demo

Coming soon...

---

## 🧪 Features

### ✅ 1. Code Submission System

- Language selector (JavaScript, TypeScript, Python)
- Live validation (30–500 characters)
- Syntax validation (bonus)
- Submission history with code/feedback preview
- Detailed submission pages

**Prisma Schema**:

```ts
model Submission {
  id        String   @id @default(cuid())
  code      String
  language  String
  feedback  String
  createdAt DateTime @default(now())
}
```

---

### 🤖 2. AI Review System

- Vercel AI SDK with GPT-4o
- Persona: `Security Specialist`
- Prompt enforced for technical depth
- Real-time streaming feedback
- Max tokens: `450`
- Error boundaries for failed completions

**Prompt Example**:

```
Act as a senior Security Specialist engineer. Analyze this JavaScript code for security issues.
Format response as:

1. Brief summary (1 sentence)
2. Key findings (bulleted list)
3. Most critical recommendation

Avoid markdown. Be technical but concise.
```

---

### ⚙️ 3. Technical Highlights

- `tRPC` Routers:
  - `submissions.create`
  - `submissions.getAll`
- Validation with `Zod`
- Graceful error handling:
  - AI API failures
  - Invalid submissions
  - Database errors
- Typed client with automatic inference

---

### 🎨 4. UI Features

- Fully responsive layout
- `shadcn/ui` components:
  - Button, Textarea, Card, Skeleton
- Clear loading states
- Minimal, clean layout with accessibility in mind
- Components split by:
  - `CodeEditor.tsx`
  - `FeedbackPanel.tsx`
  - `SubmissionHistory.tsx`

---

## 📦 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/code-review-mentor.git
cd code-review-mentor
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Setup environment

Create a `.env` file:

```env
OPENAI_API_KEY=your-key-here
```

### 4. Setup database

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Run locally

```bash
pnpm dev
```

---

## 🧠 Key Decisions

- Chose `Vercel AI SDK` for seamless streaming and built-in edge support
- Used `tRPC` to enforce end-to-end type safety
- Split app into modular components for clarity and scalability
- Prioritized real-time feedback experience and graceful failure recovery

---

## 🚫 Known Limitations

- No user authentication
- No shareable submission URLs
- Basic validation logic (can be improved)

---

## 📤 Deployment

App is ready to deploy on **Vercel**:

```bash
vercel deploy
```

---

## 📽️ (Optional) Demo Video

You can add a short [Loom](https://loom.com/) or YouTube link demo here.

---

## 🧾 License

MIT — feel free to fork, remix, and build on it.
