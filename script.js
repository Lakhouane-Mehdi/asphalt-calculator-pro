let currentLang = 'en';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Language
    const savedLang = localStorage.getItem('lang');
    if (savedLang) {
        setLang(savedLang);
    } else {
        setLang('en');
    }

    const lengthInput = document.getElementById('length');
    const widthInput = document.getElementById('width');
    const thicknessInput = document.getElementById('thickness');
    const densityInput = document.getElementById('density');
    const costInput = document.getElementById('cost');
    const truckTypeSelect = document.getElementById('truck-type');
    const regionSelect = document.getElementById('region-select');

    // Frost Inputs
    const frostToggle = document.getElementById('frost-toggle');
    const frostZoneSelect = document.getElementById('frost-zone');
    const loadClassSelect = document.getElementById('load-class');
    const fssThicknessInput = document.getElementById('fss-thickness');

    // Result Elements
    const resultElement = document.getElementById('result');
    const volumeElement = document.getElementById('volume');

    const frostResultContainer = document.getElementById('frost-result-container');
    const frostWeightElement = document.getElementById('frost-weight');
    const frostVolumeElement = document.getElementById('frost-volume');

    const recTotalDepthElement = document.getElementById('rec-total-depth');
    const totalCostElement = document.getElementById('total-cost');

    const inputs = [lengthInput, widthInput, thicknessInput, densityInput, fssThicknessInput, costInput];
    const settings = [frostZoneSelect, loadClassSelect, frostToggle, truckTypeSelect, regionSelect];

    const priceTable = {
        'DE_AVG': 85,
        'DE_HIGH': 105,
        'DE_LOW': 70,
        'AT': 90,
        'CH': 120
    };

    // Initialize Cost on Load
    if (priceTable[regionSelect.value]) {
        costInput.value = priceTable[regionSelect.value];
    }

    // Load History
    updateHistoryUI();

    let debounceTimer;

    async function calculate() {
        // Collect Inputs
        let length = parseFloat(lengthInput.value) || 0;
        let width = parseFloat(widthInput.value) || 0;
        const thickness = parseFloat(thicknessInput.value) || 0;
        const density = parseFloat(densityInput.value) || 0;

        // Shape Logic
        const shape = document.querySelector('input[name="shape"]:checked').value;
        let area = 0;

        if (shape === 'rect') {
            area = length * width;
        } else {
            const diameter = parseFloat(document.getElementById('diameter').value) || 0;
            const radius = diameter / 2;
            area = Math.PI * radius * radius;
            // For calculation consistency, we can simulate an equivalent rectangle or just pass raw data
            // But we need to calculate Weight here or pass area to server?
            // The server expects length/width. Let's send area equivalent to Server or handle math here?
            // Quick fix: if circle, send length = area, width = 1 to server? 
            // Better: update server to accept Area. But for now I'll convert locally.
            // Actually, I should update the server to be robust, BUT I can't edit server easily right now.
            // Safe hack: length = area, width = 1.
            length = area;
            width = 1;
        }

        const wastePercent = parseFloat(document.getElementById('waste').value) || 0;
        const zone = frostZoneSelect.value;
        const loadClass = loadClassSelect.value;
        const frostActive = frostToggle.checked;
        const fssOverride = fssThicknessInput.value;

        // Basic Check
        if (area <= 0 && !frostActive) {
            return;
        }

        clearTimeout(debounceTimer);

        debounceTimer = setTimeout(async () => {
            try {
                const response = await fetch('/api/calculate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        length, width, thickness, density,
                        zone, loadClass,
                        frostToggle: frostActive,
                        fssThicknessOverride: fssOverride
                    })
                });

                if (response.status === 429) {
                    resultElement.innerText = "BUSY";
                    return;
                }

                if (!response.ok) return;

                const data = await response.json();

                // Apply Waste Factor Here (Client Side)
                if (data.asphaltWeight) {
                    let weight = parseFloat(data.asphaltWeight);
                    let volume = parseFloat(data.asphaltVolume);

                    if (wastePercent > 0) {
                        const factor = 1 + (wastePercent / 100);
                        weight *= factor;
                        volume *= factor;
                    }

                    resultElement.innerText = weight.toFixed(2);
                    volumeElement.innerText = volume.toFixed(2);

                    const costPerTon = parseFloat(costInput.value) || 0;
                    const totalCost = (weight * costPerTon).toFixed(2);
                    totalCostElement.innerText = totalCost;

                    // Save to History
                    saveToHistory({
                        name: document.getElementById('project-name').value || "Project",
                        date: new Date().toLocaleDateString(),
                        weight: weight.toFixed(2),
                        cost: totalCost
                    });

                    // Visualization
                    const thicknessVal = parseFloat(thickness);
                    const aspHeight = Math.min(thicknessVal * 4, 120);
                    const aspLayer = document.getElementById('layer-asphalt');
                    aspLayer.style.height = `${aspHeight}px`;
                    aspLayer.querySelector('span').innerText = `Asphalt ${thicknessVal}cm`;

                    calculateTrucks(weight, 0);
                }

                if (data.frostResult) {
                    frostResultContainer.style.display = 'block';
                    recTotalDepthElement.innerText = data.frostResult.recTotalDepth;

                    if (document.activeElement !== fssThicknessInput && !fssOverride) {
                        fssThicknessInput.value = data.frostResult.usedFssDepth;
                    }

                    frostWeightElement.innerText = data.frostResult.fssWeight;
                    frostVolumeElement.innerText = data.frostResult.fssVolume;

                    const fssVal = parseFloat(data.frostResult.usedFssDepth);
                    const fssHeight = Math.min(fssVal * 2, 100);
                    const fssLayer = document.getElementById('layer-frost');
                    fssLayer.style.height = `${fssHeight}px`;
                    fssLayer.querySelector('span').innerText = `Frost ${fssVal}cm`;

                    calculateTrucks(parseFloat(resultElement.innerText), parseFloat(data.frostResult.fssWeight));
                } else {
                    frostResultContainer.style.display = 'none';
                    document.getElementById('layer-frost').style.height = '0px';
                    document.getElementById('trucks-frost-container').style.display = 'none';
                    calculateTrucks(parseFloat(resultElement.innerText), 0);
                }

            } catch (e) {
                console.error("Network Error:", e);
            }
        }, 300);
    }

    // Attach Listeners
    inputs.forEach(input => input.addEventListener('input', calculate));
    document.getElementById('diameter').addEventListener('input', calculate);
    document.getElementById('waste').addEventListener('input', calculate);
    settings.forEach(input => input.addEventListener('change', calculate));

    frostToggle.addEventListener('change', () => {
        calculate();
    });

    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-mode');
        document.getElementById('theme-icon').innerText = '☀️';
    }

    // Modal Close Logic (Click Outside)
    window.onclick = function (event) {
        const modal = document.getElementById('help-modal');
        if (event.target == modal) {
            closeHelp();
        }
    }
});

