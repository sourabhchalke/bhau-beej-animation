# Bhau Beej Animation — Windows setup

## Requirements
- Windows 10/11 (64-bit)
- Node.js 20.19+ (recommended: Node.js 22.12+)
- npm (included with Node.js)

Check versions in PowerShell:
```powershell
node -v
npm -v
```

## Clean install (PowerShell)
Run these commands from the folder containing `package.json`:
```powershell
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
npm cache verify
npm install --include=optional
npm run build
npm run dev
```

Open the local URL printed by Vite (usually http://localhost:5173).

## If you see a Rollup Windows native-module error
This project explicitly declares the Windows x64 MSVC Rollup optional package to avoid npm omitting the platform binary in some lockfile/install situations. Use the clean-install commands above; do not download DLLs or executables from third-party sites.

If `npm install` fails with a network/registry error, check your connection and retry. Do not delete `package-lock.json`; it pins the dependency versions for repeatable installs.

## Production preview
After a successful build:
```powershell
npm run preview
```
