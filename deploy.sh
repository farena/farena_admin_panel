#!/usr/bin/env bash
set -euo pipefail

# Deploy en produccion: instala dependencias, prepara las variables de
# entorno y genera la carpeta dist/ que luego se sirve desde Apache o Nginx.

cd "$(dirname "${BASH_SOURCE[0]}")"

echo "==> Instalando dependencias (npm ci)"
npm ci

if [ ! -f .env.local ]; then
  echo "==> Creando .env.local a partir de .env.example"
  cp .env.example .env.local
  echo "    Completa las variables de entorno en .env.local antes de volver a deployar."
fi

echo "==> Compilando proyecto para produccion"
npm run build

echo "==> Build generado en ./dist"
