"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok && data.token) {
      localStorage.setItem("elizi_token", data.token);
      router.push("/admin/panel");
    } else {
      setError(data.error || "Giriş başarısız");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <form
        onSubmit={handleSubmit}
        className="bg-[#f6fdff] p-8 rounded-xl shadow-md w-full max-w-sm flex flex-col gap-4"
      >
        <h1 className="text-2xl font-bold text-[#009cb1] mb-4 text-center">Yönetici Girişi</h1>
        <input
          type="text"
          placeholder="Kullanıcı Adı"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#009cb1]"
          required
        />
        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#009cb1]"
          required
        />
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        <button
          type="submit"
          className="bg-[#009cb1] text-white font-semibold rounded py-2 mt-2 hover:bg-[#007a8a] transition"
        >
          Giriş Yap
        </button>
      </form>
    </div>
  );
} 