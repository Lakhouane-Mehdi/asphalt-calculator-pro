"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";

export default function PrivacyPolicy() {
    return (
        <main className="min-h-screen bg-background text-foreground">
            <Navbar />
            <div className="max-w-4xl mx-auto px-6 pt-32 pb-24">
                <h1 className="text-4xl font-black tracking-tight mb-8">Datenschutzerklärung</h1>

                <div className="space-y-8 text-muted-foreground leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-4">1. Datenschutz auf einen Blick</h2>
                        <h3 className="font-bold text-foreground mt-4">Allgemeine Hinweise</h3>
                        <p>Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-4">2. Datenerfassung auf dieser Website</h2>
                        <h3 className="font-bold text-foreground mt-4">Wer ist verantwortlich für die Datenerfassung auf dieser Website?</h3>
                        <p>Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie dem Impressum dieser Website entnehmen.</p>

                        <h3 className="font-bold text-foreground mt-4">Wie erfassen wir Ihre Daten?</h3>
                        <p>Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es sich z. B. um Daten handeln, die Sie in ein Kontaktformular eingeben.</p>
                        <p>Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website durch unsere IT-Systeme erfasst. Das sind vor allem technische Daten (z. B. Internetbrowser, Betriebssystem oder Uhrzeit des Seitenaufrufs).</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-4">3. Analyse-Tools und Tools von Drittanbietern</h2>
                        <p>Beim Besuch dieser Website kann Ihr Surf-Verhalten statistisch ausgewertet werden. Dies geschieht vor allem mit sogenannten Analyseprogrammen.</p>
                        <p><strong>Wir nutzen Vercel Analytics:</strong> Zur Verbesserung unserer Dienste erfassen wir anonymisierte Standortdaten (Land). Diese Daten werden erst nach Ihrer ausdrücklichen Einwilligung im Cookie-Banner gespeichert.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-4">4. Hosting</h2>
                        <p>Wir hosten unsere Website bei Vercel. Anbieter ist die Vercel Inc., 440 N Barranca Ave #4133 Covina, CA 91723, USA. Vercel ist ein Cloud-Plattform-Anbieter. Die Nutzung von Vercel erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO.</p>
                    </section>
                </div>
            </div>
        </main>
    );
}
