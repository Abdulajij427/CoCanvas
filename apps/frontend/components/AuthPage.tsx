"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { HTTP_BACKEND } from "@/config";

export function AuthPage({ isSignin }: { isSignin: boolean }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isSignin) {
        const res = await axios.post(`${HTTP_BACKEND}/signin`, { username, password });
        localStorage.setItem("token", res.data.token);
        router.push("/dashboard");
      } else {
        await axios.post(`${HTTP_BACKEND}/signup`, { name, username, password });
        router.push("/signin");
      }
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <form onSubmit={submit} className="p-6 m-2 bg-white rounded flex flex-col gap-3">
        {!isSignin && (
          <input value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Name" className="border rounded px-3 py-2 placeholder:text-gray-700" />
        )}
        <input value={username} onChange={(e) => setUsername(e.target.value)}
          placeholder="Username" className="border rounded px-3 py-2 placeholder:text-gray-700" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          placeholder="Password" className="border rounded px-3 py-2 placeholder:text-gray-700" />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" disabled={loading}
          className="bg-red-200 border rounded px-3 py-1 cursor-pointer">
          {loading ? "Please wait..." : isSignin ? "Sign in" : "Sign up"}
        </button>
      </form>
    </div>
  );
}