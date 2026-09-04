import { db } from "./firebase.js";
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let carKeys = [];
let currentSelectedKeyId = null;

const keyContainer = document.getElementById('keyContainer');
const searchInput = document.getElementById('searchInput');

const keyModal = document.getElementById('keyModal');
const openModalBtn = document.getElementById('openModalBtn');
const addKeyForm = document.getElementById('addKeyForm');
const modalTitle = document.getElementById('modalTitle');
const saveBtnText = document.getElementById('saveBtnText');
const editKeyIdInput = document.getElementById('editKeyId');

const imageInput = document.getElementById('imageInput');
const imageFileInput = document.getElementById('imageFileInput');
const cameraInput = document.getElementById('cameraInput');

const detailModal = document.getElementById('detailModal');
const detailImage = document.getElementById('detailImage');
const detailTitle = document.getElementById('detailTitle');
const detailYears = document.getElementById('detailYears');
const detailChips = document.getElementById('detailChips');
const detailNote = document.getElementById('detailNote');
const detailNoteContainer = document.getElementById('detailNoteContainer');
const editKeyBtn = document.getElementById('editKeyBtn');
const deleteKeyBtn = document.getElementById('deleteKeyBtn');
let selectedBrandFilter = null;
const filterByBrandBtn = document.getElementById('filterByBrandBtn');
const brandSelectModal = document.getElementById('brandSelectModal');
const brandSelectList = document.getElementById('brandSelectList');
const clearBrandFilter = document.getElementById('clearBrandFilter');
const keyBrandSelectModal = document.getElementById('keyBrandSelectModal');
const keyBrandSelectList = document.getElementById('keyBrandSelectList');
const brandSearchInput = document.getElementById('brandSearchInput');
const filterBrandSearchInput = document.getElementById('filterBrandSearchInput');
const priceInput = document.getElementById('priceInput');
const detailPrice = document.getElementById('detailPrice');

