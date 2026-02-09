# file: app.py
from flask import Flask, request, render_template_string
from duckduckgo_search import DDGS

app = Flask(__name__)

# 1. The Frontend: A simple search box
HOME_HTML = """
<!DOCTYPE html>
<html>
<head><title>Private Search</title></head>
<body style="font-family: sans-serif; max-width: 600px; margin: 50px auto; text-align: center;">
    <h1>🕵️ Private Search</h1>
    <form action="/search" method="POST">
        <input type="text" name="q" placeholder="Search privately..." style="padding: 10px; width: 70%;" required>
        <button type="submit" style="padding: 10px;">Search</button>
    </form>
</body>
</html>
"""

# 2. The Results Page Template
RESULTS_HTML = """
<!DOCTYPE html>
<html>
<head><title>Results for {{ query }}</title></head>
<body style="font-family: sans-serif; max-width: 800px; margin: 20px auto; padding: 20px;">
    <a href="/">&larr; Back</a>
    <h2>Results for "{{ query }}"</h2>
    {% for result in results %}
        <div style="margin-bottom: 20px;">
            <a href="{{ result.href }}" style="font-size: 18px; text-decoration: none; color: #1a0dab;">{{ result.title }}</a>
            <div style="color: #006621; font-size: 14px;">{{ result.href }}</div>
            <div style="color: #545454;">{{ result.body }}</div>
        </div>
    {% endfor %}
</body>
</html>
"""

@app.route('/', methods=['GET'])
def home():
    return render_template_string(HOME_HTML)

@app.route('/search', methods=['POST'])
def search():
    query = request.form.get('q')
    results = []
    # 3. The Privacy Mechanism: Request data from the SERVER, not the client.
    # This hides your IP. The upstream provider sees the Railway Server IP.
    with DDGS() as ddgs:
        # Using DuckDuckGo backend as it is scraper-friendly for personal use
        # To clone Startpage exactly, you would need a Google Search API Key here
        for r in ddgs.text(query, max_results=10):
            results.append(r)
            
    return render_template_string(RESULTS_HTML, query=query, results=results)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
