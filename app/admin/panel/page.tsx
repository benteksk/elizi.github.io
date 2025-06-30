"use client";
import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
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

type Review = {
  id: number;
  name: string;
  comment: string;
  approved: boolean;
};

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      className={`px-4 py-2 rounded-t font-semibold border-b-2 transition-colors ${active ? "border-[#009cb1] text-[#009cb1] bg-[#f6fdff]" : "border-transparent text-gray-500 bg-white hover:bg-[#f6fdff]"}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default function AdminPanel() {
  const [tab, setTab] = useState<'portfolios' | 'reviews'>("portfolios");
  const [tokenChecked, setTokenChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("elizi_token");
    if (!token) router.replace("/admin/login");
    else setTokenChecked(true);
  }, [router]);

  if (!tokenChecked) return null;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center py-8">
      <h1 className="text-2xl font-bold text-[#009cb1] mb-6">Yönetici Paneli</h1>
      <div className="flex gap-2 mb-8">
        <TabButton active={tab === "portfolios"} onClick={() => setTab("portfolios")}>Portföyler</TabButton>
        <TabButton active={tab === "reviews"} onClick={() => setTab("reviews")}>Yorumlar</TabButton>
      </div>
      <div className="w-full max-w-4xl">
        {tab === "portfolios" ? <PortfolioManager /> : <ReviewManager />}
      </div>
    </div>
  );
}

function PortfolioManager() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<{ title: string; description: string; price: string; address: string; mapUrl: string; images: File[] }>({ title: "", description: "", price: "", address: "", mapUrl: "", images: [] });
  const [success, setSuccess] = useState("");

  const fetchPortfolios = async () => {
    setLoading(true);
    const res = await fetch("/api/portfolios");
    const data: Portfolio[] = await res.json();
    setPortfolios(data);
    setLoading(false);
  };

  useEffect(() => { fetchPortfolios(); }, []);

  const handleInput = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (name === "images" && files) setForm(f => ({ ...f, images: Array.from(files) }));
    else setForm(f => ({ ...f, [name]: value }));
  };

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    setSuccess("");
    const token = localStorage.getItem("elizi_token");
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === "images") (v as File[]).forEach(file => formData.append("images", file));
      else formData.append(k, v as string);
    });
    const res = await fetch("/api/portfolios", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (res.ok) {
      setSuccess("Portföy eklendi!");
      setForm({ title: "", description: "", price: "", address: "", mapUrl: "", images: [] });
      fetchPortfolios();
    } else {
      setSuccess("Ekleme başarısız");
    }
  };

  return (
    <div className="bg-[#f6fdff] rounded-xl shadow p-6">
      <h2 className="text-xl font-semibold text-[#009cb1] mb-4">Portföy Yönetimi</h2>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8" onSubmit={handleAdd}>
        <input name="title" value={form.title} onChange={handleInput} placeholder="Başlık" className="border rounded px-3 py-2" required />
        <input name="price" value={form.price} onChange={handleInput} placeholder="Günlük Fiyat" className="border rounded px-3 py-2" required />
        <input name="address" value={form.address} onChange={handleInput} placeholder="Adres" className="border rounded px-3 py-2" required />
        <input name="mapUrl" value={form.mapUrl} onChange={handleInput} placeholder="Google Maps Linki" className="border rounded px-3 py-2" />
        <textarea name="description" value={form.description} onChange={handleInput} placeholder="Açıklama" className="border rounded px-3 py-2 md:col-span-2" required />
        <input name="images" type="file" multiple accept="image/*" onChange={handleInput} className="md:col-span-2" />
        <button type="submit" className="bg-[#009cb1] text-white rounded py-2 font-semibold md:col-span-2">Ekle</button>
      </form>
      {success && <div className={`mb-2 ${success.includes("başarısız") ? "text-red-500" : "text-green-600"}`}>{success}</div>}
      {loading ? <div>Yükleniyor...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {portfolios.map((p) => (
            <div key={p.id} className="bg-white rounded shadow p-4 flex flex-col gap-2">
              {p.images && p.images[0] && <Image src={p.images[0]} alt={p.title} width={320} height={160} className="rounded w-full h-40 object-cover" unoptimized />}
              <div className="font-bold text-[#009cb1]">{p.title}</div>
              <div className="text-gray-700">{p.description}</div>
              <div className="text-sm text-gray-500">{p.address}</div>
              <div className="text-[#009cb1] font-bold">{p.price} TL / Günlük</div>
              {p.mapUrl && <a href={p.mapUrl} target="_blank" className="text-xs underline text-[#009cb1]">Haritada Göster</a>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewManager() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);
    const token = localStorage.getItem("elizi_token");
    const res = await fetch("/api/reviews?all=1", { headers: { Authorization: `Bearer ${token}` } });
    const data: Review[] = await res.json();
    setReviews(data);
    setLoading(false);
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleApprove = async (id: number) => {
    const token = localStorage.getItem("elizi_token");
    await fetch(`/api/reviews/${id}/approve`, { method: "PUT", headers: { Authorization: `Bearer ${token}` } });
    fetchReviews();
  };
  const handleDelete = async (id: number) => {
    const token = localStorage.getItem("elizi_token");
    await fetch(`/api/reviews/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    fetchReviews();
  };

  return (
    <div className="bg-[#f6fdff] rounded-xl shadow p-6">
      <h2 className="text-xl font-semibold text-[#009cb1] mb-4">Yorum Yönetimi</h2>
      {loading ? <div>Yükleniyor...</div> : (
        <div className="flex flex-col gap-4">
          {reviews.length === 0 && <div>Yorum yok.</div>}
          {reviews.map((r) => (
            <div key={r.id} className="bg-white rounded shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <div className="font-bold text-[#009cb1]">{r.name}</div>
                <div className="text-gray-700">{r.comment}</div>
                <div className="text-xs text-gray-500">{r.approved ? "Onaylı" : "Onaysız"}</div>
              </div>
              <div className="flex gap-2">
                {!r.approved && <button onClick={() => handleApprove(r.id)} className="bg-[#009cb1] text-white rounded px-3 py-1 text-sm">Onayla</button>}
                <button onClick={() => handleDelete(r.id)} className="bg-red-500 text-white rounded px-3 py-1 text-sm">Sil</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 