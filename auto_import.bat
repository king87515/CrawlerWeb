@echo off

cd "C:\Program Files\MongoDB\Server\4.2\bin"

mongo ITRI_InvestTool --eval "db.dropDatabase()"

mongorestore -d ITRI_InvestTool "C:\Program Files\MongoDB\dump\dump\ITRI_InvestTool"