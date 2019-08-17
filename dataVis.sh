#!/bin/bash
if [ $1 -eq 1 ]
then
	cd Visualisation/Visualisation
	FLASK_APP=app.py FLASK_DEBUG=1 flask run
elif [ $1 -eq 2 ]
then
	cd Visualisation/Treemap
	FLASK_APP=app.py FLASK_DEBUG=1 flask run
elif [ $1 -eq 3 ]
then
	cd Visualisation/Results
	FLASK_APP=app.py FLASK_DEBUG=1 flask run
else
	echo "Please choose between model 1, 2 or 3"
fi
