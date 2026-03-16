import CollectionDetail from "@/components/Collection/CollectionDetail";

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = await params;
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <CollectionDetail address={address} />
    </div>
  );
}
