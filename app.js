import { db } from "./firebase.js";
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let carKeys = [];
let currentSelectedKeyId = null;

const keyContainer = document.getElementById('keyContainer');
const searchInput = document.getElementById('searchInput');

const keyModal = document.getElementById('keyModal');
const openModalBtn = document.getElementById('openModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const addKeyForm = document.getElementById('addKeyForm');
const modalTitle = document.getElementById('modalTitle');
const saveBtnText = document.getElementById('saveBtnText');
const editKeyIdInput = document.getElementById('editKeyId');

const imageInput = document.getElementById('imageInput');
const imageFileInput = document.getElementById('imageFileInput');

const detailModal = document.getElementById('detailModal');
const detailImage = document.getElementById('detailImage');
const detailTitle = document.getElementById('detailTitle');
const detailYears = document.getElementById('detailYears');
const detailChips = document.getElementById('detailChips');
const detailNote = document.getElementById('detailNote');
const detailNoteContainer = document.getElementById('detailNoteContainer');
const editKeyBtn = document.getElementById('editKeyBtn');
const deleteKeyBtn = document.getElementById('deleteKeyBtn');

async function fetchKeysFromFirebase() {
    try {
        // FadeArc animasiyası
        keyContainer.innerHTML = `
            <svg class="fade-arc-spinner" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="leading" x1="50%" x2="50%" y1="5.271%" y2="91.793%">
                        <stop offset="0%" stop-color="currentColor" />
                        <stop offset="100%" stop-color="currentColor" stop-opacity="0.55" />
                    </linearGradient>
                    <linearGradient id="trailing" x1="50%" x2="50%" y1="15.24%" y2="87.15%">
                        <stop offset="0%" stop-color="currentColor" stop-opacity="0" />
                        <stop offset="100%" stop-color="currentColor" stop-opacity="0.55" />
                    </linearGradient>
                </defs>
                <g fill="none">
                    <path d="M8.749.021a1.5 1.5 0 0 1 .497 2.958A7.5 7.5 0 0 0 3 10.375a7.5 7.5 0 0 0 7.5 7.5v3c-5.799 0-10.5-4.7-10.5-10.5C0 5.23 3.726.865 8.749.021" fill="url(#leading)" transform="translate(1.5 1.625)" />
                    <path d="M15.392 2.673a1.5 1.5 0 0 1 2.119-.115A10.48 10.48 0 0 1 21 10.375c0 5.8-4.701 10.5-10.5 10.5v-3a7.5 7.5 0 0 0 5.007-13.084a1.5 1.5 0 0 1-.115-2.118" fill="url(#trailing)" transform="translate(1.5 1.625)" />
                </g>
            </svg>
        `;
        
        const querySnapshot = await getDocs(collection(db, "carKeys"));
        carKeys = [];
        querySnapshot.forEach((doc) => {
            carKeys.push({ id: doc.id, ...doc.data() });
        });
        displayKeys(carKeys);
    } catch (error) {
        console.error("Məlumat oxunarkən xəta baş verdi: ", error);
        keyContainer.innerHTML = `<div class="no-result">Bağlantı xətası! Qaydaları yoxlayın.</div>`;
    }
}

function displayKeys(keys) {
    keyContainer.innerHTML = "";
    
    if (keys.length === 0) {
        keyContainer.innerHTML = `<div class="no-result">Açar tapılmadı...</div>`;
        return;
    }

    keys.forEach(key => {
        const card = document.createElement('div');
        card.className = 'key-card';
        card.innerHTML = `
            <img src="${key.image}" alt="${key.brand} ${key.model}" class="key-image">
            <div class="key-info">
                <div class="key-title">${key.brand} ${key.model}</div>
                <div class="key-details">İl: ${key.years}</div>
                <span class="key-badge">${key.chips}</span>
            </div>
        `;

        card.addEventListener('click', () => {
            currentSelectedKeyId = key.id;

            detailImage.src = key.image;
            detailTitle.textContent = `${key.brand} ${key.model}`;
            detailYears.textContent = key.years;
            detailChips.textContent = key.chips;
            
            if (key.note && key.note.trim() !== "") {
                detailNote.textContent = key.note;
                detailNoteContainer.style.display = "block";
            } else {
                detailNoteContainer.style.display = "none";
            }

            openModal(detailModal);
        });

        keyContainer.appendChild(card);
    });
}

function filterKeys() {
    const searchTerm = searchInput.value.toLowerCase();
    const filtered = carKeys.filter(key => 
        key.brand.toLowerCase().includes(searchTerm) || 
        key.model.toLowerCase().includes(searchTerm) ||
        key.chips.toLowerCase().includes(searchTerm) ||
        key.years.toLowerCase().includes(searchTerm) ||
        (key.note && key.note.toLowerCase().includes(searchTerm))
    );
    displayKeys(filtered);
}

// Fayl seçildikdə şəkli birbaşa data:image/ (Base64) formatına çevirib inputa yazır
imageFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
        alert("Diqqət: Seçdiyiniz şəkil bir qədər böyükdür. Daha sürətli işləməsi üçün kiçik ölçülü şəkil seçməyiniz məsləhətdir.");
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        imageInput.value = event.target.result;
    };
    reader.readAsDataURL(file);
});

