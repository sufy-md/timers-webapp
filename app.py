from bottle import Bottle, request, response, static_file, template

app = Bottle()

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

        pass

    return template("signup.html", error=None)

@app.route('/login', method=['POST', 'GET'])
def login():
    if request.method == 'POST':
        username = request.forms.get('username')
        password = request.forms.get('password')

        pass

    return template("login.html", error=None)

@app.route('/stopwatch')
def stopwatch():
    return template('stopwatch.html')

app.run(host='localhost', port=8080, debug=True)