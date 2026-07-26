"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import Webcam from "react-webcam";
import { Camera, RotateCcw, Check, ScanLine } from "lucide-react";
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
    const [calibrationPoints, setCalibrationPoints] = useState<{ x: number; y: number }[]>([]);
    const [isCalibrating, setIsCalibrating] = useState(false);

    // Reference Object Options
    const [referenceType, setReferenceType] = useState<'card' | 'a4' | 'letter' | 'custom'>('card');
    const [customLength, setCustomLength] = useState<string>('0.1'); // Default 10cm

    // Reference Sizes (in meters) - Longest side usually
    const REF_SIZES = {
        card: 0.0856, // ID-1 Standard (85.60mm)
        a4: 0.297,    // A4 Long Side (297mm)
        letter: 0.279, // US Letter Long Side (279.4mm)
    };

    // Default scale: ~0.0856m (card width) per 200px (reference box)
    const [scale, setScale] = useState<number>((CARD_WIDTH_MM / 1000) / REF_BOX_WIDTH_PX);
    const [calculatedArea, setCalculatedArea] = useState<number | null>(null);
    const [isCameraActive, setIsCameraActive] = useState(false);

    const webcamRef = useRef<Webcam>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Capture Photo
    const capture = useCallback(() => {
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            setImage(imageSrc);
            setIsCameraActive(false);
            // Reset calibration to default for camera captures initially
            setScale((CARD_WIDTH_MM / 1000) / REF_BOX_WIDTH_PX);
            setCalibrationPoints([]);
        }
    }, [webcamRef]);

    // Handle File Upload
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
                setIsCameraActive(false);
                setPoints([]);
                setCalculatedArea(null);
                // Reset scale and force calibration for uploads
                setScale(0);
                setCalibrationPoints([]);
                setIsCalibrating(true); // Auto-enter calibration mode
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle Clicks (Polygon or Calibration)
    const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!canvasRef.current || !image) return;

        const rect = canvasRef.current.getBoundingClientRect();
        // Calculate relative coordinates (0-1) to be resolution independent if needed, 
        // but for simplicity we use pixel coordinates relative to the displayed image size.
        // *Better approach*: Use native image coordinates. 
        // For this MVP, we use the displayed size, assuming the image fits the container.
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (isCalibrating) {
            const newCalib = [...calibrationPoints, { x, y }];
            setCalibrationPoints(newCalib);

            if (newCalib.length === 2) {
                // Calculate scale immediately
                const p1 = newCalib[0];
                const p2 = newCalib[1];
                const distPx = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));

                let refLengthM = 0;
                if (referenceType === 'custom') {
                    refLengthM = parseFloat(customLength) || 0.1;
                } else {
                    refLengthM = REF_SIZES[referenceType];
                }

                if (distPx > 0) {
                    const newScale = refLengthM / distPx;
                    setScale(newScale);
                    setIsCalibrating(false); // Calibration done
                }
            }
        } else {
            setPoints([...points, { x, y }]);
        }
    };

    // Reset All
    const reset = () => {
        setImage(null);
        setPoints([]);
        setCalibrationPoints([]);
        setCalculatedArea(null);
        setIsCameraActive(false);
        setIsCalibrating(false);
    };

    // Recalibrate Action
    const startCalibration = () => {
        setCalibrationPoints([]);
        setIsCalibrating(true);
        setScale(0); // Invalid until finished
        setCalculatedArea(null);
    };

    // Shoelace Formula for Area
    const calculateArea = () => {
        if (points.length < 3 || scale === 0) return;

        // 1. Calculate Area in Pixels
        let areaPx = 0;
        for (let i = 0; i < points.length; i++) {
            const p1 = points[i];
            const p2 = points[i === points.length - 1 ? 0 : i + 1];
            areaPx += (p1.x * p2.y) - (p2.x * p1.y);
        }
        areaPx = Math.abs(areaPx) / 2;

        // 2. Convert to Meters (Area = px² * scale²)
        const areaM2 = areaPx * scale * scale;

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
                    /* Initial State: Camera or Upload */
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative rounded-xl overflow-hidden bg-black/5 aspect-[4/3] flex flex-col items-center justify-center gap-4 border-2 border-dashed border-gray-300 hover:bg-black/10 transition-colors cursor-pointer"
                            onClick={() => setIsCameraActive(true)}>
                            <Camera className="h-12 w-12 text-gray-400" />
                            <span className="font-semibold text-sm">{t('vision.startCamera')}</span>
                        </div>

                        <div className="relative rounded-xl overflow-hidden bg-black/5 aspect-[4/3] flex flex-col items-center justify-center gap-4 border-2 border-dashed border-gray-300 hover:bg-black/10 transition-colors cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileUpload}
                            />
                            <ScanLine className="h-12 w-12 text-gray-400" />
                            <span className="font-semibold text-sm">Upload Image</span>
                            <span className="text-[10px] text-muted-foreground text-center px-4">Supports jpg, png</span>
                        </div>

                        <div className="sm:col-span-2 text-center">
                            <p className="text-xs text-muted-foreground px-8">
                                {t('vision.permission')} Use a standard card (Bank, ID, License) for scale.
                            </p>
                        </div>
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
                        <Button
                            onClick={() => setIsCameraActive(false)}
                            className="absolute top-4 right-4 bg-black/50 text-white hover:bg-black/70 rounded-full w-8 h-8 p-0"
                        >
                            X
                        </Button>
                    </div>
                ) : (
                    /* Editor / Analysis View */
                    <div className="space-y-4">
                        {/* Calibration Controls */}
                        <div className="bg-secondary/30 p-3 rounded-xl space-y-3">
                            <div className="flex flex-wrap gap-2">
                                <span className="text-xs font-bold w-full">Reference Object:</span>
                                <Button
                                    size="sm"
                                    variant={referenceType === 'card' ? 'primary' : 'outline'}
                                    onClick={() => { setReferenceType('card'); startCalibration(); }}
                                    className="h-7 text-xs"
                                >
                                    Standard Card
                                </Button>
                                <Button
                                    size="sm"
                                    variant={referenceType === 'a4' ? 'primary' : 'outline'}
                                    onClick={() => { setReferenceType('a4'); startCalibration(); }}
                                    className="h-7 text-xs"
                                >
                                    A4 Paper
                                </Button>
                                <Button
                                    size="sm"
                                    variant={referenceType === 'letter' ? 'primary' : 'outline'}
                                    onClick={() => { setReferenceType('letter'); startCalibration(); }}
                                    className="h-7 text-xs"
                                >
                                    Letter Paper
                                </Button>
                                <Button
                                    size="sm"
                                    variant={referenceType === 'custom' ? 'primary' : 'outline'}
                                    onClick={() => { setReferenceType('custom'); startCalibration(); }}
                                    className="h-7 text-xs"
                                >
                                    Custom
                                </Button>
                            </div>

                            {referenceType === 'custom' && (
                                <div className="flex items-center gap-2 animate-in fade-in">
                                    <span className="text-xs whitespace-nowrap">Known Length (m):</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={customLength}
                                        onChange={(e) => setCustomLength(e.target.value)}
                                        className="h-7 w-20 rounded border px-2 text-xs bg-background"
                                    />
                                </div>
                            )}

                            <div className="flex justify-between items-center pt-2 border-t border-border/50">
                                <div className="text-xs">
                                    <span className="font-bold">Status: </span>
                                    {scale > 0 ? <span className="text-green-500">Calibrated</span> : <span className="text-red-500">Recalibrate Needed</span>}
                                </div>
                                <Button
                                    size="sm"
                                    variant={isCalibrating ? "primary" : "outline"}
                                    onClick={startCalibration}
                                    className={isCalibrating ? "bg-blue-600 hover:bg-blue-700 h-7" : "h-7"}
                                >
                                    <ScanLine className="h-3 w-3 mr-2" />
                                    {isCalibrating ? "Click 2 Corners" : "Recalibrate"}
                                </Button>
                            </div>
                        </div>

                        <div
                            ref={canvasRef}
                            onClick={handleImageClick}
                            className={`relative rounded-xl overflow-hidden bg-black aspect-[4/3] select-none ${isCalibrating ? "cursor-crosshair ring-2 ring-blue-500" : "cursor-crosshair"}`}
                        >
                            {/* Captured Image */}
                            <Image src={image} alt="Capture" fill className="absolute inset-0 object-contain opacity-90" />

                            {/* Calibration Overlay */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                {/* Calibration Line */}
                                {calibrationPoints.length > 0 && (
                                    <>
                                        {calibrationPoints.map((p, i) => (
                                            <circle key={`c-${i}`} cx={p.x} cy={p.y} r="6" className="fill-blue-500 stroke-white stroke-2" />
                                        ))}
                                        {calibrationPoints.length === 2 && (
                                            <line
                                                x1={calibrationPoints[0].x} y1={calibrationPoints[0].y}
                                                x2={calibrationPoints[1].x} y2={calibrationPoints[1].y}
                                                className="stroke-blue-500 stroke-2"
                                            />
                                        )}
                                    </>
                                )}

                                {/* Measurement Polygon */}
                                {!isCalibrating && (
                                    <>
                                        <polygon
                                            points={points.map(p => `${p.x},${p.y}`).join(" ")}
                                            className="fill-purple-500/30 stroke-purple-500 stroke-2"
                                        />
                                        {points.map((p, i) => (
                                            <circle key={i} cx={p.x} cy={p.y} r="4" className="fill-white" />
                                        ))}
                                    </>
                                )}
                            </svg>

                            <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded pointer-events-none">
                                {isCalibrating
                                    ? `Click 2 corners of your card (${calibrationPoints.length}/2)`
                                    : t('vision.tapCorners')}
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
                                    disabled={points.length < 3 || scale === 0 || isCalibrating}
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
