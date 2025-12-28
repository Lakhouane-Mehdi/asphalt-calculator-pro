document.addEventListener('DOMContentLoaded', () => {
    const lengthInput = document.getElementById('length');
    const widthInput = document.getElementById('width');
    const thicknessInput = document.getElementById('thickness');
    const densityInput = document.getElementById('density');
    const costInput = document.getElementById('cost');
    const truckTypeSelect = document.getElementById('truck-type');

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
    const settings = [frostZoneSelect, loadClassSelect, frostToggle, truckTypeSelect];

    let debounceTimer;

    async function calculate() {
        // Collect Inputs
        const length = lengthInput.value;
        const width = widthInput.value;
        const thickness = thicknessInput.value;
        const density = densityInput.value;
        const zone = frostZoneSelect.value;
        const loadClass = loadClassSelect.value;
        const frostActive = frostToggle.checked;
        const fssOverride = fssThicknessInput.value;

        // Basic Check
        if ((!length || !width || !thickness) && !frostActive) {
            // Don't clear results, just return, unless we want to clear?
            return;
        }

        // Cancel previous pending request
        clearTimeout(debounceTimer);

        // Debounce: Wait 300ms after user stops typing
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
                    console.warn("Rate limit exceeded");
                    return;
                }

                if (!response.ok) {
                    console.error("Server API Error");
                    return;
                }

                const data = await response.json();

                // Update UI with Server Data
                if (data.asphaltWeight) {
                    resultElement.innerText = data.asphaltWeight;
                    volumeElement.innerText = data.asphaltVolume;

                    // Cost Calculation
                    const costPerTon = parseFloat(costInput.value) || 0;
                    const totalCost = (parseFloat(data.asphaltWeight) * costPerTon).toFixed(2);
                    totalCostElement.innerText = totalCost;

                    // Visualization: Asphalt
                    // Max display height approx 100px for asphalt
                    // Map 0-30cm to 0-100px
                    const thicknessVal = parseFloat(thickness);
                    const aspHeight = Math.min(thicknessVal * 4, 120); // Scale factor
                    const aspLayer = document.getElementById('layer-asphalt');
                    aspLayer.style.height = `${aspHeight}px`;
                    aspLayer.querySelector('span').innerText = `Asphalt ${thicknessVal}cm`;

                    calculateTrucks(parseFloat(data.asphaltWeight), 0);
                }

                if (data.frostResult) {
                    frostResultContainer.style.display = 'block';
                    recTotalDepthElement.innerText = data.frostResult.recTotalDepth;

                    // Smart Input Update: Only update the field if the user is NOT typing in it currently
                    if (document.activeElement !== fssThicknessInput && !fssOverride) {
                        fssThicknessInput.value = data.frostResult.usedFssDepth;
                    }

                    frostWeightElement.innerText = data.frostResult.fssWeight;
                    frostVolumeElement.innerText = data.frostResult.fssVolume;

                    // Visualization: Frost
                    const fssVal = parseFloat(data.frostResult.usedFssDepth);
                    const fssHeight = Math.min(fssVal * 2, 100); // Scale factor
                    const fssLayer = document.getElementById('layer-frost');
                    fssLayer.style.height = `${fssHeight}px`;
                    fssLayer.querySelector('span').innerText = `Frost ${fssVal}cm`;

                    calculateTrucks(parseFloat(resultElement.innerText), parseFloat(data.frostResult.fssWeight));
                } else {
                    frostResultContainer.style.display = 'none';
                    // Reset Frost Vis
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
    settings.forEach(input => input.addEventListener('change', calculate));

    // Special case for Frost Toggle to show/hide section immediately visually, then calc
    frostToggle.addEventListener('change', () => {
        // The toggleFrostSection function still handles the visual slide
        // trigger calc to get data
        calculate();
    });
    // Check for saved theme
    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-mode');
        document.getElementById('theme-icon').innerText = '☀️';
    }
});

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
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 28);
    doc.text("Evaluated by: Asphalt Rechner Pro", 20, 33);

    // Inputs Table
    const length = document.getElementById('length').value;
    const width = document.getElementById('width').value;
    const thickness = document.getElementById('thickness').value;
    const density = document.getElementById('density').value;
    const cost = document.getElementById('cost').value;

    const inputsData = [
        ['Parameter', 'Value', 'Unit'],
        ['Length', length, 'm'],
        ['Width', width, 'm'],
        ['Thickness', thickness, 'cm'],
        ['Density', density, 't/m³'],
        ['Material Cost', cost || '0', '€/t']
    ];

    doc.autoTable({
        startY: 40,
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
    doc.text(`Logistics Estimate (Truck Capacity: ${truckCapacity}t)`, 20, doc.lastAutoTable.finalY + 20);
    doc.text(`- Asphalt Trucks Needed: ${asphaltTrucks}`, 20, doc.lastAutoTable.finalY + 28);


    doc.save("Asphalt_Calculation.pdf");
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
