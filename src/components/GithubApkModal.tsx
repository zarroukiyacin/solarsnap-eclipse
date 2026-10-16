import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Github, 
  Smartphone, 
  Terminal, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink, 
  FileCode, 
  Sparkles,
  Layers,
  ShieldCheck,
  Cpu
} from 'lucide-react';

interface GithubApkModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  isEmbedded?: boolean;
}

export const GithubApkModal: React.FC<GithubApkModalProps> = ({ 
  isOpen = true, 
  onClose, 
  isEmbedded = false 
}) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'commands' | 'download' | 'workflow' | 'pwa'>('guide');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [repoName, setRepoName] = useState<string>('solarsnap-eclipse');
  const [githubUser, setGithubUser] = useState<string>('mon-compte-github');
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  if (!isOpen && !isEmbedded) return null;

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const handleDownloadZip = async () => {
    try {
      setIsDownloading(true);
      setDownloadSuccess(false);
      const res = await fetch('/api/download-project-zip');
      if (!res.ok) {
        throw new Error("Erreur lors de la génération de l'archive ZIP");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `solarsnap-eclipse-camera-github.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setDownloadSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Erreur lors du téléchargement. Veuillez réessayer.");
    } finally {
      setIsDownloading(false);
    }
  };

  const gitCommands = [
    { title: "1. Initialiser le dépôt git", cmd: "git init" },
    { title: "2. Ajouter tous les fichiers (Capacitor, Android, Vite)", cmd: "git add ." },
    { title: "3. Créer le premier commit", cmd: 'git commit -m "Initial commit SolarSnap Eclipse with Capacitor APK workflow"' },
    { title: "4. Définir la branche principale", cmd: "git branch -M main" },
    { 
      title: "5. Lier votre dépôt GitHub", 
      cmd: `git remote add origin https://github.com/${githubUser}/${repoName}.git` 
    },
    { title: "6. Pousser vers GitHub et lancer la compilation APK", cmd: "git push -u origin main" }
  ];

  const fullScript = `# === Script complet pour publier sur GitHub ===
git init
git add .
git commit -m "Feat: SolarSnap Eclipse Camera with Capacitor Android APK"
git branch -M main
git remote add origin https://github.com/${githubUser}/${repoName}.git
git push -u origin main
`;

  const containerClasses = isEmbedded
    ? "flex-1 flex flex-col h-full bg-slate-900 overflow-hidden"
    : "fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fadeIn overflow-y-auto";

  const cardClasses = isEmbedded
    ? "flex-1 flex flex-col h-full bg-slate-900 overflow-hidden"
    : "relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]";

  return (
    <div className={containerClasses}>
      <div className={cardClasses}>
        
        {/* Header */}
        <div className="p-3.5 sm:p-4 bg-gradient-to-r from-amber-500/20 via-slate-800 to-slate-900 border-b border-slate-700/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner shrink-0">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  Export GitHub & Générateur APK
                </h2>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Capacitor 7
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1">
                Poussez sur GitHub pour compiler automatiquement votre <span className="text-amber-400 font-mono font-medium">.apk</span> Android
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-3 pt-2 gap-1 text-xs shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3 py-2 rounded-t-lg font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'guide'
                ? 'bg-slate-900 text-amber-400 border-t-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Guide Pas-à-Pas
          </button>

          <button
            onClick={() => setActiveTab('commands')}
            className={`px-3 py-2 rounded-t-lg font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'commands'
                ? 'bg-slate-900 text-amber-400 border-t-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Commandes Git
          </button>

          <button
            onClick={() => setActiveTab('download')}
            className={`px-3 py-2 rounded-t-lg font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'download'
                ? 'bg-slate-900 text-amber-400 border-t-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            Télécharger ZIP
          </button>

          <button
            onClick={() => setActiveTab('workflow')}
            className={`px-3 py-2 rounded-t-lg font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'workflow'
                ? 'bg-slate-900 text-amber-400 border-t-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            Workflow CI/CD
          </button>

          <button
            onClick={() => setActiveTab('pwa')}
            className={`px-3 py-2 rounded-t-lg font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'pwa'
                ? 'bg-slate-900 text-amber-400 border-t-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            WebAPK Immédiat
          </button>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 text-sm space-y-4">
          
          {/* TAB 1: GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-300 font-semibold">Génération 100% Automatique dans le Cloud :</strong> Pas besoin d'installer Android Studio ni Java sur votre ordinateur ! Dès que vous poussez le projet sur GitHub, les serveurs de GitHub compilent l'APK gratuitement pour vous.
                </div>
              </div>

              {/* 3 Step Visual Path */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center">1</span>
                    <span className="font-semibold text-slate-200 text-xs">Créer le dépôt</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Créez un dépôt vide sur <strong className="text-slate-300">GitHub.com</strong> (ex: <code className="text-amber-400">solarsnap-eclipse</code>).
                  </p>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center">2</span>
                    <span className="font-semibold text-slate-200 text-xs">Pousser le code</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Téléchargez le projet (ZIP) ou utilisez le terminal avec <code className="text-amber-400">git push origin main</code>.
                  </p>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center">3</span>
                    <span className="font-semibold text-slate-200 text-xs">Télécharger l'APK</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Dans l'onglet <strong className="text-emerald-300">Actions</strong> de GitHub, téléchargez <code className="text-emerald-400">.apk</code> dans les Artifacts !
                  </p>
                </div>
              </div>

              {/* Detailed Explanation */}
              <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-3">
                <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Ce qui a déjà été configuré pour vous dans le projet :
                </h3>
                <ul className="text-xs text-slate-300 space-y-2 pl-2">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">✔</span>
                    <span><strong>Projet Android natif complet</strong> généré dans <code className="text-slate-400 bg-slate-900 px-1 py-0.5 rounded">/android</code> avec Gradle Wrapper.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">✔</span>
                    <span><strong>Permissions Android complètes</strong> configurées dans AndroidManifest.xml (<code className="text-slate-400">CAMERA</code>, <code className="text-slate-400">FLASHLIGHT</code>, <code className="text-slate-400">LOCATION</code>, <code className="text-slate-400">MEDIA_IMAGES</code>).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">✔</span>
                    <span><strong>GitHub Actions CI/CD</strong> dans <code className="text-slate-400 bg-slate-900 px-1 py-0.5 rounded">.github/workflows/build-apk.yml</code> pour compiler automatiquement à chaque push.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">✔</span>
                    <span><strong>Configuration Capacitor</strong> prête dans <code className="text-slate-400 bg-slate-900 px-1 py-0.5 rounded">capacitor.config.ts</code> avec l'identifiant <code className="text-amber-400">com.solarsnap.eclipse</code>.</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => setActiveTab('download')}
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md"
                >
                  <Download className="w-4 h-4" />
                  Télécharger le ZIP du projet pour GitHub
                </button>
                <button
                  onClick={() => setActiveTab('commands')}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-700"
                >
                  <Terminal className="w-4 h-4 text-amber-400" />
                  Voir les commandes Git
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: COMMANDS */}
          {activeTab === 'commands' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="text-xs font-semibold text-slate-300">Personnaliser l'adresse de votre dépôt GitHub :</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Votre pseudo GitHub :</label>
                    <input
                      type="text"
                      value={githubUser}
                      onChange={(e) => setGithubUser(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-amber-400"
                      placeholder="ex: zarrouki"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Nom du dépôt :</label>
                    <input
                      type="text"
                      value={repoName}
                      onChange={(e) => setRepoName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-amber-400"
                      placeholder="solarsnap-eclipse"
                    />
                  </div>
                </div>
              </div>

              {/* Full one-shot script */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                <div className="bg-slate-900/90 px-3.5 py-2 border-b border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-300 font-semibold">Toutes les commandes en 1 clic :</span>
                  <button
                    onClick={() => handleCopy(fullScript, 999)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors"
                  >
                    {copiedIndex === 999 ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copié !</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copier Tout</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3.5 text-[11px] font-mono text-amber-300/90 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {fullScript}
                </pre>
              </div>

              {/* Step by step commands */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-400">Détail étape par étape :</div>
                {gitCommands.map((item, idx) => (
                  <div key={idx} className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-2.5 flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-slate-400 font-medium">{item.title}</div>
                      <div className="text-xs font-mono text-slate-200 truncate">{item.cmd}</div>
                    </div>
                    <button
                      onClick={() => handleCopy(item.cmd, idx)}
                      className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors shrink-0"
                      title="Copier la commande"
                    >
                      {copiedIndex === idx ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: DOWNLOAD ZIP */}
          {activeTab === 'download' && (
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center">
                  <Download className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Télécharger l'Archive Complète du Projet</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                    Contient tous les fichiers sources React + Vite, les configs Capacitor, le dossier natif Android et le workflow GitHub Actions pour compiler l'APK.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleDownloadZip}
                    disabled={isDownloading}
                    className={`inline-flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg ${
                      isDownloading
                        ? 'bg-amber-500/50 text-slate-950 cursor-wait'
                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950 hover:shadow-amber-500/20'
                    }`}
                  >
                    {isDownloading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                        <span>Génération du fichier ZIP en cours...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Télécharger solarsnap-eclipse.zip</span>
                      </>
                    )}
                  </button>
                </div>

                {downloadSuccess && (
                  <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Archive ZIP téléchargée ! Extrayez-la et poussez-la sur votre dépôt GitHub.</span>
                  </div>
                )}
              </div>

              {/* Package Content Checklist */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs space-y-2">
                <div className="font-semibold text-slate-200">Fichiers inclus dans l'archive :</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">●</span>
                    <span><code className="text-slate-300">.github/workflows/build-apk.yml</code> (CI/CD)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">●</span>
                    <span><code className="text-slate-300">android/</code> (Projet natif Gradle + Manifest)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">●</span>
                    <span><code className="text-slate-300">capacitor.config.ts</code> (App ID & webDir)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">●</span>
                    <span><code className="text-slate-300">src/</code> (Code source caméra, chrono, IA)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">●</span>
                    <span><code className="text-slate-300">README.md</code> (Guide pas-à-pas en français)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">●</span>
                    <span><code className="text-slate-300">package.json</code> & <code className="text-slate-300">vite.config.ts</code></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: WORKFLOW */}
          {activeTab === 'workflow' && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 space-y-1">
                <div className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4" />
                  Comment fonctionne la compilation automatique sur GitHub ?
                </div>
                <p className="text-slate-400 text-[11px]">
                  Chaque fois que vous faites un <code className="text-slate-300">git push</code>, les serveurs Ubuntu de GitHub exécutent la recette suivante :
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2 text-xs">
                <div className="flex items-start gap-2.5">
                  <span className="bg-slate-800 text-amber-400 font-mono text-[10px] px-1.5 py-0.5 rounded font-bold">Étape 1</span>
                  <div className="text-slate-300">Installation de Node.js 20 et Java JDK 17 (Zulu).</div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="bg-slate-800 text-amber-400 font-mono text-[10px] px-1.5 py-0.5 rounded font-bold">Étape 2</span>
                  <div className="text-slate-300">Compilation de l'application web avec Vite (<code className="text-slate-400">npm run build</code>).</div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="bg-slate-800 text-amber-400 font-mono text-[10px] px-1.5 py-0.5 rounded font-bold">Étape 3</span>
                  <div className="text-slate-300">Synchronisation des assets web vers Android avec Capacitor (<code className="text-slate-400">npx cap sync android</code>).</div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="bg-slate-800 text-amber-400 font-mono text-[10px] px-1.5 py-0.5 rounded font-bold">Étape 4</span>
                  <div className="text-slate-300">Compilation du binaire APK avec Gradle (<code className="text-slate-400">./gradlew assembleDebug</code>).</div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="bg-emerald-900/60 text-emerald-400 font-mono text-[10px] px-1.5 py-0.5 rounded font-bold">Étape 5</span>
                  <div className="text-emerald-300 font-medium">Exportation directe du fichier <strong>SolarSnap-Eclipse-Camera.apk</strong> téléchargeable dans l'onglet GitHub Actions !</div>
                </div>
              </div>

              <div className="p-3 bg-blue-950/20 border border-blue-900/40 rounded-xl text-xs text-blue-300 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  Le workflow est stocké dans votre projet dans <code className="bg-blue-950 px-1 py-0.5 rounded font-mono">.github/workflows/build-apk.yml</code>. Vous pouvez aussi le lancer manuellement à tout moment depuis le bouton "Run workflow" sur GitHub.
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PWA DIRECT */}
          {activeTab === 'pwa' && (
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-white text-sm">Installer tout de suite comme WebAPK sur votre smartphone</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Pas envie d'attendre de pousser sur GitHub ? Android intègre la technologie <strong>WebAPK</strong> : ouvrez cette application sur votre téléphone Android dans Google Chrome, et installez-la directement comme une vraie application native !
                </p>

                <div className="p-3 bg-slate-900 rounded-lg text-xs space-y-2 border border-slate-800">
                  <div className="flex items-center gap-2 text-slate-200 font-medium">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold flex items-center justify-center">1</span>
                    <span>Ouvrez le lien de l'application sur Chrome mobile :</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800 font-mono text-[11px] text-amber-400 break-all select-all">
                    {window.location.origin}
                  </div>

                  <div className="flex items-center gap-2 text-slate-200 font-medium pt-1">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold flex items-center justify-center">2</span>
                    <span>Appuyez sur les trois points verticaux <code className="text-amber-400">⋮</code> en haut à droite.</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-200 font-medium">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold flex items-center justify-center">3</span>
                    <span>Sélectionnez <strong className="text-emerald-400">"Installer l'application"</strong> ou "Ajouter à l'écran d'accueil".</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500">
                  📱 L'application s'ouvrira en plein écran sans barre d'adresse navigateur, avec l'icône SolarSnap sur votre tiroir d'applications Android.
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Prêt pour GitHub & Android</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
