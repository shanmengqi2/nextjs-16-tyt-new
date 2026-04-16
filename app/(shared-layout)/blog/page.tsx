"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";

export default function BlogPage() {
  const data = useQuery(api.posts.getPosts);
  return (
    <div>
      <p>{data?.[0].title}</p>
    </div>
  );
}
