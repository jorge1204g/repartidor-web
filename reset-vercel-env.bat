@echo off
cd /d "c:\Users\Jorge G\AndroidStudioProjects\Prueba New\cliente-web"

echo Eliminando variables antiguas...
npx vercel env rm VITE_FIREBASE_API_KEY production --yes
npx vercel env rm VITE_FIREBASE_AUTH_DOMAIN production --yes
npx vercel env rm VITE_FIREBASE_DATABASE_URL production --yes
npx vercel env rm VITE_FIREBASE_PROJECT_ID production --yes
npx vercel env rm VITE_FIREBASE_STORAGE_BUCKET production --yes
npx vercel env rm VITE_FIREBASE_MESSAGING_SENDER_ID production --yes
npx vercel env rm VITE_FIREBASE_APP_ID production --yes

echo.
echo Agregando variables nuevas...
echo AIzaSyDT6lLWCT2pzns4LR_tCy-vafyVoBSe3jo | npx vercel env add VITE_FIREBASE_API_KEY production
echo proyecto-new-37f18.firebaseapp.com | npx vercel env add VITE_FIREBASE_AUTH_DOMAIN production
echo https://proyecto-new-37f18-default-rtdb.firebaseio.com | npx vercel env add VITE_FIREBASE_DATABASE_URL production
echo proyecto-new-37f18 | npx vercel env add VITE_FIREBASE_PROJECT_ID production
echo proyecto-new-37f18.firebasestorage.app | npx vercel env add VITE_FIREBASE_STORAGE_BUCKET production
echo 253121042757 | npx vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID production
echo 1:253121042757:web:92654439c7cc02b08b862c | npx vercel env add VITE_FIREBASE_APP_ID production

echo.
echo Redesplegando...
npx vercel --prod --yes

echo.
echo Listo!
pause
