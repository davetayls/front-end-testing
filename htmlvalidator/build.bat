cd ..
rmdir htmlvalidator-dist /s /q
mkdir htmlvalidator-dist

copy htmlvalidator\*.js htmlvalidator-dist\
copy htmlvalidator\*.json htmlvalidator-dist\

copy htmlvalidator\run*.bat htmlvalidator-dist\

copy htmlvalidator\js.jar htmlvalidator-dist\
call lib\Rivet\Rivet.Console.exe htmlvalidator-dist\ -v:VERSION_NUMBER=1b1 -v:RELEASED="%DATE%-%TIME%"

pause
