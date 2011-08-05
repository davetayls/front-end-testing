set VERNUM=1b3
cd ..\..
call git clone -b dist front-end-testing\.git front-end-testing.dist\

rmdir front-end-testing.dist\htmlvalidator /s /q
mkdir front-end-testing.dist\htmlvalidator

copy front-end-testing\htmlvalidator\*.js front-end-testing.dist\htmlvalidator\
copy front-end-testing\htmlvalidator\*.json front-end-testing.dist\htmlvalidator\

copy front-end-testing\htmlvalidator\run*.bat front-end-testing.dist\htmlvalidator\

copy front-end-testing\htmlvalidator\js.jar front-end-testing.dist\htmlvalidator\
call front-end-testing\lib\Rivet\Rivet.Console.exe front-end-testing.dist\htmlvalidator\ -v:VERSION_NUMBER=%VERNUM% -v:RELEASED="%DATE%-%TIME%"

cd front-end-testing.dist
call git add .
call git tag %VERNUM%
call git commit -am "release %VERNUM%"
call git push --tags

cd ..
rmdir front-end-testing.dist /s /q

cd front-end-testing

pause
