import { Suspense } from "react";
import MomentDetail from "@/components/Moment/MomentDetail";
import Scribble from "@/components/ui/Scribble";

export default async function MomentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-32">
            <Scribble className="h-20 w-20 text-zinc-500" />
          </div>
        }
      >
        <MomentDetail id={id} />
      </Suspense>
    </div>
  );
}
