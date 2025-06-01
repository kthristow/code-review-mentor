import { z } from "zod";
import { router, publicProcedure } from "@/server/trpc";
import { prisma } from "@/server/prisma";

export const submissionRouter = router({
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


  getAll: publicProcedure.query(async () => {
  return await prisma.submission.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      code: true,
      feedback: true,
      reaction: true,
    },
  });
}),

  getById: publicProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ input }) => {
      return await prisma.submission.findUnique({
        where: { id: input.id },
      });
    }),

  updateReaction: publicProcedure
    .input(z.object({ id: z.string(), reaction: z.enum(["UP", "DOWN", ""]) }))
    .mutation(async ({ input }) => {
      return  prisma.submission.update({
        where: { id: input.id },
        data: {
          reaction: input.reaction || null,
        },
      });
    }),

});