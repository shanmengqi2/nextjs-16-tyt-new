import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CommentSection } from "@/components/Web/CommentSection";
import { PostPresence } from "@/components/Web/PostPresence";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { getToken } from "@/lib/auth-server";
import { fetchQuery, preloadQuery } from "convex/nextjs";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PostIdRouteProps {
  params: Promise<{
    postId: Id<"posts">;
  }>;
}

export async function generateMetadata({
  params,
}: PostIdRouteProps): Promise<Metadata> {
  const { postId } = await params;
  const post = await fetchQuery(api.posts.getPostById, { postId });
  if (!post) {
    return {
      title: "Post not found",
      description: "",
    };
  }
  return {
    title: post.title,
    description: post.body,
  };
}

const FALLBACK_BLOG_IMAGE =
  "/2EC9BBC5-9CEE-4857-86E1-D2D61D8E4BE6_1_105_c.jpeg";

export default async function PostIdRoute({ params }: PostIdRouteProps) {
  const { postId } = await params;

  const token = await getToken();
  if (!postId) {
    notFound();
  }
  const [post, preloadedComments, userId] = await Promise.all([
    fetchQuery(api.posts.getPostById, { postId }),
    preloadQuery(api.comments.getCommentsByPostId, { postId }),
    fetchQuery(api.presence.getUserId, {}, { token }),
  ]);
  if (!post) {
    return (
      <h1 className="text-6xl font-extrabold text-red-500 py-20">
        Post not found
      </h1>
    );
  }

  const imageSrc =
    typeof post.imageUrl === "string" && post.imageUrl.trim().length > 0
      ? post.imageUrl
      : FALLBACK_BLOG_IMAGE;
  const shouldBypassOptimization =
    imageSrc.startsWith("https://") || imageSrc.startsWith("http://");

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 animate-in fade-in duration-500 relative">
      <Link
        className={buttonVariants({ variant: "ghost", className: "mb-4" })}
        href="/blog"
      >
        <ArrowLeft className="size-4" />
        Back to Blog
      </Link>

      <div className="relative w-full h-100 mb-8 rounded-xl overflow-hidden shadow-sm">
        <Image
          src={imageSrc}
          alt={post.title}
          fill
          unoptimized={shouldBypassOptimization}
          className="object-cover hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="space-y-4 flex flex-col">
        <h1 className="text-4xl font-bold -tracking-tight text-foreground">
          {post.title}
        </h1>
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Posted on: {new Date(post._creationTime).toLocaleDateString()}
          </p>
          {userId && <PostPresence roomId={post._id} userId={userId} />}
        </div>
      </div>
      <Separator className="my-8" />
      <p className="text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap">
        {post.body}
      </p>
      <Separator className="my-8" />
      <CommentSection preloadedComments={preloadedComments} />
    </div>
  );
}
