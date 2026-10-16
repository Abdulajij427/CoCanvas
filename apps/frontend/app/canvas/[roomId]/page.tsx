import { Suspense } from "react";
import { notFound } from "next/navigation";
import { RoomCanvas } from "@/components/roomCanvas";

async function CanvasContent({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  const id = Number(roomId);
  if (!Number.isInteger(id)) notFound();
  return <RoomCanvas roomId={id} />;
}

export default function CanvasPage({ params }: { params: Promise<{ roomId: string }> }) {
  return (
    <Suspense fallback={<div>Loading canvas...</div>}>
      <CanvasContent params={params} />
    </Suspense>
  );
}