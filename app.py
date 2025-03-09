from bottle import Bottle, redirect, request, response, run, static_file, template
from beaker.middleware import SessionMiddleware
from db.sql_helper import auth_helper, helper

import json
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

        status = auth_helper(username, password).signup()
        if (not status):
            return template("signup.html", display='flex')
        
        redirect('/login')

    return template("signup.html", display='none')

@app.route('/login', method=['POST', 'GET'])
def login():
    print("keys: ", request.environ.keys())
    session = request.environ.get('beaker.session')

    if 'user' in session:
        redirect('/stopwatch')

    if request.method == 'POST':
        username = request.forms.get('username')
        password = request.forms.get('password')

        status = auth_helper(username, password).login()
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

@app.route('/get-categories', method=['POST'])
def get_categories():
    session = request.environ.get('beaker.session')
    user_id = session['user_id']

    categories = helper(user_id).fetch_categories()
    response.content_type = 'application/json'
    return json.dumps(categories)

@app.route('/create-watch', method=['POST'])
def create_watch():
    session = request.environ.get('beaker.session')
    user_id = session['user_id']

    data = request.json
    watch_name = data.get('name').strip()
    cat = data.get('category_id')
    subcat = data.get('subcategory_id') or None

    parent_id = subcat if subcat else cat
    create = helper(user_id).create_watch(parent_id, watch_name)

    if (not create):
        return "Error - Duplicate", 409
    
    return "Success", 201

@app.route('/create-category', method=['POST'])
def create_category():
    user_id = request.environ.get('beaker.session')['user_id']

    data = request.json
    cat_name = data.get('name').strip()
    parent = data.get('parent')
    parent = parent if parent != "null" else None

    create = helper(user_id).create_category(parent, cat_name)

    return "Success", 201

@app.route('/save-time', method=['POST'])
def save_time():
    user_id = request.environ.get('beaker.session')['user_id']

    data = request.json
    watch_id = data.get('watch')
    time = int(data.get('time'))

    add_time = helper(user_id).add_time(watch_id, time)

    if (add_time): return "Success", 201
    return "Failed", 500

@app.route('/dashboard')
def dashboard():
    try:
        x = request.environ.get('beaker.session')
        user, user_id = x['user'], x['user_id']
    except:
        redirect('/login')
    
    return template('dashboard.html', user=user)

run(session_app, host='localhost', port=8080, debug=True)