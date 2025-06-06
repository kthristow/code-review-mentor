import { submissionRouter } from "./submission";
import { router } from "./trpc";

export const appRouter = router({
    submission: submissionRouter
})

export type AppRouter = typeof appRouter;