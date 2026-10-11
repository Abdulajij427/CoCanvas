import axios from "axios";
import { notFound } from "next/navigation";
import { BACKEND_URL } from "../../config";
import { ChatRoomClient } from "../../../components/ChatRoomClient";

async function getRoomId(slug: string): Promise<number | null> {
  try {
    const res = await axios.get(`${BACKEND_URL}/room/${slug}`);
    return res.data.roomId;
  } catch (e: any) {
    console.error("getRoomId failed:", e.message, e.response?.status);
    return null;
  }
}

export default async function ChatRoomPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const roomId = await getRoomId(slug);
  if (roomId === null) notFound();
  return <ChatRoomClient id={roomId} slug={slug} />;
}