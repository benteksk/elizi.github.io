const portfoyler = [
    "Çandarlı Denizköy yolu üzeri havuzlu villa",
    "Şahap Bora Parkı Orası 1+1 Dikili",
    "Çandarlı barış market üstü dublex daire",
    "Çandarlı ayten hanım konaklarının karşısı villa bahçeli",
    "Çandarlı merkez a101'in üstü",
    "Hacı abinin otel var",
    "Şato otelin orada 1+1 kiralık daire",
    "Dikilide bizim ofisin üstü 3+1 dubleks daire",
    "Çandarlı stadyumun orada 1+1 daire",
    "Gazipasa mh belediye sosyal tesisi ya",
    "Denize sıfır 4000 ₺ – Dikili"
];

const portfoyListesiDiv = document.getElementById("portfoyListesi");
portfoyler.forEach((portfoy, index) => {
    const portfoyDiv = document.createElement("div");
    portfoyDiv.innerHTML = `<button onclick="window.location.href='rezervasyon.html?portfoy=${index}'">${portfoy}</button>`;
    portfoyListesiDiv.appendChild(portfoyDiv);
});