openModalBtn.addEventListener('click', () => {
    modalTitle.textContent = "Yeni Açar Əlavə Et";
    saveBtnText.textContent = "Yadda Saxla";
    editKeyIdInput.value = "";
    addKeyForm.reset();
    imageFileInput.value = "";
    openModal(keyModal);
});


// Açarı redaktə düyməsi
editKeyBtn.addEventListener('click', () => {
    const keyData = carKeys.find(k => k.id === currentSelectedKeyId);
    if (!keyData) return;

    document.getElementById('brandInput').value = keyData.brand;
    document.getElementById('modelInput').value = keyData.model;
    document.getElementById('yearsInput').value = keyData.years;
    document.getElementById('chipsInput').value = keyData.chips;
    document.getElementById('imageInput').value = keyData.image;
    document.getElementById('noteInput').value = keyData.note || "";
    editKeyIdInput.value = keyData.id;
    imageFileInput.value = "";

    modalTitle.textContent = "Açarı Redaktə Et";
    saveBtnText.textContent = "Yenilə";

    detailModal.classList.remove('active');
    openModal(keyModal);
});

// Açarı sil düyməsi
deleteKeyBtn.addEventListener('click', async () => {
    if (!currentSelectedKeyId) return;

    const confirmDelete = confirm("Bu açarı bazadan silmək istədiyinizə əminsinizmi?");
    if (!confirmDelete) return;

    try {
        await deleteDoc(doc(db, "carKeys", currentSelectedKeyId));
        detailModal.classList.remove('active');
        await fetchKeysFromFirebase();
    } catch (error) {
        console.error("Silinmə xətası: ", error);
        alert("Açar silinərkən xəta baş verdi!");
    }
});

addKeyForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const editId = editKeyIdInput.value;
    const keyData = {
        brand: document.getElementById('brandInput').value,
        model: document.getElementById('modelInput').value,
        years: document.getElementById('yearsInput').value,
        chips: document.getElementById('chipsInput').value,
        image: document.getElementById('imageInput').value,
        note: document.getElementById('noteInput').value
    };

    try {
        if (editId) {
            const keyRef = doc(db, "carKeys", editId);
            await updateDoc(keyRef, keyData);
        } else {
            await addDoc(collection(db, "carKeys"), keyData);
        }

        addKeyForm.reset();
        keyModal.classList.remove('active');
        await fetchKeysFromFirebase();
    } catch (error) {
        console.error("Əməliyyat xətası: ", error);
        alert("Xəta baş verdi, məlumat yadda saxlanılmadı!");
    }
});

searchInput.addEventListener('keyup', filterKeys);

fetchKeysFromFirebase();


