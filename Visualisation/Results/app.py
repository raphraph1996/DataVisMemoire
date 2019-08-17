from __future__ import print_function
from flask import Flask, render_template, make_response
from flask import redirect, request, jsonify, url_for
from flask import g

import io
import os
import uuid
import numpy as np
import sqlite3
import ApiExceptions
import json

app = Flask(__name__)
app.secret_key = 's3cr3t'
app.debug = True
app._static_folder = os.path.abspath("static/")

@app.errorhandler(ApiExceptions.InvalidUsage)
def handle_invalid_usage(error):
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect("../Database.db")
        #db = g._database = mysql.connector.connect(host="localhost",user="root",password="password",database="app")
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
