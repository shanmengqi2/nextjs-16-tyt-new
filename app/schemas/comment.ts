import { Id } from "@/convex/_generated/dataModel";
import z from "zod";

export const commentSchema = z.object({
  body: z.string().min(3, "kanbujianma, yao 3ge yishang"),
  postId: z.custom<Id<"posts">>(),
});
