const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware
app.use(helmet()); // Sets various HTTP headers for security
app.use(cors()); // Enables CORS (though same-origin in this setup)
app.use(express.json({ limit: '10kb' })); // Parse JSON bodies with size limit

// Rate Limiting (Prevent DDoS/Spam)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." }
});
app.use('/api/', limiter);

// Serve Static Files (Frontend)
app.use(express.static(__dirname));

// RStO Approximation Matrix (Server Side - Key Logic Hidden)
const rstoValues = {
    '1': { 'light': 50, 'medium': 60, 'heavy': 70 },
    '2': { 'light': 60, 'medium': 70, 'heavy': 80 },
    '3': { 'light': 70, 'medium': 80, 'heavy': 90 }
};

// Calculation API
app.post('/api/calculate', (req, res) => {
    try {
        // Input Validations
        const { length, width, thickness, density, zone, loadClass, frostToggle, fssThicknessOverride } = req.body;

        const len = parseFloat(length);
        const wid = parseFloat(width);
        const thk = parseFloat(thickness); // cm
        const den = parseFloat(density);

        if (isNaN(len) || len < 0) return res.status(400).json({ error: "Invalid Length" });
        if (isNaN(wid) || wid < 0) return res.status(400).json({ error: "Invalid Width" });
        if (isNaN(thk) || thk < 0) return res.status(400).json({ error: "Invalid Thickness" });

        // Asphalt Calculation
        const thicknessM = thk / 100;
        const asphaltVolume = len * wid * thicknessM;
        const asphaltWeight = asphaltVolume * den; // Density is t/m³

        let response = {
            asphaltWeight: asphaltWeight.toFixed(2),
            asphaltVolume: asphaltVolume.toFixed(2),
            frostResult: null
        };

        // Frost Calculation
        if (frostToggle) {
            // Validate Frost Inputs
            if (!rstoValues[zone] || !rstoValues[zone][loadClass]) {
                return res.status(400).json({ error: "Invalid Frost Zone or Load Class" });
            }

            const recommendedTotalDepthCm = rstoValues[zone][loadClass];

            // Calculate Default FSS
            let calculatedFssCm = recommendedTotalDepthCm - thk;
            if (calculatedFssCm < 0) calculatedFssCm = 0;

            // Use Override if provided and valid, else use calculated
            let finalFssCm = calculatedFssCm;
            if (fssThicknessOverride !== undefined && fssThicknessOverride !== null && fssThicknessOverride !== '') {
                const override = parseFloat(fssThicknessOverride);
                if (!isNaN(override) && override >= 0) {
                    finalFssCm = override;
                }
            }

            // FSS Calculation
            const fssDensity = 2.0;
            const fssThicknessM = finalFssCm / 100;
            const fssVolume = len * wid * fssThicknessM;
            const fssWeight = fssVolume * fssDensity;

            response.frostResult = {
                required: true,
                recTotalDepth: recommendedTotalDepthCm,
                recFssDepth: calculatedFssCm.toFixed(1), // The "Recommended" part
                usedFssDepth: finalFssCm, // What was actually calculated
                fssWeight: fssWeight.toFixed(2),
                fssVolume: fssVolume.toFixed(2)
            };
        }

        res.json(response);

    } catch (error) {
        console.error("Calculation Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running secure on http://localhost:${PORT}`);
});

module.exports = app;
