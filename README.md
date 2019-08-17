# DataVisMemoire
In this tutorial, we are going to show you how to download and lauch the different data visualization models built for our thesis.
## Prerequisities
* If you are using Linux or Mac OS, ignore this point. If you are using Windows 10, you need to install the Ubuntu shell for Windows (Open the Microsoft Store and search: Ubuntu). Once it is installed, open the shell, wait until the installation is finished and create user.
* If you don't have Python3, install it : open the shell and launch `sudo apt-get install python3 python3-pip` (you may need to launch `sudo apt-get update` first)
* You need to install flask : `sudo apt-get install python3-flask`
* You need to install some python libraries. If you didn't installed them yet, do it:
  * Flask : `pip3 install flask`
  * Numpy : `pip3 install numpy`
  * Sqlite3 : `pip3 install pysqlite3`
  * Enchant : `pip3 install pyenchant`
* You need an internet connection to run the programs
## Download and installation
1. Open a shell and clone this repository : `git clone https://github.com/raphraph1996/DataVisMemoire` (you need to use the login and password given in the appendix B).
2. Enter the DataVisMemoire folder (`cd DataVisMemoire`) and launch the install script (`bash install.sh`).
## Launching a model
Now you can launch visualisation model by opening a shell, going to the location of the DataVisMemoire folder and typing `bash dataVis.sh <arg>`. arg is set to 1 if you want to use the First Visualisation model, 2 if you want to use the TreeMap model and 3 if you want to use the Results model.
Once the program is launched, you can access to the model by opening a navigation browser and going to http://127.0.0.1:5000
