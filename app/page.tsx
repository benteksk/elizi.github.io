"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type Portfolio = {
  id: number;
  title: string;
  description: string;
  price: number | string;
  address: string;
  mapUrl?: string;
  images: string[];
};

type Review = {
  id: number;
  name: string;
  comment: string;
  approved: boolean;
};

function PortfolioCard({ p }: { p: Portfolio }) {
  return (
    <Link href={`/portfolio/${p.id}`} className="bg-[#f6fdff] rounded-xl shadow p-4 flex flex-col items-center hover:scale-[1.02] transition">
      {p.images && p.images[0] && (
        <Image src={p.images[0]} alt={p.title} width={320} height={160} className="rounded-lg mb-2 w-full h-40 object-cover" unoptimized />
      )}
      <h3 className="text-lg font-semibold text-[#009cb1]">{p.title}</h3>
      <p className="text-gray-700 mb-2">{p.address}</p>
      <p className="text-[#009cb1] font-bold mb-2">{p.price} TL / Günlük</p>
      <span className="text-sm underline text-[#009cb1]">Detayları Gör</span>
    </Link>
  );
}

export default function Home() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewForm, setReviewForm] = useState({ name: "", comment: "" });
  const [reviewMsg, setReviewMsg] = useState("");

  useEffect(() => {
    fetch("/api/portfolios").then(r => r.json()).then(setPortfolios);
    fetch("/api/reviews").then(r => r.json()).then(setReviews);
  }, []);

  const handleReviewInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setReviewForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewMsg("");
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reviewForm),
    });
    if (res.ok) {
      setReviewMsg("Yorumunuz gönderildi, onay sonrası yayınlanacaktır.");
      setReviewForm({ name: "", comment: "" });
    } else {
      setReviewMsg("Bir hata oluştu.");
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-white">
      {/* Logo */}
      <header className="w-full flex flex-col items-center py-8">
        <Image src="/logo.png" alt="Elizi Emlak Logo" width={350} height={80} priority />
        <div className="flex gap-4 mt-4">
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
            <Image src="/instagram.svg" alt="Instagram" width={32} height={32} />
          </a>
          <a href="https://wa.me/" target="_blank" rel="noopener noreferrer">
            <Image src="/whatsapp.svg" alt="WhatsApp" width={32} height={32} />
          </a>
        </div>
      </header>

      {/* Portföyler */}
      <main className="w-full max-w-5xl flex-1 px-4 py-8">
        <h2 className="text-2xl font-bold mb-6 text-[#009cb1]">Günlük Kiralık Portföyler</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {portfolios.length === 0 && <div>Portföy bulunamadı.</div>}
          {portfolios.map(p => <PortfolioCard key={p.id} p={p} />)}
        </div>
      </main>

      {/* Referanslar */}
      <section className="w-full max-w-3xl px-4 py-8">
        <h2 className="text-xl font-bold mb-4 text-[#009cb1]">Müşteri Yorumları</h2>
        <div className="flex flex-col gap-4">
          {reviews.length === 0 && <div>Henüz yorum yok.</div>}
          {reviews.map(r => (
            <div key={r.id} className="bg-[#f6fdff] rounded-xl shadow p-4">
              <p className="text-gray-800 italic">“{r.comment}”</p>
              <span className="block text-right text-sm text-gray-500 mt-2">- {r.name}</span>
            </div>
          ))}
        </div>
        {/* Yorum ekleme formu */}
        <form className="mt-8 flex flex-col gap-2 bg-[#f6fdff] rounded-xl shadow p-4" onSubmit={handleReviewSubmit}>
          <h3 className="font-semibold text-[#009cb1]">Yorumunuzu bırakın</h3>
          <input name="name" value={reviewForm.name} onChange={handleReviewInput} placeholder="Adınız" className="border rounded px-3 py-2" required />
          <textarea name="comment" value={reviewForm.comment} onChange={handleReviewInput} placeholder="Yorumunuz" className="border rounded px-3 py-2" required />
          <button type="submit" className="bg-[#009cb1] text-white rounded py-2 font-semibold">Gönder</button>
          {reviewMsg && <div className="text-sm text-center text-[#009cb1] mt-2">{reviewMsg}</div>}
        </form>
      </section>
    </div>
  );
}
