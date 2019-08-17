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
import descriptiveComputation

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

@app.route('/getPie')
def getPie():
    attr = request.args.get('attr')
    dateFrom = request.args.get('dateFrom')
    dateUntil = request.args.get('dateUntil')
    dateFrom = descriptiveComputation.dateToStringFrom(dateFrom)
    dateUntil = descriptiveComputation.dateToStringUntil(dateUntil)
    cur = get_db().cursor()
    cur.execute('SELECT COUNT(object_id), '+attr+' FROM egos_contents WHERE object_live_from > "'+dateFrom+'" AND object_live_until < "'+dateUntil+'" GROUP BY '+attr)
    data = cur.fetchall()
    data = {dat[1]:dat[0] for dat in data}
    return jsonify(data)
@app.route('/getValueByTime')
def getValueByTime():
    attr = request.args.get('attr')
    dateFrom = request.args.get('dateFrom')
    dateUntil = request.args.get('dateUntil')
    dateFrom = descriptiveComputation.dateToStringFrom(dateFrom)
    dateUntil = descriptiveComputation.dateToStringUntil(dateUntil)
    cur = get_db().cursor()
    cur.execute('SELECT COUNT(object_id) AS counts, '+attr+' FROM egos_contents WHERE object_live_from > "'+dateFrom+'" AND object_live_from < "'+dateUntil+'" GROUP BY '+attr+' ORDER BY counts DESC LIMIT 15')
    data = cur.fetchall()
    data = {dat[1]:dat[0] for dat in data}
    return jsonify(data)

@app.route('/getLimitTimes')
def getLimitTimes():
    cur= get_db().cursor()
    cur.execute('SELECT MIN(object_live_from), MAX(object_live_until) FROM egos_contents')
    data = cur.fetchall()
    dateFrom = descriptiveComputation.stringToDateFrom(data[0][0])
    dateUntil = descriptiveComputation.stringToDateUntil(data[0][1])
    return jsonify({'min':dateFrom,'max':dateUntil})

@app.route('/getDescsStats')
def getDescsStats():
    provider =  {"object_provider":request.args.get('val1'),"category":request.args.get('val2'),"program_identifierstat":request.args.get('val3')}
    rep = request.args.get('rep')
    cur = get_db().cursor()
    print(provider)
    sql = 'SELECT DISTINCT '+rep+' FROM egos_contents WHERE '+rep+' IS NOT NULL'
    for cat in ["object_provider","category","program_identifierstat"]:
        if provider[cat] != 'All':
            sql = sql+' AND '+cat+' = "'+provider[cat]+'"'
    cur.execute(sql)
    data = cur.fetchall()
    stats = descriptiveComputation.descStats(data,provider,rep)
    return jsonify(stats)

@app.route('/getElements')
def getElements():
    cur= get_db().cursor()
    cur.execute('SELECT DISTINCT object_provider FROM egos_contents')
    data1 = cur.fetchall()
    cur.execute('SELECT DISTINCT category FROM egos_contents')
    data2 = cur.fetchall()
    cur.execute('SELECT DISTINCT program_identifierstat FROM egos_contents')
    data3 = cur.fetchall()
    data = {'object_provider':[dat[0] for dat in data1],'category':[dat[0] for dat in data2],'program_identifierstat':[dat[0] for dat in data3]}
    return jsonify(data)

@app.route('/getDescPie')
def getDescPie():
    rep = request.args.get('rep')
    attr = request.args.get('attr')
    value = {"object_provider":request.args.get('val1'),"category":request.args.get('val2'),"program_identifierstat":request.args.get('val3')}
    # dateFrom = request.args.get('dateFrom')
    # dateUntil = request.args.get('dateUntil')
    # dateFrom = descriptiveComputation.dateToStringFrom(dateFrom)
    # dateUntil = descriptiveComputation.dateToStringUntil(dateUntil)
    cur = get_db().cursor()
    sql1 = 'SELECT COUNT('+rep+'), COUNT(DISTINCT '+rep+') FROM egos_contents WHERE '+rep+' IS NOT NULL'
    sql2 = 'SELECT COUNT(*) FROM egos_contents WHERE '+rep+' IS NULL'
    for cat in ["object_provider","category","program_identifierstat"]:
        if value[cat] != "All":
            sql1 +=' AND '+cat+'="'+value[cat]+'"'
            sql2 +=' AND '+cat+'="'+value[cat]+'"'
    cur.execute(sql1)
    data = cur.fetchall()
    cur.execute(sql2)
    nulls = cur.fetchall()
    print(data)
    print(nulls)
    return jsonify({'Original':data[0][1],'Duplicates':data[0][0]-data[0][1],'NULL':nulls[0][0]})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
