set VERNUM=1b2
cd ..\..
git clone -b dist front-end-testing\.git front-end-testing.dist\

rmdir front-end-testing.dist\htmlvalidator /s /q
mkdir front-end-testing.dist\htmlvalidator

copy front-end-testing\htmlvalidator\*.js front-end-testing.dist\htmlvalidator\
copy front-end-testing\htmlvalidator\*.json front-end-testing.dist\htmlvalidator\

copy front-end-testing\htmlvalidator\run*.bat front-end-testing.dist\htmlvalidator\

copy front-end-testing\htmlvalidator\js.jar front-end-testing.dist\htmlvalidator\
call lib\Rivet\Rivet.Console.exe front-end-testing.dist\htmlvalidator\ -v:VERSION_NUMBER=%VERNUM% -v:RELEASED="%DATE%-%TIME%"

cd front-end-testing.dist
git add .
git commit -am "release %VERNUM%"
git push

pause
