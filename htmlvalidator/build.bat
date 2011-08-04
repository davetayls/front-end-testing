set VERNUM=1b2
cd ..
rmdir htmlvalidator-dist /s /q
mkdir htmlvalidator-dist

copy htmlvalidator\*.js htmlvalidator-dist\
copy htmlvalidator\*.json htmlvalidator-dist\

copy htmlvalidator\run*.bat htmlvalidator-dist\

copy htmlvalidator\js.jar htmlvalidator-dist\
call lib\Rivet\Rivet.Console.exe htmlvalidator-dist\ -v:VERSION_NUMBER=%VERNUM% -v:RELEASED="%DATE%-%TIME%"

git checkout dist
rmdir htmlvalidator
rename htmlvalidator-dist htmlvalidator
git add .
git commit -am "release %VERNUM%"
git push
git checkout master

pause
