import { z } from "zod";
import { router, publicProcedure } from "@/server/trpc";
import { prisma } from "@/server/prisma";

export const submissionRouter = router({
  // Create a new code submission
  create: publicProcedure
    .input(
      z.object({
        code: z.string().min(30).max(500),
        language: z.enum(["javascript", "typescript", "python"]),
        feedback: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await prisma.submission.create({
        data: {
          code: input.code,
          language: input.language,
          feedback: input.feedback,
        },
      });
    }),

  // Get all recent submissions (limit 10)
  getAll: publicProcedure.query(async () => {
    return await prisma.submission.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    });
  }),

  // Get a single submission by ID
  getById: publicProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ input }) => {
      return await prisma.submission.findUnique({
        where: { id: input.id },
      });
    }),
});