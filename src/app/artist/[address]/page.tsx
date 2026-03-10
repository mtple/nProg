import FeedGrid from "@/components/Feed/FeedGrid";
import ArtistHeader from "@/components/Layout/ArtistHeader";

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = await params;
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <ArtistHeader address={address} />
      <FeedGrid artist={address} />
    </div>
  );
}
