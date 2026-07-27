
        // 1. Ersetze diesen Block mit deinen eigenen Daten aus Schritt 1!
        const firebaseConfig = {
            apiKey: "AIzaSyBBSj5K_kZ532OgtqxoAW4i14jzyB3Tdb8",
            authDomain: "datenbank-cube.firebaseapp.com",
            projectId: "datenbank-cube",
            storageBucket: "datenbank-cube.firebasestorage.app",
            messagingSenderId: "79380899291",
            appId: "1:79380899291:web:cf902b3ff28fba147bf3fe"
        };

        // 2. Firebase Initialisieren
        firebase.initializeApp(firebaseConfig);
        const db = firebase.firestore();

        const inventoryListElement = document.getElementById('inventoryList');
        const addForm = document.getElementById('addForm');
        const newItemName = document.getElementById('newItemName');
        const newItemQuantity = document.getElementById('newItemQuantity');

        // Local State
        let inventory = [];

        // 3. ECHTZEIT-LISTENER: Hört automatisch auf Änderungen aus der Datenbank
        db.collection("inventory").onSnapshot((snapshot) => {
            inventory = [];
            snapshot.forEach((doc) => {
                inventory.push({ id: doc.id, ...doc.data() });
            });
            renderInventory();
        });

        // Liste im HTML ausgeben
        function renderInventory() {
            inventoryListElement.innerHTML = '';

            if (inventory.length === 0) {
                inventoryListElement.innerHTML = '<li style="text-align:center; color:#6b7280; padding:1rem;">Noch keine Artikel. Trage oben oder unten etwas ein!</li>';
                return;
            }

            inventory.forEach(item => {
                const li = document.createElement('li');
                li.className = 'inventory-item';
                
                li.innerHTML = `
                    <div class="item-info">
                        <span class="item-name">${item.name}</span>
                    </div>
                    <div class="controls">
                        <button class="btn-circle" onclick="updateQuantity('${item.id}', -1)">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="btn-circle" onclick="updateQuantity('${item.id}', 1)">+</button>
                        <button class="delete-btn" onclick="deleteItem('${item.id}')" title="Löschen">🗑️</button>
                    </div>
                `;
                
                inventoryListElement.appendChild(li);
            });
        }

        // 4. DATENBANK-FUNKTIONEN

        // Anzahl in der Datenbank aktualisieren
        function updateQuantity(id, change) {
            const item = inventory.find(i => i.id === id);
            if (item) {
                const newQuantity = Math.max(0, item.quantity + change);
                db.collection("inventory").doc(id).update({
                    quantity: newQuantity
                });
            }
        }

        // Neues Produkt in die Datenbank schreiben
        addForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = newItemName.value.trim();
            const initialQuantity = parseInt(newItemQuantity.value, 10) || 0;

            if (name) {
                db.collection("inventory").add({
                    name: name,
                    quantity: Math.max(0, initialQuantity) // Speichert direkt die eingegebene Zahl
                });
                
                // Feldeingaben zurücksetzen
                newItemName.value = '';
                newItemQuantity.value = '1';
            }
        });

        // Produkt aus der Datenbank löschen
        function deleteItem(id) {
            db.collection("inventory").doc(id).delete();
        }