/* --- Feature Functions --- */
function openHelp() {
    document.getElementById('help-modal').style.display = 'block';
}

function closeHelp() {
    document.getElementById('help-modal').style.display = 'none';
}

function toggleShape() {
    const shape = document.querySelector('input[name="shape"]:checked').value;
    const rectInputs = document.getElementById('rect-inputs');
    const circleInputs = document.getElementById('circle-inputs');

    if (shape === 'rect') {
        rectInputs.style.display = 'block';
        circleInputs.style.display = 'none';
    } else {
        rectInputs.style.display = 'none';
        circleInputs.style.display = 'block';
    }
    // Trigger calc to clear/update
    const lengthInput = document.getElementById('length');
    // Dispatch event to allow recalculation if values exist
    const event = new Event('input', { bubbles: true });
    lengthInput.dispatchEvent(event);
}

function updateDensity() {
    const type = document.getElementById('material-type').value;
    const densityInput = document.getElementById('density');

    // Values based on German standards
    const densities = {
        'surface': 2.40, // Deckschicht
        'binder': 2.45,  // Binderschicht
        'base': 2.50,    // Tragschicht
    };

    if (densities[type]) {
        densityInput.value = densities[type];
        // Trigger calc
        const event = new Event('input', { bubbles: true });
        densityInput.dispatchEvent(event);
    }
}

// History Functions
function saveToHistory(entry) {
    if (parseFloat(entry.weight) <= 0) return;

    let history = JSON.parse(localStorage.getItem('calcHistory') || '[]');

    // Avoid duplicates only if exactly same math (optional check, skip for now to simplify)
    // Limit to 5
    // unshift logic to add to top
    // Check if last entry is identical to avoid spam while typing?
    if (history.length > 0) {
        const last = history[0];
        if (last.weight === entry.weight && last.name === entry.name) return;
    }

    history.unshift(entry);
    if (history.length > 5) history.pop();

    localStorage.setItem('calcHistory', JSON.stringify(history));
    updateHistoryUI();
}

