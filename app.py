from bottle import Bottle, redirect, request, response, run, static_file, template
from beaker.middleware import SessionMiddleware
from db.sql_helper import helper

import os
os.environ['BEAKER_SESSION'] = '1'

session_opts = {
    'session.type': 'file',
    'session.auto': True,
    'session.data_dir': './sessions'
}

app = Bottle()
session_app = SessionMiddleware(app, session_opts)

@app.route('/')
def hello():
    return '''Hi'''

@app.route('/static/<file>')
def serve_static(file):
    return static_file(file, root='./static')

@app.route('/signup', method=['POST', 'GET'])
def signup():
    if request.method == 'POST':
        username = request.forms.get('username')
        password = request.forms.get('password')

        status = helper(username, password).signup()
        if (not status):
            return template("signup.html", display='flex')
        
        redirect('/login')

    return template("signup.html", display='none')

@app.route('/login', method=['POST', 'GET'])
def login():
    print("keys: ", request.environ.keys())
    session = request.environ.get('beaker.session')

    if request.method == 'POST':
        username = request.forms.get('username')
        password = request.forms.get('password')

        status = helper(username, password).login()
        if (not status):
            return template("login.html", display='flex')
        
        session['user'] = username
        session['user_id'] = status
        session.save()
        redirect('/stopwatch')

    return template("login.html", display='none')

@app.route('/stopwatch')
def stopwatch():
    session = request.environ.get('beaker.session')
    if not session or 'user' not in session:
        redirect('/login')
    
    return template('stopwatch.html', user=session['user'])

run(session_app, host='localhost', port=8080, debug=True)