// Yeni açar modalının kənarına klikləndikdə bağlanması
keyModal.addEventListener('click', (e) => {
    if (e.target === keyModal) {
        keyModal.classList.remove('active');
    }
});

// Detal modalının kənarına klikləndikdə bağlanması
detailModal.addEventListener('click', (e) => {
    if (e.target === detailModal) {
        detailModal.classList.remove('active');
    }
});

const imageModal = document.getElementById('imageModal');
const fullImage = document.getElementById('fullImage');

// Şəklə kliklədikdə böyük pəncərəni açır
detailImage.addEventListener('click', () => {
    fullImage.src = detailImage.src;
    openModal(imageModal);
});

// Şəkil modalının kənarına kliklədikdə bağlanır
imageModal.addEventListener('click', (e) => {
    if (e.target === imageModal) {
        imageModal.classList.remove('active');
    }
});

// Telefonun geri (back) düyməsinə basıldıqda modalları bağlamaq üçün
window.addEventListener('popstate', () => {
    if (imageModal.classList.contains('active')) {
        imageModal.classList.remove('active');
    } else if (detailModal.classList.contains('active')) {
        detailModal.classList.remove('active');
    } else if (keyModal.classList.contains('active')) {
        keyModal.classList.remove('active');
    }
});

// Modal açılan yerlərdə tarixçəyə state əlavə etmək üçün köməkçi funksiya
function openModal(modalElement) {
    history.pushState({ modalOpen: true }, "");
    modalElement.classList.add('active');
}

const chipsInput = document.getElementById('chipsInput');

// Çip inputuna fokuslananda (klikləndikdə) əgər boşdursa avtomatik "ID" yazır
chipsInput.addEventListener('focus', () => {
    if (!chipsInput.value.startsWith("ID")) {
        chipsInput.value = "ID" + chipsInput.value;
    }
});

// İstifadəçi yazmağa başlayarkən "ID" sözünün silinməsinin qarşısını alır və ya tənzimləyir
chipsInput.addEventListener('input', (e) => {
    if (!chipsInput.value.toUpperCase().startsWith("ID")) {
        chipsInput.value = "ID" + chipsInput.value.replace(/[^0-9]/g, '');
    }
});

// İstədiyiniz markaları burada artırıb/azalda bilərsiniz
const popularBrands = [
    "Toyota", "Hyundai", "Kia", "Mercedes", "BMW", 
    "Chevrolet", "Nissan", "Ford", "Volkswagen", "Renault", 
    "Lada", "Mitsubishi", "Honda", "Mazda", "Subaru", "Lexus", "Audi"
];

const brandInput = document.getElementById('brandInput');
const brandSuggestions = document.getElementById('brandSuggestions');

// Marka inputuna yazdıqda və ya fokuslandıqda işləyir
brandInput.addEventListener('input', () => {
    const value = brandInput.value.toLowerCase();
    brandSuggestions.innerHTML = "";

    if (!value) {
        brandSuggestions.style.display = "none";
        return;
    }

    const filteredBrands = popularBrands.filter(brand => 
        brand.toLowerCase().includes(value)
    );

    if (filteredBrands.length > 0) {
        filteredBrands.forEach(brand => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.textContent = brand;
            
            item.addEventListener('click', () => {
                brandInput.value = brand;
                brandSuggestions.style.display = "none";
            });

            brandSuggestions.appendChild(item);
        });
        brandSuggestions.style.display = "block";
    } else {
        brandSuggestions.style.display = "none";
    }
});

// Inputdan fokus gedəndə siyahını bağlamaq (klikləməyə imkan vermək üçün gecikmə ilə)
brandInput.addEventListener('blur', () => {
    setTimeout(() => {
        brandSuggestions.style.display = "none";
    }, 200);
});

// Fokuslananda əgər mətn varsa yenidən göstər
brandInput.addEventListener('focus', () => {
    if (brandInput.value) {
        brandInput.dispatchEvent(new Event('input'));
    }
});