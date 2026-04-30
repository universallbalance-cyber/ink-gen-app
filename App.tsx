import React, { useEffect } from 'react';

const App: React.FC = () => {
  useEffect(() => {
    // --- START OF YOUR LOGIC ---
      // --- CENTRAL SETTINGS ---
  //  const CONFIG = {
   // MAX_FREE_LIMIT: 5,
     // Encrypted version of your password
    //  ENCRYPTED_PASS: "SUdQLUdvUHJvMQ==" 
    //    };
		// --- AUTO-RESET COUNTER EVERY DAY ---
	//(function() {
    //const today = new Date().toLocaleDateString(); // Gets current date (e.g., "2/12/2026")
    //const lastUseDate = localStorage.getItem('inkGen_last_date');

    //if (lastUseDate !== today) {
        // It's a brand new day!
     //   localStorage.setItem('inkGen_usage', '0');
     //   localStorage.setItem('inkGen_pro_unlocked', 'false'); // Reset Pro status
     //   localStorage.setItem('inkGen_last_date', today);
     //   console.log("Daily limit and Pro status reset for a new day.");
//    }
//})();
	const BACKEND_URL = "https://ink-gen-api-365969989524.us-central1.run.app";
        const homePage = document.getElementById('homePage');
        const studioPage = document.getElementById('studioPage');
        const canvas = document.getElementById('tattooCanvas');
        const ctx = canvas.getContext('2d');
        const artFrame = document.getElementById('artFrame');
        const promptInput = document.getElementById('promptInput');
        const generateBtn = document.getElementById('generateBtn');
        const saturateBtn = document.getElementById('saturateBtn');
        const loader = document.getElementById('loader');
        const player = document.getElementById('player');
        const skinOverlay = document.getElementById('skinOverlay');
        const notification = document.getElementById('notification');
        const subOverlay = document.getElementById('subOverlay');
        const inkVal = document.getElementById('inkVal');
	const manualLink = document.getElementById('manualLink');

        let selectedStyle = 'fineline';
        let isPlaying = false;
	
        // 1. Declare the variable without a default number
let credits; 

// 2. This function decides if the user gets 3 or 0 based on their status
function handleCreditsOnStartup() {
    const teaserUsed = localStorage.getItem('teaser_used');
    const hasDailySub = localStorage.getItem('has_daily_3_sub') === 'true';
    const savedInk = localStorage.getItem('user_ink');

    // FIRST TIME EVER: Give them the 3-ink teaser
    if (!teaserUsed) {
        credits = 3;
        localStorage.setItem('teaser_used', 'true');
        localStorage.setItem('user_ink', 3);
    } 
    // SUBSCRIBER: Give them 3 if it's a new day
    else if (hasDailySub) {
        const today = new Date().toDateString();
        const lastRefill = localStorage.getItem('last_sub_refill_date');
		let currentInk = parseInt(localStorage.getItem('user_ink')) || 0;
        if (lastRefill !== today) {
		credits = currentInk + 3;         
        localStorage.setItem('last_sub_refill_date', today);
        localStorage.setItem('user_ink', credits);
		showAppMsg("DAILY REFILL", "Your 3 daily inks have arrived!");
        } else {
            credits = currentInk;
        }
    } 
    // STANDARD USER: Load whatever they had left (usually 0)
    else {
        credits = savedInk ? parseInt(savedInk) : 0;
    }
    
    updateInk();
}
        
        const playlist = [
            { name: "Track I", url: "https://assets.zyrosite.com/dOq4ypO8x6fPq8OL/spiritual_1-A85M802pl8svjrLd.mp3" },
            { name: "Track II", url: "https://assets.zyrosite.com/dOq4ypO8x6fPq8OL/spiritual_2-YyvD1V0LMOTeDz76.mp3" },
            { name: "Track III", url: "https://assets.zyrosite.com/dOq4ypO8x6fPq8OL/spiritual_3-Aq2GPVJQn1fjKLKo.mp3" }
        ];


   function init() {
    // Set canvas dimensions
    canvas.width = 1024; 
    canvas.height = 1024;
    
    // Fill with pure white (Blank Canvas)
    ctx.fillStyle = "white"; 
    ctx.fillRect(0,0,1024,1024);

    // --- NEW LOGIC: This triggers the teaser or subscription check ---
    handleCreditsOnStartup();

    // Audio safe-load (keeps Start Session button working)
    try {
        if (typeof playlist !== 'undefined' && playlist.length > 0) {
            player.src = playlist[0].url;
        }
    } catch (e) {
        console.log("Audio bypass active.");
    }
}
        function updateInk() {
            inkVal.textContent = credits;
	    localStorage.setItem('user_ink', credits);
        }
	const triggerSuccessHaptic = () => {
  		if (navigator.vibrate) {
    		navigator.vibrate(100); // Quick 100ms buzz
  	}
};
	window.purchasePlan = async function(amt, sku) {
    try {
        // 1. We must use the Product ID 'ink_plans' for Google to find it
        // But we keep the logic for your specific daily-3-subscription
        const playStoreID = (sku === 'daily-3-subscription') ? 'ink_plans' : sku;
        const productType = (sku === 'daily-3-subscription') ? 'subs' : 'inapp';

        const methodData = [{ 
            supportedMethods: 'https://play.google.com/billing', 
            data: { 
                sku: playStoreID, // Send 'ink_plans' to Google
                type: productType 
            } 
        }];

        const request = new PaymentRequest(methodData, { 
            total: { label: 'Total', amount: { currency: 'USD', value: '0' } } 
        });

        const response = await request.show();
        await response.complete('success');

// --- SUCCESS LOGIC ---
	triggerSuccessHaptic();
        if (sku === 'daily-3-subscription') {
            localStorage.setItem('has_daily_3_sub', 'true');
            localStorage.setItem('last_sub_refill_date', new Date().toDateString());
            credits += 3; // Add 3 immediately upon subscribing
            showAppMsg("Success", "DAILY REFILL ACTIVATED: 3 INKS EVERY DAY");
        } else {
            credits += amt;
            showAppMsg("Success", "INK RESTOCKED!");
        }
        // Keep these here once, and remove the copies from inside the if/else above
        updateInk(); 
        document.getElementById('subOverlay').style.display = 'none';

} catch (e) {
    console.error("Billing Error:", e);
    showAppMsg("Billing Error", e.message, true);
}
};
        const showMessage = (text) => {
            notification.textContent = text;
            notification.style.display = 'block';
            setTimeout(() => { notification.style.display = 'none'; }, 5000);
        };

        const fetchWithRetry = async (url, options, retries = 5) => {
            for (let i = 0; i < retries; i++) {
                try {
                    const response = await fetch(url, options);
                    if (response.ok) return response;
                    if (response.status === 429 || response.status >= 500) {
                        const delay = Math.pow(2, i) * 1000;
                        await new Promise(res => setTimeout(res, delay));
                        continue;
                    }
                    throw new Error(`API Error: ${response.status}`);
                } catch (err) { if (i === retries - 1) throw err; }
            }
        };

        document.getElementById('enterStudio').onclick = () => {
            homePage.style.display = 'none';
            studioPage.style.display = 'flex';
            init();
        };

        document.getElementById('goHome').onclick = () => {
            homePage.style.display = 'flex';
            studioPage.style.display = 'none';
        };

        document.querySelectorAll('.skin-swatch').forEach(sw => {
            sw.onclick = () => {
                document.querySelectorAll('.skin-swatch').forEach(s => s.classList.remove('active'));
                sw.classList.add('active');
                const col = sw.dataset.color;
                document.documentElement.style.setProperty('--skin-tone', col);
            };
        });

        document.getElementById('skinTog').onclick = function() {
            const active = artFrame.classList.toggle('preview-active');
            this.classList.toggle('active', active);
        };

        document.getElementById('musicMenu').onclick = (e) => {
            e.stopPropagation();
            document.getElementById('musicPop').classList.toggle('show');
        };

        window.onclick = () => document.getElementById('musicPop').classList.remove('show');
		
        document.getElementById('playBtn').onclick = async () => {
            if(!isPlaying) {
                try {
                    await player.play(); isPlaying = true;
                    document.getElementById('p-ico').innerText = '||';
                } catch(e) { console.error("Audio blocked"); }
            } else {
                player.pause(); isPlaying = false;
                document.getElementById('p-ico').innerText = '▶';
            }
        };

        document.querySelectorAll('.track-item').forEach(item => {
            item.onclick = () => {
                const idx = item.dataset.idx;
                player.src = playlist[idx].url;
                document.getElementById('trackName').innerText = playlist[idx].name;
                document.querySelectorAll('.track-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                if(isPlaying) player.play();
            };
        });

        document.querySelectorAll('.style-btn[data-style]').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.style-btn[data-style]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedStyle = btn.dataset.style;
            };
        });

        const getStylePrompt = (style) => {
            const map = {
                fineline: "Fine line tattoo, single needle, black ink, minimalist, isolated on white background.",
                singlism: "Singlism style tattoo, continuous single line art, clean high-fashion aesthetic, black ink on white background.",
                blackwork: "Bold blackwork tattoo, solid black ink, high contrast, isolated on white background.",
                tribal: "Symmetrical tribal tattoo, sharp black graphic, isolated on white background.",
                izumi: "Izumi tattoo style, traditional Japanese aesthetic with a modern flow, black ink etching, white background.",
                skulls: "Dark gothic skull tattoo, anatomical detail, high-contrast black and grey, isolated on white background.",
                blackwork: "Bold blackwork tattoo, solid black ink, high contrast, isolated on white background.",
                neo: "Neo-traditional tattoo, bold outlines, varied line weights, illustrative black ink on white background.",
                disney: "Disney character style tattoo art, smooth curves, playful illustrative lines, black ink on white background.",
                japanese: "Irezumi japanese tattoo style, flowing lines, black ink, white background.",
                cyber: "Cyber sigilism tattoo, futuristic sharp biometric lines, black ink on white background.",
                traditional: "Old school american traditional tattoo, bold black outlines, white background.",
                micro: "Micro realism tattoo, extremely small scale detail, etched lines, white background."
            };
            return map[style] || map.fineline;
        };

  // 1. UPDATE THE GENERATE FUNCTION
async function generate() {
    // 1. Check credits
    if (credits <= 0) {
        // Ensure subOverlay is defined or use getElementById
        document.getElementById('subOverlay').style.display = 'flex';
        return;
    }

    // 2. Get prompt and elements
    const promptInput = document.getElementById('promptInput');
    const generateBtn = document.getElementById('generateBtn');
    const loader = document.getElementById('loader');
    const pVal = promptInput.value.trim();
    
    if (!pVal) {
        showAppMsg("INPUT NEEDED", "Please enter a design concept to continue.");
        return;
    }

    // 3. UI lock
    loader.style.display = 'flex';
    generateBtn.disabled = true;

    try {
        const fullPrompt = getStylePrompt(selectedStyle) + " " + pVal;

        // 4. Send request (Restored 'action' and used standard 'fetch')
        const response = await fetch('https://ink-gen-api-365969989524.us-central1.run.app', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                action: 'generate', // Restored from working version
                prompt: fullPrompt 
            })
        });

        const data = await response.json();

        // 5. Validate and Draw
        if (data.predictions && data.predictions[0].bytesBase64Encoded) {
            const base64Data = data.predictions[0].bytesBase64Encoded;
            const img = new Image();
            
            img.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                // 6. Deduct credit only on success
                credits -= 1;
                updateInk(); // Ensure this function exists to update the UI
                
                loader.style.display = 'none';
                generateBtn.disabled = false;
            };
            img.src = `data:image/png;base64,${base64Data}`;
        } else {
            throw new Error("Generation failed");
        }
    } catch (e) {
        console.error(e);
        showAppMsg("CONNECTION ERROR", "Engine offline. Retrying...", true);
        loader.style.display = 'none';
        generateBtn.disabled = false;
    }
}
// 2. UPDATE THE SATURATE (STENCIL) FUNCTION
async function saturate() {
    loader.style.display = 'flex';
    saturateBtn.disabled = true;

    try {
        // 1. Get the base64 PNG from the canvas
        const b64 = canvas.toDataURL('image/png').split(',')[1];

        // 2. Call your backend
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'saturate',
                image: b64
            })
        });

        const data = await response.json();

        // 3. SDXL returns a URL, not base64
        const imgUrl = data.output[0];

        // 4. Fetch the image and convert to blob
        const imgResp = await fetch(imgUrl);
        const blob = await imgResp.blob();

        // 5. Convert blob → base64
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result;

            // 6. Draw onto canvas
            const img = new Image();
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                loader.style.display = 'none';
                saturateBtn.disabled = false;
            };
            img.src = base64;
        };
        reader.readAsDataURL(blob);

    } catch (err) {
        console.error("Color Fetch Error:", err);
        loader.style.display = 'none';
        saturateBtn.disabled = false;
    }
}

        generateBtn.onclick = generate;
        //saturateBtn.onclick = saturate;
        
        artFrame.onclick = () => document.body.classList.add('focus-mode');
        document.getElementById('exitFocus').onclick = (e) => { 
            e.stopPropagation(); 
            document.body.classList.remove('focus-mode'); 
        };

        document.getElementById('dlBtn').onclick = () => {
            const l = document.createElement('a');
            l.download = `ink-${Date.now()}.png`; l.href = canvas.toDataURL(); l.click();
        };
