"use client";

import { useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { Camera, X, RotateCcw, Check, ScanLine } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";

// Standard Credit Card Dimensions
const CARD_WIDTH_MM = 85.6;
// On-screen reference box size (in logical pixels - we'll treat this as our "known calibration")
const REF_BOX_WIDTH_PX = 200;

export default function VisionMeasurement() {
    const { t } = useLanguage();
    const [image, setImage] = useState<string | null>(null);
    const [points, setPoints] = useState<{ x: number; y: number }[]>([]);
    const [calculatedArea, setCalculatedArea] = useState<number | null>(null);
    const [isCameraActive, setIsCameraActive] = useState(false);

    const webcamRef = useRef<Webcam>(null);
    const canvasRef = useRef<HTMLDivElement>(null);

    // Capture Photo
    const capture = useCallback(() => {
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            setImage(imageSrc);
            setIsCameraActive(false); // Stop camera processing when image is captured
        }
    }, [webcamRef]);

    // Handle Polygon Drawing
    const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!canvasRef.current || !image) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setPoints([...points, { x, y }]);
    };

    // Reset Calibration/Points
    const reset = () => {
        setImage(null);
        setPoints([]);
        setCalculatedArea(null);
        setIsCameraActive(true); // Reactivate camera for retake
    };

    // Shoelace Formula for Area
    const calculateArea = () => {
        if (points.length < 3) return;

        // 1. Calculate Area in Pixels
        let areaPx = 0;
        const j = points.length - 1;

        for (let i = 0; i < points.length; i++) {
            const p1 = points[i];
            const p2 = points[i === points.length - 1 ? 0 : i + 1];
            areaPx += (p1.x * p2.y) - (p2.x * p1.y);
        }
        areaPx = Math.abs(areaPx) / 2;

        // 2. Convert to Meters
        // Scale: Meters per Pixel
        // We assume the user aligned the 85.6mm card to our 200px box.
        // 0.0856 meters = 200 pixels
        const metersPerPixel = (CARD_WIDTH_MM / 1000) / REF_BOX_WIDTH_PX;

        const areaM2 = areaPx * metersPerPixel * metersPerPixel;

        setCalculatedArea(parseFloat(areaM2.toFixed(3)));
    };

    return (
        <Card className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <CardHeader>
                <div className="h-10 w-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-500">
                    <ScanLine className="h-6 w-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold">{t('vision.title')}</h2>
                    <p className="text-xs text-muted-foreground">{t('vision.subtitle')}</p>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">

                {!isCameraActive && !image ? (
                    /* Inactive State */
                    <div className="relative rounded-xl overflow-hidden bg-black/5 aspect-[4/3] flex flex-col items-center justify-center gap-4 border-2 border-dashed border-gray-300">
                        <Camera className="h-12 w-12 text-gray-400" />
                        <Button
                            onClick={() => setIsCameraActive(true)}
                            className="bg-purple-600 hover:bg-purple-700"
                        >
                            {t('vision.startCamera')}
                        </Button>
                        <p className="text-xs text-muted-foreground text-center px-8">
                            {t('vision.permission')}
                        </p>
                    </div>
                ) : !image ? (
                    /* Camera View */
                    <div className="relative rounded-xl overflow-hidden bg-black aspect-[4/3] flex items-center justify-center">
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            className="absolute inset-0 w-full h-full object-cover"
                            videoConstraints={{ facingMode: "environment" }}
                        />

                        {/* Overlay: Calibration Box */}
                        <div
                            className="absolute border-2 border-green-500 bg-green-500/10 rounded-lg flex items-center justify-center animate-pulse"
                            style={{ width: `${REF_BOX_WIDTH_PX}px`, height: `${REF_BOX_WIDTH_PX / 1.58}px` }} // AR ~1.58 for cards
                        >
                            <div className="text-[10px] text-green-500 font-bold bg-black/50 px-2 py-1 rounded">
                                {t('vision.alignCard')}
                            </div>
                        </div>

                        <Button
                            onClick={capture}
                            className="absolute bottom-4 bg-white text-black hover:bg-white/90 rounded-full h-14 w-14 p-0 shadow-lg border-4 border-white/50"
                        >
                            <Camera className="h-6 w-6" />
                        </Button>
                    </div>
                ) : (
                    /* Analysis View */
                    <div className="space-y-4">
                        <div
                            ref={canvasRef}
                            onClick={handleImageClick}
                            className="relative rounded-xl overflow-hidden bg-black aspect-[4/3] cursor-crosshair select-none"
                        >
                            {/* Captured Image */}
                            <img src={image} alt="Capture" className="absolute inset-0 w-full h-full object-cover opacity-80" />

                            {/* SVG Overlay for Polygons */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                <polygon
                                    points={points.map(p => `${p.x},${p.y}`).join(" ")}
                                    className="fill-purple-500/30 stroke-purple-500 stroke-2"
                                />
                                {points.map((p, i) => (
                                    <circle key={i} cx={p.x} cy={p.y} r="4" className="fill-white" />
                                ))}
                            </svg>

                            <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded">
                                {t('vision.tapCorners')}
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                            <Button onClick={reset} variant="ghost" size="sm" className="text-red-400 hover:bg-red-950/20">
                                <RotateCcw className="h-4 w-4 mr-1" /> {t('vision.retake')}
                            </Button>

                            {calculatedArea !== null ? (
                                <div className="flex flex-col items-end">
                                    <span className="text-xs text-muted-foreground">{t('vision.measuredArea')}</span>
                                    <span className="text-xl font-bold text-purple-400">{calculatedArea} m²</span>
                                </div>
                            ) : (
                                <Button
                                    onClick={calculateArea}
                                    disabled={points.length < 3}
                                    className="bg-purple-600 hover:bg-purple-700"
                                >
                                    <Check className="h-4 w-4 mr-2" /> {t('vision.calculate')}
                                </Button>
                            )}
                        </div>
                    </div>
                )}

            </CardContent>
        </Card>
    );
}