// Toast Bildiriş Sistemi
function showNotification(message, type = 'success') {
    let notifContainer = document.getElementById('toastContainer');
    if (!notifContainer) {
        notifContainer = document.createElement('div');
        notifContainer.id = 'toastContainer';
        document.body.appendChild(notifContainer);
    }

    const toast = document.createElement('div');
    toast.className = `toast-message ${type}`;
    toast.textContent = message;
    notifContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Xüsusi Təsdiq Pəncərəsi
function showConfirm(message, onConfirm) {
    let overlay = document.getElementById('customConfirmOverlay');
    if (overlay) overlay.remove();

    history.pushState({ modalOpen: true }, "");

    overlay = document.createElement('div');
    overlay.id = 'customConfirmOverlay';
    overlay.className = 'modal-overlay active';
    overlay.innerHTML = `
        <div class="modal-content" style="text-align: center;">
            <h2 style="font-size: 16px; margin-bottom: 20px;">${message}</h2>
            <div style="display: flex; gap: 10px;">
            <button id="confirmNo" class="btn-save" style="flex: 1; padding: 10px; background-color: #333;">Xeyr</button>
                <button id="confirmYes" class="btn-delete" style="flex: 1; padding: 10px;">Bəli</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    const closeConfirm = () => {
        if (overlay) overlay.remove();
    };

    document.getElementById('confirmYes').onclick = () => {
        closeConfirm();
        onConfirm();
    };
    
    document.getElementById('confirmNo').onclick = () => {
        closeConfirm();
    };

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeConfirm();
        }
    });
}

async function fetchKeysFromFirebase() {
    try {
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
        console.error("Məlumat oxunarkən xəta: ", error);
        keyContainer.innerHTML = `<div class="no-result">Bağlantı xətası! İnternetinizi yoxlayın.</div>`;
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
    
    // Çip şərti
    const chipsHtml = key.chips && key.chips.trim() !== "" ? `<span class="key-badge">ID ${key.chips}</span>` : '';
    // Qiymət şərti (Əgər qiymət yazılıbsa göstərsin)
    const priceHtml = key.price && key.price.trim() !== "" ? `<span style="font-size: 13px; font-weight: bold; color: #10b981;">${key.price} AZN</span>` : '';

    card.innerHTML = `
        <img src="${key.image}" alt="${key.brand} ${key.model}" class="key-image">
        <div class="key-info">
            <div class="key-title">${key.brand} ${key.model}</div>
            <div class="key-details">İl: ${key.years}</div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
                ${chipsHtml}
                ${priceHtml}
            </div>
        </div>
    `;

   card.addEventListener('click', () => {
    currentSelectedKeyId = key.id;
    detailImage.src = key.image;
    detailTitle.textContent = `${key.brand} ${key.model}`;
    detailYears.textContent = key.years;
    
    // Çip qutusu
    const chipsContainer = document.getElementById('detailChipsContainer');
    if (key.chips && key.chips.trim() !== "") {
        detailChips.textContent = "ID " + key.chips;
        chipsContainer.style.display = "flex";
    } else {
        chipsContainer.style.display = "none";
    }
    
    // Qiymət qutusu
    const priceContainer = document.getElementById('detailPriceContainer');
    if (key.price && key.price.trim() !== "") {
        detailPrice.textContent = key.price;
        priceContainer.style.display = "flex";
    } else {
        priceContainer.style.display = "none";
    }

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
    const searchTerm = searchInput.value.toLowerCase().trim();
    const filtered = carKeys.filter(key => {
        const matchesSearch = 
            key.brand.toLowerCase().includes(searchTerm) || 
            key.model.toLowerCase().includes(searchTerm) ||
            (key.chips && key.chips.toLowerCase().includes(searchTerm)) ||
            key.years.toLowerCase().includes(searchTerm) ||
            (key.note && key.note.toLowerCase().includes(searchTerm));
        
        const matchesBrand = selectedBrandFilter ? key.brand.trim().toLowerCase() === selectedBrandFilter.trim().toLowerCase() : true;

        return matchesSearch && matchesBrand;
    });
    displayKeys(filtered);
}

filterByBrandBtn.addEventListener('click', async () => {
    filterBrandSearchInput.value = ""; 
    await fetchBrandsFromFirebase();
    setupBrandFilterList();
    
    if (selectedBrandFilter) {
        clearBrandFilter.style.display = "block";
    } else {
        clearBrandFilter.style.display = "none";
    }
    
    openModal(brandSelectModal);
});

imageFileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    showNotification("Şəkil buluta yüklənir...", "success");
    try {
        const imageUrl = await uploadImageToImgBB(file);
        imageInput.value = imageUrl;
        showNotification("Şəkil uğurla yükləndi!", "success");
    } catch (error) {
        showNotification("Şəkil yüklənə bilmədi!", "error");
    }
});

cameraInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    showNotification("Kamera şəkli buluta yüklənir...", "success");
    try {
        const imageUrl = await uploadImageToImgBB(file);
        imageInput.value = imageUrl;
        showNotification("Şəkil uğurla yükləndi!", "success");
    } catch (error) {
        showNotification("Şəkil yüklənə bilmədi!", "error");
    }
});

openModalBtn.addEventListener('click', () => {
    openModal(choiceModal);
});

editKeyBtn.addEventListener('click', () => {
    const keyData = carKeys.find(k => k.id === currentSelectedKeyId);
    if (!keyData) return;

    document.getElementById('brandInput').value = keyData.brand;
    document.getElementById('modelInput').value = keyData.model;
    document.getElementById('yearsInput').value = keyData.years;
    document.getElementById('chipsInput').value = keyData.chips || "";
    document.getElementById('priceInput').value = keyData.price || "";
    document.getElementById('imageInput').value = keyData.image;
    document.getElementById('noteInput').value = keyData.note || "";
    editKeyIdInput.value = keyData.id;
    imageFileInput.value = "";
    cameraInput.value = "";
    modalTitle.textContent = "Açarı Redaktə Et";
    saveBtnText.textContent = "Yenilə";

    closeModal(detailModal);
    openModal(keyModal);
});

deleteKeyBtn.addEventListener('click', () => {
    if (!currentSelectedKeyId) return;

    showConfirm("Təsdiqlə!", async () => {
        try {
            await deleteDoc(doc(db, "carKeys", currentSelectedKeyId));
            closeModal(detailModal);
            showNotification("Açar uğurla silindi!", "success");
            await fetchKeysFromFirebase();
        } catch (error) {
            console.error("Silinmə xətası: ", error);
            showNotification("Açar silinərkən xəta baş verdi!", "error");
        }
    });
});

addKeyForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const brand = document.getElementById('brandInput').value.trim();
    const model = document.getElementById('modelInput').value.trim();
    const years = document.getElementById('yearsInput').value.trim();
    const chips = document.getElementById('chipsInput').value.trim();
    const image = document.getElementById('imageInput').value.trim();
    const price = document.getElementById('priceInput').value.trim(); // Qiyməti buradan götürürük
    const note = document.getElementById('noteInput').value.trim();
    const editKeyId = editKeyIdInput.value;

    if (!brand || !model || !years || !image) {
        showNotification("Zəhmət olmasa tələb olunan xanaları doldurun!", "error");
        return;
    }

    const keyData = {
        brand,
        model,
        years,
        chips,
        image,
        price, // Bazaya yazılacaq obyektə əlavə edilibmi?
        note: note || ""
    };

    try {
        if (editKeyId) {
            // Mövcud açarı yenilə
            await updateDoc(doc(db, "carKeys", editKeyId), keyData);
            showNotification("Açar uğurla yeniləndi!", "success");
        } else {
            // Yeni açar əlavə et
            await addDoc(collection(db, "carKeys"), keyData);
            showNotification("Açar uğurla əlavə olundu!", "success");
        }

        closeModal(keyModal);
        await fetchKeysFromFirebase();
    } catch (error) {
        console.error("Xəta baş verdi: ", error);
        showNotification("Əməliyyat uğursuz oldu!", "error");
    }
});

searchInput.addEventListener('keyup', filterKeys);
fetchKeysFromFirebase();

keyModal.addEventListener('click', (e) => {
    if (e.target === keyModal) closeModal(keyModal);
});

detailModal.addEventListener('click', (e) => {
    if (e.target === detailModal) closeModal(detailModal);
});

const imageModal = document.getElementById('imageModal');
const fullImage = document.getElementById('fullImage');

detailImage.addEventListener('click', () => {
    fullImage.src = detailImage.src;
    openModal(imageModal);
});

imageModal.addEventListener('click', (e) => {
    if (e.target === imageModal) closeModal(imageModal);
});

window.addEventListener('popstate', () => {
    const confirmOverlay = document.getElementById('customConfirmOverlay');
    if (confirmOverlay) {
        confirmOverlay.remove();
    } else if (typeof noteModal !== 'undefined' && noteModal.classList.contains('active')) {
        closeModal(noteModal);
    } else if (imageModal.classList.contains('active')) {
        closeModal(imageModal);
    } else if (detailModal.classList.contains('active')) {
        closeModal(detailModal);
    } else if (brandSelectModal.classList.contains('active')) {
        closeModal(brandSelectModal);
    } else if (keyBrandSelectModal.classList.contains('active')) {
        closeModal(keyBrandSelectModal);
    } else if (keyModal.classList.contains('active')) {
        closeModal(keyModal);
    } else if (choiceModal.classList.contains('active')) {
        closeModal(choiceModal);
    } else if (brandAddModal.classList.contains('active')) {
        closeModal(brandAddModal);
    }else if (editBrandModal.classList.contains('active')) {
        closeModal(editBrandModal);
        brandAddModal.classList.add('active'); // Geri düyməsi ilə bağlandıqda arxadakı pəncərəni bərpa et
    }
});

function openModal(modalElement) {
    if (!modalElement) return;
    history.pushState({ modalOpen: true }, "");
    modalElement.classList.add('active');
}

function closeModal(modalElement) {
    if (modalElement) {
        modalElement.classList.remove('active');
    }
}

const noteModal = document.getElementById('noteModal');
const openNoteModalBtn = document.getElementById('openNoteModalBtn');
const editNoteForm = document.getElementById('editNoteForm');
const quickNoteInput = document.getElementById('quickNoteInput');

openNoteModalBtn.addEventListener('click', () => {
    const keyData = carKeys.find(k => k.id === currentSelectedKeyId);
    if (!keyData) return;

    quickNoteInput.value = keyData.note || "";
    openModal(noteModal);
});

noteModal.addEventListener('click', (e) => {
    if (e.target === noteModal) {
        closeModal(noteModal);
    }
});

editNoteForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentSelectedKeyId) return;

    const saveBtn = editNoteForm.querySelector('button[type="submit"]');
    saveBtn.classList.add('btn-loading');
    saveBtn.disabled = true;

    const newNoteVal = quickNoteInput.value.trim();

    try {
        const keyRef = doc(db, "carKeys", currentSelectedKeyId);
        await updateDoc(keyRef, { note: newNoteVal });

        const keyData = carKeys.find(k => k.id === currentSelectedKeyId);
        if (keyData) keyData.note = newNoteVal;

        if (newNoteVal !== "") {
            detailNote.textContent = newNoteVal;
            detailNoteContainer.style.display = "block";
        } else {
            detailNoteContainer.style.display = "none";
        }

        closeModal(noteModal);
        showNotification("Qeyd uğurla yeniləndi!", "success");
        await fetchKeysFromFirebase();
    } catch (error) {
        console.error("Qeyd yenilənmə xətası: ", error);
        showNotification("Qeyd yenilənərkən xəta baş verdi!", "error");
    } finally {
        saveBtn.classList.remove('btn-loading');
        saveBtn.disabled = false;
    }
});

async function uploadImageToImgBB(file) {
    const apiKey = "4051df84ed1e0dbe5f13f79db310ca45";
    const formData = new FormData();
    formData.append("image", file);

    try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
            method: "POST",
            body: formData
        });
        const data = await response.json();
        
        if (data.success) {
            return data.data.url;
        } else {
            throw new Error("ImgBB yükləmə uğursuz oldu");
        }
    } catch (error) {
        console.error("Şəkil yüklənmə xətası:", error);
        throw error;
    }
}

const choiceModal = document.getElementById('choiceModal');
const chooseAddBrand = document.getElementById('chooseAddBrand');
const chooseAddKey = document.getElementById('chooseAddKey');
const brandAddModal = document.getElementById('brandAddModal');
const addBrandForm = document.getElementById('addBrandForm');
const newBrandInput = document.getElementById('newBrandInput');
const editBrandModal = document.getElementById('editBrandModal');

let carBrands = [];

async function fetchBrandsFromFirebase() {
    try {
        const querySnapshot = await getDocs(collection(db, "carBrands"));
        carBrands = [];
        querySnapshot.forEach((doc) => {
            carBrands.push({ id: doc.id, ...doc.data() });
        });
    } catch (error) {
        console.error("Markalar oxunarkən xəta: ", error);
    }
}

chooseAddBrand.addEventListener('click', async () => {
    closeModal(choiceModal);
    newBrandInput.value = "";
    await fetchBrandsFromFirebase();
    renderExistingBrandsInModal();
    openModal(brandAddModal);
});

chooseAddKey.addEventListener('click', () => {
    closeModal(choiceModal);
    
    modalTitle.textContent = "Yeni Açar Əlavə Et";
    saveBtnText.textContent = "Yadda Saxla";
    editKeyIdInput.value = "";
    addKeyForm.reset();
    imageFileInput.value = "";
    cameraInput.value = "";
    openModal(keyModal);

    fetchBrandsFromFirebase().then(() => {
        setupKeyBrandSelectList();
    });
});

addBrandForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const brandName = newBrandInput.value.trim();
    if (!brandName) return;

    const brandExists = carBrands.some(b => b.name.toLowerCase() === brandName.toLowerCase());
    if (brandExists) {
        showNotification("Bu marka artıq mövcuddur!", "error");
        return;
    }

    try {
        await addDoc(collection(db, "carBrands"), { name: brandName });
        showNotification("Marka uğurla əlavə olundu!", "success");
        await fetchBrandsFromFirebase();
        renderExistingBrandsInModal();
        newBrandInput.value = "";
    } catch (error) {
        console.error("Marka əlavə edilərkən xəta: ", error);
        showNotification("Xəta baş verdi!", "error");
    }
});

function setupBrandFilterList(filter = "") {
    brandSelectList.innerHTML = "";
    
    const filteredBrands = carBrands.filter(b => 
        b.name.trim().toLowerCase().includes(filter.trim().toLowerCase())
    );

    if (filteredBrands.length === 0) {
        brandSelectList.innerHTML = `<div style="text-align: center; color: #999; padding: 20px;">Marka tapılmadı</div>`;
        return;
    }

    filteredBrands.forEach(b => {
        const btn = document.createElement('button');
        btn.type = "button";
        btn.textContent = b.name;
        
        const isSelected = selectedBrandFilter && selectedBrandFilter.trim().toLowerCase() === b.name.trim().toLowerCase();
        
        btn.style.cssText = `
            padding: 12px 15px; 
            background-color: #222; 
            color: ${isSelected ? '#3b82f6' : '#fff'}; 
            border: 2px solid ${isSelected ? '#3b82f6' : '#333'}; 
            border-radius: 15px; 
            cursor: pointer; 
            text-align: left; 
            font-size: 14px; 
            transition: background 0.2s, border-color 0.2s;
        `;

        btn.addEventListener('mouseenter', () => btn.style.backgroundColor = '#2c2c2c');
        btn.addEventListener('mouseleave', () => btn.style.backgroundColor = '#222');
        
        btn.addEventListener('click', () => {
            selectedBrandFilter = b.name;
            filterByBrandBtn.textContent = `${b.name}`;
            clearBrandFilter.style.display = "block";
            closeModal(brandSelectModal);
            filterKeys();
            showNotification(`${b.name} seçildi`, "success");
        });
        
        brandSelectList.appendChild(btn);
    });
}

clearBrandFilter.addEventListener('click', () => {
    selectedBrandFilter = null;
    filterByBrandBtn.textContent = "Marka seç";
    clearBrandFilter.style.display = "none";
    closeModal(brandSelectModal);
    filterKeys();
    showNotification("Seçim sıfırlandı", "success");
});

brandSelectModal.addEventListener('click', (e) => {
    if (e.target === brandSelectModal) closeModal(brandSelectModal);
});

filterBrandSearchInput.addEventListener('input', (e) => {
    setupBrandFilterList(e.target.value);
});

choiceModal.addEventListener('click', (e) => {
    if (e.target === choiceModal) closeModal(choiceModal);
});

brandAddModal.addEventListener('click', (e) => {
    if (e.target === brandAddModal) closeModal(brandAddModal);
});

brandInput.addEventListener('click', async () => {
    await fetchBrandsFromFirebase();
    brandSearchInput.value = "";
    setupKeyBrandSelectList();
    openModal(keyBrandSelectModal);
});

function setupKeyBrandSelectList(filter = "") {
    keyBrandSelectList.innerHTML = "";
    
    const filteredBrands = carBrands.filter(b => 
        b.name.trim().toLowerCase().includes(filter.trim().toLowerCase())
    );

    if (filteredBrands.length === 0) {
        keyBrandSelectList.innerHTML = `<div style="text-align: center; color: #999; padding: 20px;">Marka tapılmadı</div>`;
        return;
    }

    filteredBrands.forEach(b => {
        const btn = document.createElement('button');
        btn.type = "button";
        btn.textContent = b.name;
        btn.style.cssText = "padding: 12px 15px; background-color: #2a2a2a; color: #fff; border: 1px solid #333; border-radius: 8px; cursor: pointer; text-align: left; font-size: 14px; transition: background 0.2s;";
        
        btn.addEventListener('mouseenter', () => btn.style.backgroundColor = '#3a3a3a');
        btn.addEventListener('mouseleave', () => btn.style.backgroundColor = '#2a2a2a');
        
        btn.addEventListener('click', () => {
            brandInput.value = b.name;
            closeModal(keyBrandSelectModal);
        });
        keyBrandSelectList.appendChild(btn);
    });
}

keyBrandSelectModal.addEventListener('click', (e) => {
    if (e.target === keyBrandSelectModal) closeModal(keyBrandSelectModal);
});

brandSearchInput.addEventListener('input', (e) => {
    setupKeyBrandSelectList(e.target.value);
});

function renderExistingBrandsInModal() {
    const listContainer = document.getElementById('existingBrandsList');
    if (!listContainer) return;
    
    listContainer.innerHTML = "";
    if (carBrands.length === 0) {
        listContainer.innerHTML = `<span style="font-size: 12px; color: #666;">Hələ marka əlavə olunmayıb</span>`;
        return;
    }

    carBrands.forEach(b => {
        const tag = document.createElement('div');
        tag.style.cssText = "background-color: #222; padding: 10px 12px; border-radius: 8px; font-size: 14px; color: #fff; border: 1px solid #333; display: flex; align-items: center; justify-content: space-between; gap: 10px;";
        
        const nameSpan = document.createElement('span');
        nameSpan.textContent = b.name;
        nameSpan.style.flex = "1";
        tag.appendChild(nameSpan);

        const editBtn = document.createElement('button');
        editBtn.type = "button";
        editBtn.textContent = "✏️";
        // Düyməyə çərçivə (border), fon və səliqəli görünüş əlavə olundu
        editBtn.style.cssText = "background: #1a1a1a; border: 1px solid #333; border-radius: 6px; cursor: pointer; font-size: 14px; padding: 6px 8px; display: flex; align-items: center; justify-content: center; transition: background 0.2s;";
        editBtn.title = "Adını dəyiş";
        
        editBtn.addEventListener('mouseenter', () => editBtn.style.backgroundColor = '#333');
        editBtn.addEventListener('mouseleave', () => editBtn.style.backgroundColor = '#1a1a1a');

       editBtn.onclick = () => {
            const editBrandForm = document.getElementById('editBrandForm');
            const editBrandNameInput = document.getElementById('editBrandNameInput');

            editBrandNameInput.value = b.name;
            
            // Arxadakı modalı dərhal gizlədirik
            brandAddModal.classList.remove('active');
            openModal(editBrandModal); 

            editBrandForm.onsubmit = async (e) => {
                e.preventDefault();
                const newName = editBrandNameInput.value.trim();
                if (!newName) return;

                const exists = carBrands.some(item => item.name.toLowerCase() === newName.toLowerCase() && item.id !== b.id);
                if (exists) {
                    showNotification("Bu adla başqa marka mövcuddur!", "error");
                    return;
                }

                try {
                    await updateDoc(doc(db, "carBrands", b.id), { name: newName });
                    showNotification("Marka adı yeniləndi!", "success");
                    
                    // Modalı bağlayıb arxadakını qaytarırıq
                    closeModal(editBrandModal);
                    brandAddModal.classList.add('active');
                    
                    await fetchBrandsFromFirebase();
                    renderExistingBrandsInModal();
                } catch (error) {
                    showNotification("Xəta baş verdi!", "error");
                }
            };
        };
        tag.appendChild(editBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.type = "button";
        deleteBtn.textContent = "🗑️";
        // Sil düyməsinə də eyni qaydada çərçivə və səliqəli fon əlavə olundu
        deleteBtn.style.cssText = "background: #1a1a1a; border: 1px solid #333; border-radius: 6px; cursor: pointer; font-size: 14px; padding: 6px 8px; display: flex; align-items: center; justify-content: center; transition: background 0.2s;";
        deleteBtn.title = "Sil";
        
        deleteBtn.addEventListener('mouseenter', () => deleteBtn.style.backgroundColor = '#333');
        deleteBtn.addEventListener('mouseleave', () => deleteBtn.style.backgroundColor = '#1a1a1a');

        deleteBtn.onclick = () => {
            showConfirm(`Təsdiq`, async () => {
                try {
                    await deleteDoc(doc(db, "carBrands", b.id));
                    showNotification("Marka silindi!", "success");
                    await fetchBrandsFromFirebase();
                    renderExistingBrandsInModal();
                } catch (error) {
                    showNotification("Silinərkən xəta baş verdi!", "error");
                }
            });
        };
        tag.appendChild(deleteBtn);

        listContainer.appendChild(tag);
    });
}

editBrandModal.addEventListener('click', (e) => {
    if (e.target === editBrandModal) {
        closeModal(editBrandModal);
        brandAddModal.classList.add('active'); // Kənara basıb bağlayanda arxadakı qayıtsın
    }
});

// Mobil klaviatura və ekran dəyişikliklərini izləmək üçün
if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
        // Əgər viewport hündürlüyü ümumi hündürlükdən nəzərəçarpacaq dərəcədə kiçilibsə
        const isKeyboardOpen = window.visualViewport.height < window.innerHeight - 150;
        
        document.querySelectorAll('.modal-overlay.active').forEach(modal => {
            modal.classList.toggle('keyboard-open', isKeyboardOpen);
        });
    });
} else {
    // Köhnə brauzerlər üçün ehtiyat mexanizm
    const initialHeight = window.innerHeight;
    window.addEventListener('resize', () => {
        const isKeyboardOpen = window.innerHeight < initialHeight - 150;
        document.querySelectorAll('.modal-overlay.active').forEach(modal => {
            modal.classList.toggle('keyboard-open', isKeyboardOpen);
        });
    });
}