function updateHistoryUI() {
    const list = document.getElementById('history-list');
    if (!list) return;

    const history = JSON.parse(localStorage.getItem('calcHistory') || '[]');

    if (history.length === 0) {
        list.parentElement.style.display = 'none';
        return;
    }

    list.parentElement.style.display = 'block';
    list.innerHTML = '';

    history.forEach(item => {
        const row = document.createElement('div');
        row.className = 'history-item';

        const leftDiv = document.createElement('div');

        const nameSpan = document.createElement('span');
        nameSpan.className = 'hist-name';
        nameSpan.textContent = item.name; // Secure: textContent escapes HTML

        const dateSmall = document.createElement('small');
        dateSmall.textContent = item.date;

        leftDiv.appendChild(nameSpan);
        leftDiv.appendChild(dateSmall);

        const rightDiv = document.createElement('div');

        const weightSpan = document.createElement('span');
        weightSpan.className = 'hist-val';
        weightSpan.textContent = `${item.weight} t`;

        const costSmall = document.createElement('small');
        costSmall.textContent = `${item.cost} €`;

        rightDiv.appendChild(weightSpan);
        rightDiv.appendChild(costSmall);

        row.appendChild(leftDiv);
        row.appendChild(rightDiv);
        list.appendChild(row);
    });
}

function clearHistory() {
    localStorage.removeItem('calcHistory');
    updateHistoryUI();
}


function toggleSettings() {
    const settings = document.getElementById('advanced-settings');
    settings.classList.toggle('show');
}

function toggleFrostSection() {
    const content = document.getElementById('frost-content');
    content.classList.toggle('show');
}

function toggleDarkMode() {
    const body = document.body;
    body.classList.toggle('light-mode');
    const icon = document.getElementById('theme-icon');

    if (body.classList.contains('light-mode')) {
        icon.innerText = '☀️';
        localStorage.setItem('theme', 'light');
    } else {
        icon.innerText = '🌙';
        localStorage.setItem('theme', 'dark');
    }
}

// Region Change Handler
document.getElementById('region-select').addEventListener('change', (e) => {
    const region = e.target.value;
    const priceTable = {
        'DE_AVG': 85,
        'DE_HIGH': 105,
        'DE_LOW': 70,
        'AT': 90,
        'CH': 120
    };

    if (priceTable[region]) {
        document.getElementById('cost').value = priceTable[region];
        // Trigger calculation updates (since cost changed)
        // We can access 'calculate' if we move this inside DOMContentLoaded or dispatch event
        const costInput = document.getElementById('cost');
        const event = new Event('input', { bubbles: true });
        costInput.dispatchEvent(event);
    }
});

/* --- Internationalization Functions --- */
function setLang(lang) {
    if (!translations[lang]) return;
    currentLang = lang;
    localStorage.setItem('lang', lang);
    updateContent();
}

function updateContent() {
    const t = translations[currentLang];

    // Update Text Content
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (t[key]) {
            element.innerHTML = t[key]; // innerHTML to allow HTML like <span>
        }
    });

    // Update Placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (t[key]) {
            element.placeholder = t[key];
        }
    });

    // Update Tooltips
    document.querySelectorAll('[data-tooltip]').forEach(element => {
        const key = element.getAttribute('data-tooltip');
        if (t[key]) {
            element.setAttribute('data-tooltip-text', t[key]);
        }
    });

    // Highlight active lang
    document.querySelectorAll('.lang-opt').forEach(opt => {
        opt.style.fontWeight = opt.innerText.toLowerCase().includes(currentLang) ? '700' : '400';
        opt.style.color = opt.innerText.toLowerCase().includes(currentLang) ? 'var(--accent-color)' : 'var(--text-secondary)';
    });
}

function printPage() {
    window.print();
}

function emailResults() {
    const weight = document.getElementById('result').innerText;
    const cost = document.getElementById('total-cost').innerText;
    const project = document.getElementById('project-name').value || "Project";

    const subject = encodeURIComponent(`Asphalt Calculation: ${project}`);
    const body = encodeURIComponent(`Here is the estimate for ${project}: \n\nTotal Asphalt Needed: ${weight} tons\nEstimated Material Cost: ${cost} €\n\nGenerated by Asphalt Rechner Pro.`);

    window.location.href = `mailto:? subject = ${subject}& body=${body} `;
}

