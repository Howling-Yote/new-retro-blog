// Firebase Configuration
// ADD YOUR FIREBASE CONFIG DETAILS BELOW - GET THIS FROM FIREBASE CONSOLE
const firebaseConfig = {
    apiKey: "AIzaSyDvWytGWtgWvCiXIlIC4KiffGyb3PMFVKM",
    authDomain: "unknown-anomaly.firebaseapp.com",
    databaseURL: "https://unknown-anomaly-default-rtdb.firebaseio.com",
    projectId: "unknown-anomaly",
    storageBucket: "unknown-anomaly.firebasestorage.app",
    messagingSenderId: "148200392157",
    appId: "1:148200392157:web:7b8bd885e562f5560aa234",
    measurementId: "G-DQ37V7S9EC"
};

// Function to format date to Y2K style (1999)
function formatY2KDate(timestamp) {
    const date = new Date(timestamp);
    date.setFullYear(1999); // Force Y2K era date
    return date.toLocaleDateString();
}

// Initialize Firebase
document.addEventListener('DOMContentLoaded', function() {
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
            console.log('Firebase initialized successfully');
        }
    } catch (error) {
        console.error('Firebase initialization error:', error);
    }
    
    // Setup guestbook form submission
    const guestbookForm = document.getElementById('guestbookForm');
    
    if (guestbookForm) {
        guestbookForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            try {
                // Get form values
                const name = document.getElementById('name').value;
                const email = document.getElementById('email').value;
                const homepage = document.getElementById('homepage').value || '';
                const message = document.getElementById('message').value;
                
                // Create timestamp
                const timestamp = Date.now();
                
                // Reference to guestbook entries in Firebase
                const guestbookRef = firebase.database().ref('guestbookEntries');
                
                // Push new entry to Firebase
                guestbookRef.push({
                    name: name,
                    email: email,
                    homepage: homepage,
                    message: message,
                    timestamp: timestamp
                })
                .then(() => {
                    // Show success message
                    guestbookForm.innerHTML = `
                    <div style="color: #00ff00; text-align: center; border: 2px dashed #ff00ff; padding: 10px;">
                        <h3>✧･ﾟ: *✧･ﾟ:* THANKS! *:･ﾟ✧*:･ﾟ✧</h3>
                        <p>Your guestbook entry has been submitted!</p>
                        <p>It will appear below automatically.</p>
                        <button onclick="resetGuestbookForm()" style="background: #ff00ff; color: white; border: 2px solid #00ff00; margin-top: 10px; cursor: pointer;">
                        Submit Another Entry
                        </button>
                    </div>
                    `;
                    
                    // Reload entries to show the new one
                    loadGuestbookEntries();
                })
                .catch(error => {
                    console.error('Error saving entry:', error);
                    alert('Error saving your entry: ' + error.message);
                });
            } catch (error) {
                console.error('Error in form submission:', error);
                alert('Error: ' + error.message);
            }
        });
    }
    
    // Load guestbook entries when page loads
    loadGuestbookEntries();
});

