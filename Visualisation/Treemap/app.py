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

@app.route('/getSpecific')
def getSpecific():
    cur = get_db().cursor()
    cur.execute('SELECT DISTINCT object_provider FROM egos_contents')
    data = cur.fetchall()
    with open('stats.json','r') as input:
        stats = json.load(input)
    input.close()
    date = {'name':'Object Providers','rate':0.03,'children':[]}
    for i,dat in enumerate(data):
        cur.execute('SELECT COUNT(object_desc), COUNT(DISTINCT object_desc) FROM egos_contents WHERE object_desc IS NOT NULL AND object_provider ="'+dat[0]+'"')
        dot = cur.fetchall()
        cur.execute('SELECT COUNT(*) FROM egos_contents WHERE object_desc IS NULL AND object_provider ="'+dat[0]+'"')
        nulls = cur.fetchall()
        cur.execute('SELECT COUNT(*) as C, object_desc FROM egos_contents WHERE object_desc IS NOT NULL GROUP BY object_desc HAVING c>1')
        doubles= cur.fetchall()

        temp = {'Original':dot[0][1],'Duplicates':dot[0][0]-dot[0][1],'NULL':nulls[0][0]}
        date['children'].append({'name':dat[0],'rate':stats['object_desc'][dat[0]]['size'],'children':[]})
        for j,tp in enumerate(['Original','Duplicates','NULL']):
            if tp == 'Original':
                date['children'][i]['children'].append({'name':tp,'rate':stats['object_desc'][dat[0]]['size'],'children':[]})
                for tp2 in ['English','French','Dutch','Other']:
                    date['children'][i]['children'][j]['children'].append({'name':tp2,'rate':stats['object_desc'][dat[0]]['size'],'value':temp[tp]*stats['object_desc'][dat[0]][tp2]})
            elif tp == 'Duplicates':
                le = computeDuplicateLength(doubles)
                date['children'][i]['children'].append({'name':tp,'rate':le,'children':[{'name':tp,'rate':le,'value':temp[tp]}]})
            else:
                date['children'][i]['children'].append({'name':tp,'rate':0,'children':[{'name':tp,'rate':0,'value':temp[tp]}]})

    with open('treemap.json','w') as output:
        json.dump(date, output,indent=1)
    output.close()
    return jsonify(date)

def computeDuplicateLength(doubles):
    totSize=0
    tot = 0
    for dat in doubles:
        totSize += len(dat[1].split())*(dat[0]-1)
        tot += dat[0]-1
    return totSize/tot


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
