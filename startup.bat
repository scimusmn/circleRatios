del /s /q "C:\Users\exhibits\chromeData_temp"
xcopy /Y /E /I /H "C:\Users\exhibits\chromeData" "C:\Users\exhibits\chromeData_temp\"

ping -n 20 127.0.0.1

start chrome --user-data-dir="C:\Users\exhibits\chromeData_temp" --kiosk "https://localhost/movieRatios/index.html"