// Reset guestbook form function
function resetGuestbookForm() {
    document.querySelector('.guestbook-form').innerHTML = `
        <form id="guestbookForm">
            <input type="text" id="name" name="name" placeholder="Your Name" required>
            <input type="email" id="email" name="email" placeholder="Your Email" required>
            <input type="url" id="homepage" name="homepage" placeholder="Your Homepage URL">
            <textarea id="message" name="message" placeholder="Your Message" rows="4" required></textarea>
            <button type="submit">Sign Guestbook!</button>
            <div class="retro-note">
                <marquee scrollamount="3" direction="left" behavior="alternate">
                    ✧･ﾟ: Entries will appear after submission :･ﾟ✧
                </marquee>
            </div>
        </form>
    `;
    
    // Reattach event listener to the new form
    const newForm = document.getElementById('guestbookForm');
    if (newForm) {
        newForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            try {
                // Get form values
                const name = document.getElementById('name').value;
                const email = document.getElementById('email').value;
                const homepage = document.getElementById('homepage').value || '';
                const message = document.getElementById('message').value;
                
                // Create timestamp
                const timestamp = Date.now();
                
                // Reference to guestbook entries in Firebase
                const guestbookRef = firebase.database().ref('guestbookEntries');
                
                // Push new entry to Firebase
                guestbookRef.push({
                    name: name,
                    email: email,
                    homepage: homepage,
                    message: message,
                    timestamp: timestamp
                })
                .then(() => {
                    // Show success message
                    newForm.innerHTML = `
                        <div style="color: #00ff00; text-align: center; border: 2px dashed #ff00ff; padding: 10px;">
                            <h3>✧･ﾟ: *✧･ﾟ:* THANKS! *:･ﾟ✧*:･ﾟ✧</h3>
                            <p>Your guestbook entry has been submitted!</p>
                            <p>It will appear below automatically.</p>
                            <button onclick="resetGuestbookForm()" style="background: #ff00ff; color: white; border: 2px solid #00ff00; margin-top: 10px; cursor: pointer;">
                                Submit Another Entry
                            </button>
                        </div>
                    `;
                    
                    // Reload entries to show the new one
                    loadGuestbookEntries();
                })
                .catch(error => {
                    console.error('Error saving entry:', error);
                    alert('Error saving your entry: ' + error.message);
                });
            } catch (error) {
                console.error('Error in form submission:', error);
                alert('Error: ' + error.message);
            }
        });
    }
}

// Load and display guestbook entries from Firebase
function loadGuestbookEntries() {
    const entriesContainer = document.getElementById('guestbookEntries');
    
    if (!entriesContainer) return;
    
    try {
        // Reference to guestbook entries in Firebase
        const guestbookRef = firebase.database().ref('guestbookEntries');
        
        // Show loading message
        entriesContainer.innerHTML = '<p style="color: #00ff00;">Loading guestbook entries...</p>';
        
        // Use on('value') instead of once('value') to get real-time updates
        guestbookRef.orderByChild('timestamp').limitToLast(10).on('value', snapshot => {
            if (!snapshot.exists()) {
                entriesContainer.innerHTML = '<p style="color: #ffff00;">No entries yet! Be the first to sign the guestbook!</p>';
                return;
            }
            
            // Convert snapshot to array and reverse to show newest first
            const entries = [];
            snapshot.forEach(childSnapshot => {
                entries.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });
            
            // Reverse array to show newest first
            entries.reverse();
            
            // Generate HTML for entries
            const entriesHtml = entries.map(entry => {
                const date = formatY2KDate(entry.timestamp);
                
                return `
                <div class="guestbook-entry">
                    <p><strong>${escapeHtml(entry.name)}</strong> ${entry.homepage ? `<a href="${escapeHtml(entry.homepage)}" target="_blank">[Homepage]</a>` : ''}</p>
                    <p>${escapeHtml(entry.message)}</p>
                    <small>Posted on: ${date}</small>
                </div>
                `;
            }).join('');
            
            entriesContainer.innerHTML = entriesHtml;
        }, error => {
            console.error('Error loading entries:', error);
            entriesContainer.innerHTML = '<p style="color: #ff0000;">Error loading guestbook entries. Please refresh or try again later.</p>';
        });
    } catch (error) {
        console.error('Error accessing Firebase database:', error);
        entriesContainer.innerHTML = '<p style="color: #ff0000;">Error: Firebase database not accessible. Check console for details.</p>';
    }
}

// Helper function to escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function showGuestbook() {
    document.getElementById('guestbook').scrollIntoView({ behavior: 'smooth' });
}

