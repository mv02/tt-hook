@echo off
(
    echo @echo off
    echo cd %~dp0..
    echo node .
    echo pause
) > launcher.bat

set script="%temp%\%random%-%random%-%random%-%random%.vbs"
set assets=%~dp0

echo Set oWS = WScript.CreateObject("WScript.Shell") >> %script%
echo sLinkFile = oWS.SpecialFolders("Desktop") + "\TT Hook.lnk" >> %script%
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> %script%
echo oLink.TargetPath = "%assets%..\launcher.bat" >> %script%
echo oLink.IconLocation = "%assets%tycoon_logo_old.ico" >> %script%
echo oLink.Save >> %script%

cscript /nologo %script%
del %script%