@echo off
cd /d "c:\Users\Jorge G\AndroidStudioProjects\Prueba New\repartidor-web"

echo Eliminando variable antigua...
npx vercel env rm VITE_FIREBASE_DATABASE_URL production --yes

echo.
echo Agregando variable nueva...
echo https://proyecto-new-37f18-default-rtdb.firebaseio.com | npx vercel env add VITE_FIREBASE_DATABASE_URL production

echo.
echo Redesplegando...
npx vercel --prod --yes

echo.
echo Listo!
pause
