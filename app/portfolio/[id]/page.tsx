"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

type Portfolio = {
  id: number;
  title: string;
  description: string;
  price: number | string;
  address: string;
  mapUrl?: string;
  images: string[];
};

export default function PortfolioDetail() {
  const { id } = useParams();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/portfolios`).then(r => r.json()).then((data: Portfolio[]) => {
      const p = data.find((x) => String(x.id) === String(id));
      setPortfolio(p || null);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="p-8 text-center">Yükleniyor...</div>;
  if (!portfolio) return <div className="p-8 text-center">Portföy bulunamadı.</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-[#009cb1] mb-4">{portfolio.title}</h1>
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        {/* Görseller */}
        <div className="flex-1 flex flex-col gap-2">
          {portfolio.images && portfolio.images.length > 0 ? (
            <Image src={portfolio.images[0]} alt={portfolio.title} width={600} height={300} className="rounded-xl w-full h-64 object-cover" unoptimized />
          ) : (
            <div className="bg-gray-100 rounded-xl w-full h-64 flex items-center justify-center text-gray-400">Görsel yok</div>
          )}
          <div className="flex gap-2 mt-2">
            {portfolio.images && portfolio.images.slice(1).map((img, i) => (
              <Image key={i} src={img} alt="Ek görsel" width={80} height={64} className="rounded w-20 h-16 object-cover border" unoptimized />
            ))}
          </div>
        </div>
        {/* Bilgiler */}
        <div className="flex-1 flex flex-col gap-2">
          <div className="text-[#009cb1] font-bold text-xl">{portfolio.price} TL / Günlük</div>
          <div className="text-gray-700">{portfolio.description}</div>
          <div className="text-gray-500 text-sm">Adres: {portfolio.address}</div>
          {portfolio.mapUrl && (
            <a href={portfolio.mapUrl} target="_blank" className="text-xs underline text-[#009cb1]">Google Maps'te Aç</a>
          )}
        </div>
      </div>
      {/* Google Maps Embed */}
      {portfolio.mapUrl && (
        <div className="mt-6">
          <iframe
            src={portfolio.mapUrl.replace("/maps/", "/maps/embed?")}
            width="100%"
            height="300"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      )}
    </div>
  );
} 