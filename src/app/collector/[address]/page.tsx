import CollectorPageClient from "./CollectorPageClient";

export default async function CollectorPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = await params;
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <CollectorPageClient address={address} />
    </div>
  );
}
