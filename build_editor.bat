@echo off
echo Building AMT Database Editor...
python -m PyInstaller --onefile --windowed --name "AMT_Database_Editor" --distpath "." --workpath "build_tmp" --specpath "build_tmp" db_editor.py
if exist build_tmp rmdir /s /q build_tmp
echo.
echo Done! AMT_Database_Editor.exe is ready.
pause
