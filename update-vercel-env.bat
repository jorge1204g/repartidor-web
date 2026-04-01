@echo off
cd /d "c:\Users\Jorge G\AndroidStudioProjects\Prueba New\cliente-web"

echo AIzaSyDT6lLWCT2pzns4LR_tCy-vafyVoBSe3jo | npx vercel env add VITE_FIREBASE_API_KEY production
echo proyecto-new-37f18.firebaseapp.com | npx vercel env add VITE_FIREBASE_AUTH_DOMAIN production
echo https://proyecto-new-37f18-default-rtdb.firebaseio.com | npx vercel env add VITE_FIREBASE_DATABASE_URL production
echo proyecto-new-37f18 | npx vercel env add VITE_FIREBASE_PROJECT_ID production
echo proyecto-new-37f18.firebasestorage.app | npx vercel env add VITE_FIREBASE_STORAGE_BUCKET production
echo 253121042757 | npx vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID production
echo 1:253121042757:web:92654439c7cc02b08b862c | npx vercel env add VITE_FIREBASE_APP_ID production
echo AIzaSyCjqlvk5RqykmtVyjYwe6vF0QWxZ9RFRYE | npx vercel env add VITE_GOOGLE_MAPS_API_KEY production

echo ✅ Variables actualizadas para cliente-web
echo ✅ Firebase: Configurado correctamente
echo ✅ Google Maps API: Agregada correctamente
pause
