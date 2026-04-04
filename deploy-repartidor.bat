@echo off
cd /d "c:\Users\Jorge G\AndroidStudioProjects\Prueba New\repartidor-web"
echo ========================================
echo  DESPLIEGUE A PRODUCCION - REPARTIDOR-WEB
echo ========================================
echo.
echo 1. Agregando cambios...
git add .
echo.
echo 2. Confirmando cambios...
git commit -m "unificar botones segun tipo de servicio restaurante gasolina motocicleta"
echo.
echo 3. Haciendo push a produccion...
git push origin master --force
echo.
echo ========================================
echo  DESPLIEGUE COMPLETADO!
echo ========================================
echo.
echo Los cambios estan en camino a Vercel.
echo El deploy automatico deberia completarse en 2-5 minutos.
echo.
pause
