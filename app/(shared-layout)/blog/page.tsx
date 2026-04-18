import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
// import { api } from "@/convex/_generated/api";
// import { useQuery } from "convex/react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
// import { Suspense } from "react";

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

      <Suspense
        fallback={<p className="text-5xl text-red-500 px-12">Loading...</p>}
      >
        <LoadBlogList />
      </Suspense>
    </div>
  );
}

async function LoadBlogList() {
  await new Promise((resolve) => setTimeout(resolve, 5000));
  const data = await fetchQuery(api.posts.getPosts);
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {data?.map((post) => (
        <Card key={post._id} className="pt-0">
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={"/2EC9BBC5-9CEE-4857-86E1-D2D61D8E4BE6_1_105_c.jpeg"}
              alt="textabc"
              fill
            />
          </div>
          <CardContent>
            <Link href={`/blog/${post._id}`}>
              <h1 className="text-2xl font-bold text-primary">{post.title}</h1>
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
      ))}
    </div>
  );
}