async function updateVisitorCount() {
    try {
        // Check if this is a unique visit using localStorage
        const visitorId = localStorage.getItem('visitorId');
        const lastVisitTime = localStorage.getItem('lastVisitTime');
        const now = Date.now();
        const oneDayInMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        
        // Create a unique ID for new visitors or if 24 hours have passed since last visit
        const isNewVisit = !visitorId || (lastVisitTime && (now - parseInt(lastVisitTime)) > oneDayInMs);
        
        if (isNewVisit) {
            // Generate a random visitor ID and store it
            const newVisitorId = 'visitor-' + Math.random().toString(36).substring(2, 15);
            localStorage.setItem('visitorId', newVisitorId);
            localStorage.setItem('lastVisitTime', now.toString());
            
            // Reference to the visitor counter in Firebase
            const visitorCounterRef = firebase.database().ref('visitorCounter');
            
            // Get current count
            const snapshot = await visitorCounterRef.once('value');
            let count = 0;
            
            // If counter exists, increment it, otherwise create it
            if (snapshot.exists()) {
                count = snapshot.val().count + 1;
            } else {
                count = 1;
            }
            
            // Update the counter in Firebase
            await visitorCounterRef.set({
                count: count,
                lastUpdated: now
            });
        }
        
        // Always display the current count, even if not incremented
        const visitorCounterRef = firebase.database().ref('visitorCounter');
        const snapshot = await visitorCounterRef.once('value');
        
        if (snapshot.exists()) {
            const count = snapshot.val().count;
            const formattedCount = count.toString().padStart(6, '0');
            const counterElement = document.getElementById('visitorCount');
            if (counterElement) {
                counterElement.textContent = formattedCount;
            }
        }
    } catch (error) {
        console.error('Error updating visitor count:', error);
        document.getElementById('visitorCount').textContent = '000000';
    }
}

// Update counter when page loads
document.addEventListener('DOMContentLoaded', () => {
    // First make sure Firebase is initialized before updating visitor count
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
            console.log('Firebase initialized for visitor counter');
        }
        // Now that Firebase is initialized, update the visitor count
        updateVisitorCount();

        // Update counter every 30 seconds
        setInterval(updateVisitorCount, 30000);
    } catch (error) {
        console.error('Firebase initialization error for visitor counter:', error);
        document.getElementById('visitorCount').textContent = '000000';
    }
    
    // Removed ■ and using only star-like shapes
    const pixelShapes = [
        '★',
        '✦',
        '⋆',
        '*'
    ];

    document.addEventListener('mousemove', (e) => {
        if (Math.random() < 0.2) {
            createPixelSparkle(e.clientX, e.clientY);
        }
    });

    function createPixelSparkle(x, y) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';

        const offsetX = (Math.random() - 0.5) * 10;
        const offsetY = (Math.random() - 0.5) * 10;

        sparkle.style.left = `${x + offsetX}px`;
        sparkle.style.top = `${y + offsetY}px`;

        sparkle.textContent = pixelShapes[Math.floor(Math.random() * pixelShapes.length)];

        document.body.appendChild(sparkle);

        sparkle.addEventListener('animationend', () => {
            sparkle.remove();
        });
    }
    
    // Music player functionality - fixed to work properly
    const audio = document.getElementById('backgroundMusic');
    const toggleButton = document.getElementById('toggleMusic');

    // Try to play music automatically
    const playPromise = audio.play();

    // Modern browsers require user interaction before playing audio
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            // Auto-play was prevented
            console.log("Auto-play was prevented. Please click the play button.");
            toggleButton.textContent = "▶ PLAY";
        });
    }

    // Toggle music play/pause
    toggleButton.addEventListener('click', function (e) {
        e.stopPropagation(); // Prevent document click handler from firing
        
        if (audio.paused) {
            audio.play();
            toggleButton.textContent = "▐▐ PAUSE";
        } else {
            audio.pause();
            toggleButton.textContent = "▶ PLAY";
        }
    });

    // Old-school alert to notify user about music
    setTimeout(function () {
        if (audio.paused) {
            alert("⚠️ Click PLAY! ⚠️");
        }
    }, 3000);
    
    // Modified to only auto-play on first click, not every click
    let firstClick = true;
    document.addEventListener('click', function () {
        if (audio.paused && firstClick) {
            audio.play().catch(error => {
                console.error("Audio playback failed:", error);
            });
            firstClick = false;
            toggleButton.textContent = "▐▐ PAUSE";
        }
    });
});

// Update when user returns to the page, but don't increment counter unnecessarily
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        // Check if Firebase is initialized
        if (firebase.apps && firebase.apps.length > 0) {
            // Just update the display without incrementing the counter
            // This will only show the current count from Firebase
            updateVisitorCount();
        } else {
            console.warn('Firebase not initialized when returning to page');
            // Try to initialize Firebase
            try {
                firebase.initializeApp(firebaseConfig);
                updateVisitorCount();
            } catch (error) {
                console.error('Could not initialize Firebase on page return:', error);
            }
        }
    }
});