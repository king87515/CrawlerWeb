@echo off

rem 每天自動備份整個數據庫，保存七天的壓縮包，刪除七天之前的數據。

cd "C:\Program Files\MongoDB\Server\4.2\bin"

mongodump -d "ITRI_InvestTool" -o "C:\Program Files\MongoDB\dump\dump\ITRI_InvestTool"

"C:\Program Files\7-Zip\7z.exe" a "C:\Program Files\MongoDB\dump\"%date:~0,4%-%date:~5,2%-%date:~8,2%.7z  "C:\Program Files\MongoDB\dump\dump\ITRI_InvestTool"

Forfiles /p "C:\Program Files\MongoDB\dump\" /s /d -30 /m *.* /c "cmd /c del /q /f @path"