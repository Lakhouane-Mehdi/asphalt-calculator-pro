"use client";

import { useState, useRef } from "react";
import Webcam from "react-webcam";
import { Cuboid, Eye, EyeOff } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function AROverlay() {
    const [active, setActive] = useState(false);

    // Transformation State
    const [tilt, setTilt] = useState(60); // Degrees (Start looking down)
    const [scale, setScale] = useState(1); // Visual scale
    const [verticalOffset, setVerticalOffset] = useState(0); // Move grid up/down screen

    const toggleAR = () => setActive(!active);

    return (
        <Card className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-500">
                        <Cuboid className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">AR Visualizer</h2>
                        <p className="text-xs text-muted-foreground">Virtual Grid Overlay</p>
                    </div>
                </div>
                <Button onClick={toggleAR} variant={active ? "secondary" : "outline"} size="sm">
                    {active ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                    {active ? "Close AR" : "View AR"}
                </Button>
            </CardHeader>

            {active && (
                <CardContent className="space-y-4">
                    <div className="relative rounded-xl overflow-hidden bg-black aspect-[4/3] flex items-center justify-center perspective-[1000px]">
                        {/* Camera */}
                        <Webcam
                            audio={false}
                            className="absolute inset-0 w-full h-full object-cover"
                            videoConstraints={{ facingMode: "environment" }}
                        />

                        {/* 3D Plane */}
                        <div
                            className="absolute w-[600px] h-[600px] border-4 border-blue-500/50 bg-blue-500/10 origin-center"
                            style={{
                                transform: `rotateX(${tilt}deg) translateY(${verticalOffset}px) scale(${scale})`,
                                backgroundImage: `
                        linear-gradient(to right, rgba(59, 130, 246, 0.3) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
                    `,
                                backgroundSize: '50px 50px' // Represents approx 0.5m tiles visually
                            }}
                        >
                            {/* Center Marker */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_20px_rgba(59,130,246,1)]" />
                            </div>
                            <div className="absolute bottom-2 right-2 text-blue-300 text-xs font-mono bg-black/50 px-2 rounded">
                                Grid: ~0.5m Tiles
                            </div>
                        </div>

                        {/* Controls Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-4 space-y-2 backdrop-blur-sm">
                            <div className="space-y-1">
                                <label className="text-[10px] text-white flex justify-between">
                                    <span>Tilt (Perspective)</span> <span>{tilt}°</span>
                                </label>
                                <input
                                    type="range" min="0" max="90"
                                    value={tilt} onChange={(e) => setTilt(Number(e.target.value))}
                                    className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] text-white flex justify-between">
                                    <span>Height</span> <span>{verticalOffset}</span>
                                </label>
                                <input
                                    type="range" min="-200" max="200"
                                    value={verticalOffset} onChange={(e) => setVerticalOffset(Number(e.target.value))}
                                    className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>

                    <p className="text-xs text-center text-muted-foreground">
                        Adjust Tilt & Height to align the grid with the floor.
                    </p>
                </CardContent>
            )}
        </Card>
    );
}