async function exportPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Add Fonts/Styles
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80);
    doc.text("Asphalt Calculation Report", 20, 20);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()} `, 20, 28);

    const projectName = document.getElementById('project-name').value;
    if (projectName) {
        doc.setFontSize(14);
        doc.setTextColor(56, 189, 248); // Accent colorish
        doc.text(`Project: ${projectName} `, 20, 38);
        doc.setFontSize(10);
        doc.setTextColor(100);
    }

    doc.text("Evaluated by: Asphalt Rechner Pro", 20, projectName ? 45 : 33);

    // Inputs Table
    const shape = document.querySelector('input[name="shape"]:checked').value;
    const thickness = document.getElementById('thickness').value;
    const density = document.getElementById('density').value;
    const waste = document.getElementById('waste').value;
    const cost = document.getElementById('cost').value;

    const inputsData = [
        ['Parameter', 'Value', 'Unit']
    ];

    if (shape === 'rect') {
        inputsData.push(
            ['Shape', 'Rectangle', '-'],
            ['Length', document.getElementById('length').value, 'm'],
            ['Width', document.getElementById('width').value, 'm']
        );
    } else {
        inputsData.push(
            ['Shape', 'Circle', '-'],
            ['Diameter', document.getElementById('diameter').value, 'm']
        );
    }

    inputsData.push(
        ['Thickness', thickness, 'cm'],
        ['Density', density, 't/m³'],
        ['Waste Factor', waste, '%'],
        ['Material Cost', cost || '0', '€/t']
    );

    doc.autoTable({
        startY: projectName ? 55 : 43,
        head: [['Parameter', 'Value', 'Unit']],
        body: inputsData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [56, 189, 248] }
    });

    // Results
    const weight = document.getElementById('result').innerText;
    const volume = document.getElementById('volume').innerText;
    const totalCost = document.getElementById('total-cost').innerText;

    const resultsData = [
        ['Result', 'Value', 'Unit'],
        ['Asphalt Weight', weight, 't'],
        ['Asphalt Volume', volume, 'm³'],
        ['Estimated Cost', totalCost, '€']
    ];

    // Check Frost Results
    const frostContainer = document.getElementById('frost-result-container');
    if (frostContainer && frostContainer.style.display !== 'none') {
        const frostWeight = document.getElementById('frost-weight').innerText;
        const frostVol = document.getElementById('frost-volume').innerText;
        resultsData.push(
            ['Frost Layer Weight', frostWeight, 't'],
            ['Frost Layer Volume', frostVol, 'm³']
        );
    }

    doc.autoTable({
        startY: doc.lastAutoTable.finalY + 10,
        head: [['Result', 'Value', 'Unit']],
        body: resultsData.slice(1),
        theme: 'striped',
        headStyles: { fillColor: [74, 222, 128] }
    });



    // Add Logistics to PDF
    const truckCapacity = document.getElementById('truck-type').value;
    const asphaltTrucks = document.getElementById('trucks-asphalt').innerText;
    doc.text(`Logistics Estimate(Truck Capacity: ${truckCapacity}t)`, 20, doc.lastAutoTable.finalY + 20);
    doc.text(`- Asphalt Trucks Needed: ${asphaltTrucks} `, 20, doc.lastAutoTable.finalY + 28);


    doc.save(`Asphalt_Calculation_${projectName || "Report"}.pdf`);
}

function calculateTrucks(asphaltWeight, frostWeight) {
    const truckCapacity = parseFloat(document.getElementById('truck-type').value);
    if (!truckCapacity) return;

    // Asphalt
    const aspTrucks = Math.ceil(asphaltWeight / truckCapacity);
    document.getElementById('trucks-asphalt').innerText = aspTrucks;

    // Frost
    const frostContainer = document.getElementById('trucks-frost-container');
    if (frostWeight > 0) {
        const frostTrucks = Math.ceil(frostWeight / truckCapacity);
        document.getElementById('trucks-frost').innerText = frostTrucks;
        frostContainer.style.display = 'flex';
    } else {
        frostContainer.style.display = 'none';
    }
}
