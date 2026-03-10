import MomentDetail from "@/components/Moment/MomentDetail";

export default async function MomentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <MomentDetail id={id} />
    </div>
  );
}
