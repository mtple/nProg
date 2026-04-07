import { Suspense } from "react";
import CollectionDetail from "@/components/Collection/CollectionDetail";
import Scribble from "@/components/ui/Scribble";

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = await params;
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-32">
            <Scribble className="h-20 w-20 text-zinc-500" />
          </div>
        }
      >
        <CollectionDetail address={address} />
      </Suspense>
    </div>
  );
}
