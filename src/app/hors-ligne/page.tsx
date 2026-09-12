import { WifiOff } from 'lucide-react';

export const metadata = { title: 'Hors ligne — BABI SWIPE IMMO' };

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-[#0F1115] text-white flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#1A1D24] border border-white/10 flex items-center justify-center mb-5">
        <WifiOff className="w-7 h-7 text-[#FF5A2D]" />
      </div>
      <h1 className="text-xl font-extrabold">Connexion perdue</h1>
      <p className="text-sm text-gray-400 mt-2 max-w-xs">
        Impossible de charger les annonces pour l&apos;instant. Vos favoris et vos préférences sont
        conservés : revenez dès que le réseau est de retour.
      </p>
    </main>
  );
}
