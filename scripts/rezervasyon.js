const urlParams = new URLSearchParams(window.location.search);
const portfoyIndex = urlParams.get('portfoy');
const takvim = document.getElementById("takvim");
const rezervasyonListesiDiv = document.getElementById("rezervasyonListesi");

const rezervasyonlar = JSON.parse(localStorage.getItem(`rezervasyonlar_${portfoyIndex}`)) || [];

$(takvim).fullCalendar({
    events: rezervasyonlar.map((rezervasyon) => ({
        title: rezervasyon.musteriAdi,
        start: rezervasyon.girisTarihi,
        end: rezervasyon.cikisTarihi,
        description: `Komisyon: ${rezervasyon.komisyon} ₺`
    })),
    dayClick: function(date) {
        const musteriAdi = prompt("Müşteri Adı:");
        const komisyon = prompt("Komisyon Tutarı:");
        rezervasyonlar.push({
            musteriAdi,
            girisTarihi: date.format(),
            cikisTarihi: date.add(1, 'days').format(),
            komisyon
        });
        localStorage.setItem(`rezervasyonlar_${portfoyIndex}`, JSON.stringify(rezervasyonlar));
        location.reload();
    }
});

rezervasyonlar.forEach(rezervasyon => {
    const rezervasyonDiv = document.createElement("div");
    rezervasyonDiv.innerHTML = `
        <p>${rezervasyon.musteriAdi} - ${rezervasyon.girisTarihi} - ${rezervasyon.cikisTarihi} - Komisyon: ${rezervasyon.komisyon} ₺</p>
        <button onclick="sil('${rezervasyon.musteriAdi}')">Sil</button>
    `;
    rezervasyonListesiDiv.appendChild(rezervasyonDiv);
});

function sil(musteriAdi) {
    const yeniRezervasyonlar = rezervasyonlar.filter(r => r.musteriAdi !== musteriAdi);
    localStorage.setItem(`rezervasyonlar_${portfoyIndex}`, JSON.stringify(yeniRezervasyonlar));
    location.reload();
}