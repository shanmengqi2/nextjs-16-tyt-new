import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { Metadata } from "next";
import { cacheTag } from "next/cache";
import { cacheLife } from "next/cache";
// import { api } from "@/convex/_generated/api";
// import { useQuery } from "convex/react";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
// import { Suspense } from "react";
//
// export const dynamic = "force-dynamic";
// // 'auto' | 'force-dynamic' | 'force-static' | 'error'
// export const revalidate = 30;
// false | 0 | number
//
export const metadata: Metadata = {
  title: "Yumeki's Blog",
  description: "wow, wondeful blogs!!!",
};

const FALLBACK_BLOG_IMAGE =
  "/2EC9BBC5-9CEE-4857-86E1-D2D61D8E4BE6_1_105_c.jpeg";

export default function BlogPage() {
  // const data = useQuery(api.posts.getPosts);

  return (
    <div className="py-12">
      <div className="text-center pb-12">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Our Blog
        </h1>
        <p className="pt-4 max-w-2xl mx-auto text-xl text-muted-foreground">
          Insights, thoughts, and trends from our team.
        </p>
      </div>

      <LoadBlogList />
      {/*</Suspense>*/}
    </div>
  );
}

async function LoadBlogList() {
  // await new Promise((resolve) => setTimeout(resolve, 5000));
  "use cache";
  cacheLife("hours");
  cacheTag("blog");
  const data = await fetchQuery(api.posts.getPosts);
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {data?.map((post) => {
        const imageSrc =
          typeof post.imageUrl === "string" && post.imageUrl.trim().length > 0
            ? post.imageUrl
            : FALLBACK_BLOG_IMAGE;
        const shouldBypassOptimization =
          imageSrc.startsWith("https://") || imageSrc.startsWith("http://");

        return (
          <Card key={post._id} className="pt-0">
            <div className="relative h-48 w-full overflow-hidden">
              <Image
                src={imageSrc}
                alt="post image"
                fill
                unoptimized={shouldBypassOptimization}
                className="rounded-t-lg object-cover"
              />
            </div>
            <CardContent>
              <Link href={`/blog/${post._id}`}>
                <h1 className="text-2xl font-bold text-primary">
                  {post.title}
                </h1>
              </Link>
              <p className="text-muted-foreground line-clamp-3">{post.body}</p>
            </CardContent>
            <CardFooter>
              <Link
                href={`/blog/${post._id}`}
                className={buttonVariants({
                  className: "w-full",
                })}
              >
                Read more
              </Link>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}

function SkeletonLoadingUi() {
  return (
    <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex flex-col space-y-3">
          <Skeleton className="h-48 w-full rounded-xl" />
          <div className="space-y-2 flex flex-col">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
