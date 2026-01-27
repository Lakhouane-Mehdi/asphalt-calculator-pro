"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { BarChart3, Lock, RefreshCcw } from 'lucide-react';

interface CountryStat {
    country_code: string;
    count: string;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<CountryStat[]>([]);
    const [loading, setLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pin, setPin] = useState('');

    // Simple "Senior" Security: A PIN to keep casual eyes out.
    // In a real enterprise app, we'd use NextAuth.js.
    const ADMIN_PIN = "2024";

    const fetchStats = async () => {
        setLoading(true);
        try {
            // Securely send PIN in headers (never rely on client-side check alone!)
            const res = await fetch('/api/analytics/stats', {
                headers: {
                    'x-admin-pin': ADMIN_PIN
                }
            });

            if (res.status === 401) {
                alert("Session Expired or Invalid PIN");
                setIsAuthenticated(false);
                return;
            }

            const data = await res.json();
            if (data.stats) {
                setStats(data.stats);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchStats();
        }
    }, [isAuthenticated]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (pin === ADMIN_PIN) {
            setIsAuthenticated(true);
        } else {
            alert("Access Denied");
        }
    };

    if (!isAuthenticated) {
        return (
            <main className="min-h-screen bg-background flex items-center justify-center p-4">
                <form onSubmit={handleLogin} className="max-w-md w-full bg-secondary/30 p-8 rounded-3xl border border-white/10 backdrop-blur-xl text-center space-y-6">
                    <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                        <Lock className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold">Admin Access</h1>
                    <input
                        type="password"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        placeholder="Enter PIN"
                        className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-center text-xl tracking-widest"
                        autoFocus
                    />
                    <button type="submit" className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:opacity-90 transition">
                        Unlock Dashboard
                    </button>
                </form>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background text-foreground">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 pt-32 pb-12">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight">Analytics Dashboard</h1>
                        <p className="text-muted-foreground mt-2">Real-time anonymous user distribution.</p>
                    </div>
                    <button
                        onClick={fetchStats}
                        disabled={loading}
                        className="p-3 bg-secondary rounded-xl hover:bg-secondary/80 transition disabled:opacity-50"
                    >
                        <RefreshCcw className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Summary Card */}
                    <div className="col-span-full lg:col-span-2 bg-secondary/20 border border-white/5 rounded-3xl p-8">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-primary" />
                            User Distribution by Country
                        </h3>

                        <div className="space-y-4">
                            {stats.length === 0 ? (
                                <p className="text-muted-foreground italic">No data yet. Wait for users to accept cookies!</p>
                            ) : (
                                stats.map((stat) => (
                                    <div key={stat.country_code} className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-bold flex items-center gap-2">
                                                <img
                                                    src={`https://flagcdn.com/24x18/${stat.country_code.toLowerCase()}.png`}
                                                    alt={stat.country_code}
                                                    className="rounded-sm"
                                                />
                                                {stat.country_code === 'Unknown' ? 'Global / Unknown' : stat.country_code}
                                            </span>
                                            <span className="text-muted-foreground">{stat.count} users</span>
                                        </div>
                                        <div className="h-3 bg-secondary/50 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary rounded-full transition-all duration-1000"
                                                style={{ width: `${(parseInt(stat.count) / Math.max(...stats.map(s => parseInt(s.count)))) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Quick Stats or Upsell */}
                    <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-3xl p-8 flex flex-col justify-center text-center">
                        <h3 className="text-2xl font-bold text-primary mb-2">Total Touchpoints</h3>
                        <p className="text-6xl font-black tracking-tighter">
                            {stats.reduce((acc, curr) => acc + parseInt(curr.count), 0)}
                        </p>
                        <p className="text-sm text-muted-foreground mt-4">Anonymous interactions tracked</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
