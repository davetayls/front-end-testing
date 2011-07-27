rmdir dist /s /q
mkdir dist
copy *.js dist\
copy run.bat dist\
call ..\lib\Rivet\Rivet.Console.exe dist
java -jar ..\lib\compiler\compiler.jar --js dist\htmlvalidator.js --js_output_file dist\htmlvalidator.min.js
pause
