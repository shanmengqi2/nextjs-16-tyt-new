import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { authComponent } from "./betterAuth/auth";

export const createPost = mutation({
  args: {
    title: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);

    if (!user) {
      throw new ConvexError("User not authenticated");
    }
    const blogArticle = await ctx.db.insert("posts", {
      title: args.title,
      body: args.body,
      authorId: user._id,
    });
    return blogArticle;
  },
});

export const getPosts = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db.query("posts").order("desc").collect();
    return posts;
  },
});
