
from flask import Flask, url_for, render_template
app = Flask(__name__)

@app.route('/')
def render_welcomepage():
    return render_template("welcome.html")

@app.route('/home')
def render_homepage():
	return render_template('layout.html')

@app.route('/jardin-secret')
@app.route('/deauville')
def render_section():
	return render_template("layout.html")

if __name__ == '__main__':

    app.run()
