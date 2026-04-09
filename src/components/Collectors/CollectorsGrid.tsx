"use client";

import CollectorTile from "./CollectorTile";
import type { CollectorStats } from "@/hooks/useCollectors";

export default function CollectorsGrid({ collectors }: { collectors: CollectorStats[] }) {
  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {collectors.map((c) => (
        <CollectorTile key={c.address.toLowerCase()} collector={c} />
      ))}
    </div>
  );
}
