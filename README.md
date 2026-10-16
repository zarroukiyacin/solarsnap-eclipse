# 🌒 SolarSnap Eclipse Camera & Assistant - Android APK & GitHub Guide

Application mobile & web dédiée à la photographie d'éclipses solaires (filtre solaire physique SolarSnap, simulateur, calculateur d'exposition astronomique, compas d'alignement et assistant IA).

Ce projet est pré-configuré avec **Capacitor** et **GitHub Actions** pour compiler automatiquement le fichier `.apk` installable sur n'importe quel smartphone Android sans nécessiter d'installer Android Studio sur votre ordinateur !

---

## 🚀 Comment mettre ce projet sur GitHub et générer votre .APK

### Étape 1 : Créer un nouveau dépôt sur GitHub
1. Connectez-vous sur votre compte [GitHub.com](https://github.com).
2. Cliquez sur le bouton vert **"New"** (Nouveau dépôt).
3. Nommez votre dépôt (par exemple `solarsnap-eclipse`).
4. Laissez-le en **Public** (ou Privé) et **ne cochez pas** "Initialize with README" (le projet en contient déjà un).
5. Cliquez sur **"Create repository"**.

---

### Étape 2 : Envoyer le code sur GitHub
Dans votre terminal (ou depuis le dossier extrait du projet) :

```bash
# 1. Initialiser le dépôt local
git init

# 2. Ajouter tous les fichiers
git add .

# 3. Créer le premier commit
git commit -m "Feat: Initial commit SolarSnap Eclipse Camera with Capacitor & APK build"

# 4. Définir la branche principale sur main
git branch -M main

# 5. Lier votre dépôt GitHub (remplacez par votre pseudo et nom de dépôt)
git remote add origin https://github.com/VOTRE_PSEUDO/solarsnap-eclipse.git

# 6. Pousser les fichiers vers GitHub
git push -u origin main
```

---

### Étape 3 : Récupérer votre fichier .APK généré automatiquement ! 🎉
Grâce au workflow inclus dans `.github/workflows/build-apk.yml` :

1. Ouvrez votre dépôt sur GitHub.
2. Cliquez sur l'onglet **Actions** en haut de la page.
3. Vous verrez le workflow **"📱 Compiler le fichier APK Android"** en train de tourner.
4. Dès qu'il est terminé (environ 2 à 3 minutes, coche verte ✅) :
   - Cliquez sur l'exécution du workflow.
   - Faites défiler vers le bas jusqu'à la section **Artifacts**.
   - Cliquez sur **`SolarSnap-Eclipse-Android-APK`** pour télécharger votre fichier `.apk` !
5. Transférez le `.apk` sur votre téléphone Android (via WhatsApp, Google Drive, câble USB ou email), ouvrez-le et appuyez sur **Installer**.

> 💡 **Remarque Android** : Lors de la première installation d'un fichier APK, Android vous demandera d'autoriser l'installation depuis cette source (Sécurité / Sources inconnues). Acceptez pour installer l'application.

---

## 💻 Option alternative : Compiler localement avec Android Studio

Si vous avez Android Studio installé sur votre machine :

```bash
# 1. Installer les dépendances
npm install

# 2. Compiler le code Web et synchroniser avec Android
npm run build:apk

# 3. Ouvrir dans Android Studio
npx cap open android
```
Dans Android Studio :
- Allez dans **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
- Le fichier se trouvera dans `android/app/build/outputs/apk/debug/app-debug.apk`.

---

## 🌐 Option alternative : Utiliser comme PWA (WebAPK)
L'application est également une Progressive Web App (PWA). Sur votre smartphone Android :
1. Ouvrez l'URL de l'application dans Chrome.
2. Appuyez sur les 3 points en haut à droite `⋮`.
3. Cliquez sur **"Installer l'application"** ou **"Ajouter à l'écran d'accueil"**.
4. Android créera une WebAPK native avec icône dédiée sur votre écran d'accueil.

---

## 🛠️ Scripts disponibles dans le projet

| Commande | Action |
|---|---|
| `npm run dev` | Lance le serveur de développement local |
| `npm run build` | Compile l'application Web et le serveur |
| `npm run build:apk` | Compile l'app Web et synchronise avec le projet Android |
| `npm run cap:sync` | Synchronise les assets web vers Android |
| `npm run cap:open` | Ouvre le projet dans Android Studio |

---

## 📱 Permissions incluses dans l'APK Android
- `android.permission.CAMERA` : Accès caméra pour visée et captures de l'éclipse.
- `android.permission.FLASHLIGHT` : Contrôle torche / flash.
- `android.permission.ACCESS_FINE_LOCATION` : Calcul astronomique de la position du soleil et horaires d'éclipse.
- `android.permission.WRITE_EXTERNAL_STORAGE` / `READ_MEDIA_IMAGES` : Sauvegarde des photos dans la galerie.
