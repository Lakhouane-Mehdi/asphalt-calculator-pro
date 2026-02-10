"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";

export default function Impressum() {
    useLanguage();

    return (
        <main className="min-h-screen bg-background text-foreground">
            <Navbar />
            <div className="max-w-4xl mx-auto px-6 pt-32 pb-24">
                <h1 className="text-4xl font-black tracking-tight mb-8">Impressum</h1>

                <section className="space-y-8 text-muted-foreground leading-relaxed">
                    <div>
                        <h2 className="text-xl font-bold text-foreground mb-4">Angaben gemäß § 5 TDDDG</h2>
                        <p>[Your Name / Company Name]</p>
                        <p>[Street Address]</p>
                        <p>[Postal Code, City]</p>
                        <p>Germany</p>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-foreground mb-2">Kontakt</h2>
                        <p>Telefon: [Your Phone Number]</p>
                        <p>E-Mail: [Your Email Address]</p>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-foreground mb-2">Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
                        <p>[Your Name]</p>
                        <p>[Street Address]</p>
                        <p>[Postal Code, City]</p>
                    </div>

                    <div className="pt-8 border-t border-border">
                        <h2 className="text-xl font-bold text-foreground mb-4">EU-Streitschlichtung</h2>
                        <p>Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: <a href="https://ec.europa.eu/consumers/odr/" target="_blank" className="text-primary hover:underline">https://ec.europa.eu/consumers/odr/</a>.</p>
                        <p>Unsere E-Mail-Adresse finden Sie oben im Impressum.</p>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-foreground mb-4">Verbraucherstreitbeilegung/ Universalschlichtungsstelle</h2>
                        <p>Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
                    </div>
                </section>
            </div>
        </main>
    );
}