const shareInk = async () => {
    const canvas = document.getElementById('tattooCanvas') as HTMLCanvasElement;
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], 'my-tattoo-design.png', { type: 'image/png' });

        // Check if the device can actually share files
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    files: [file],
                    title: 'INK-GEN PRO Design',
                    text: 'Check out this tattoo concept!',
                });
            } catch (err) {
                console.log("User cancelled or share failed", err);
            }
        } else {
            alert("Sharing is not supported on this browser. Try the Download button!");
        }
    }, 'image/png');
};

// Now hook up the click event (put this with your other button listeners)
document.getElementById('shareBtn')!.onclick = shareInk;

	const helpModal = document.getElementById('helpModal');
        //const helpBtn = document.getElementById('helpBtn');
        const closeHelp = document.getElementById('closeHelp');

        //helpBtn.onclick = () => { helpModal.style.display = 'flex'; };
        closeHelp.onclick = () => { helpModal.style.display = 'none'; };

        window.addEventListener('click', (e) => {
            if (e.target === helpModal) { helpModal.style.display = 'none'; }
        });

	// Link the footer text to the modal
	manualLink.onclick = (e) => {
   	 e.preventDefault(); // Prevents the page from jumping/reloading
   	 helpModal.style.display = 'flex'; 
	};
        init();
	window.purchasePlan = purchasePlan; 	
	// 2. THE INSTRUCTIONS (Add this inside your <script> tags)
window.showAppMsg = function(title, message, isError = false) {
    const modal = document.getElementById('appModal');
    const titleEl = document.getElementById('modalTitle');
    const iconEl = document.getElementById('modalIcon');
    
    titleEl.innerText = title;
    document.getElementById('modalBody').innerText = message;
    
    if (isError) {
        titleEl.style.color = "#ff4d4d"; 
        iconEl.innerText = "⚠️";
        modal.children[0].style.borderColor = "#ff4d4d";
    } else {
        titleEl.style.color = "#00d4ff"; 
        iconEl.innerText = "✨";
        modal.children[0].style.borderColor = "#00d4ff";
    }
    modal.style.display = 'flex';
};

window.closeModal = function() {
    document.getElementById('appModal').style.display = 'none';
};

(window as any).generate = generate;
(window as any).saturate = saturate;
(window as any).purchasePlan = purchasePlan;
(window as any).closeModal = closeModal;
    init(); // Run the startup logic

    // --- END OF YOUR LOGIC ---
  }, []);

  return null; // This component doesn't draw HTML; it just runs the scripts
};

export default App;