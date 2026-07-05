from flask import Flask, render_template, jsonify, send_from_directory, request, Response, redirect, url_for, session
import csv
import random
import os
import requests
from functools import wraps
import urllib.parse

app = Flask(__name__)
#app.secret_key = os.environ.get('', '')

basedir = os.path.abspath(os.path.dirname(__file__))
csv_path = os.path.join(basedir, 'database', 'data.csv')

# ----- CRM конфиг
STREAMLIT_URL = 'http://localhost:8501'
CRM_USERS = {
    'admin': 'password',
    'manager': 'password'
}

collections_colors = {
    "Exlibris": "#DCC796",
    "All Hallows Eve": "#D6804E",
    "Zodiac": "#A9CEE0",
    "Lucky items": "#AAD77D",
    "Alchimia": "#B09EC7",
    "Baby dream": "#F5C2CB",
    "Futurism": "#B7C7C7",
    "Amore": "#D06068",
    "Beast": "#B6907A"
}

def CRM_auth_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get('crm_logged_in'):
            return redirect(url_for('crm_login'))
        return f(*args, **kwargs)
    return decorated


def read_products_from_csv():
    products = []
    with open(csv_path, mode='r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            products.append(row)
    return products

def get_product_images(sku):
    # Преобразуем артикул в 4-значную строку (например, 1 -> "0001", 78 -> "0078", 100 -> "0100")
    file_sku = str(int(sku)).zfill(4)
    
    img_dir = os.path.join('static', 'img', file_sku)
    if not os.path.exists(img_dir):
        return []

    images = []

    main_img = f"{file_sku}-main.webp"
    if os.path.isfile(os.path.join(img_dir, main_img)):
        images.append(main_img)

    for i in range(1, 10):
        filename = f"{file_sku}_{i}.webp"
        if os.path.isfile(os.path.join(img_dir, filename)):
            images.append(filename)

    return images

def get_product_by_sku(sku):
    try:
        with open(csv_path, 'r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                if row['sku'] == sku:
                    return row
        return None
    except FileNotFoundError:
        return {'error': 'CSV file not found'}
    except Exception as e:
        return {'error': str(e)}

def get_products_by_collection(collection):
    products = read_products_from_csv()
    if collection:
        return [p for p in products if p.get('collection') == collection]
    return products


# ----- Routes
@app.route('/')
def show_products():
    products = read_products_from_csv()
    random.shuffle(products)
    return render_template('products.html', products=products, collections_colors=collections_colors)

@app.route('/card')
def show_card():
    return render_template('card.html', product=get_product_by_sku("0052"), collections_colors=collections_colors)

@app.route('/api/products')
def api_products():
    collection = request.args.get('collection')
    products = get_products_by_collection(collection) if collection else read_products_from_csv()
    return jsonify(products)

@app.route('/api/product-card/<sku>')
def get_product_card(sku):
    product = get_product_by_sku(sku)
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    img_list = get_product_images(sku)
    return render_template('card.html', product=product, collections_colors=collections_colors, img_list=img_list)

@app.route('/api/product/<product_id>')
def get_product_by_id(product_id):
    try:
        with open(csv_path, 'r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                if row['sku'] == product_id:
                    return jsonify(row)
        return jsonify({'error': 'Product not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)})


# ----- Primal Spirit (интерактивный тест для другой коллекции)
@app.route('/primalspirit')
def show_PS_test():
    return send_from_directory('PRIMALSPIRIT', 'index.html')

@app.route('/PRIMALSPIRIT/<path:filename>')
def serve_primal_files(filename):
    return send_from_directory('PRIMALSPIRIT', filename)

@app.route('/PRIMALSPIRIT/')
def serve_primal_index():
    return send_from_directory('PRIMALSPIRIT', 'index.html')


# ----- Primal Spirit CRM
@app.route('/primalspirit/crm/login', methods=['GET', 'POST'])
def crm_login():
    if request.method == 'POST':
        username = request.form.get('username', '')
        password = request.form.get('password', '')
        
        if username in CRM_USERS and CRM_USERS[username] == password:
            session['crm_logged_in'] = True
            session['crm_username'] = username
            return redirect(url_for('crm_proxy'))
        else:
            return render_template('crm_login.html', error="Неверный логин или пароль")
    
    if session.get('crm_logged_in'):
        return redirect(url_for('crm_proxy'))
    
    return render_template('crm_login.html', error=None)

@app.route('/primalspirit/crm/logout')
def crm_logout():
    session.pop('crm_logged_in', None)
    session.pop('crm_username', None)
    return redirect(url_for('crm_login'))

@app.route('/primalspirit/crm', defaults={'path': ''})
@app.route('/primalspirit/crm/', defaults={'path': ''})
@app.route('/primalspirit/crm/<path:path>')
@CRM_auth_required

# ----- Прокси запросов к Streamlit CRM
def crm_proxy(path=''):
    if path.startswith('login') or path.startswith('logout'):
        return redirect(url_for('crm_proxy'))
    
    target_url = f'http://127.0.0.1:8501/{path}'
    
    if request.query_string:
        target_url += f'?{request.query_string.decode()}'
    
    try:
        resp = requests.request(
            method=request.method,
            url=target_url,
            headers={
                'User-Agent': request.headers.get('User-Agent', ''),
                'Accept': request.headers.get('Accept', '*/*'),
                'Accept-Language': request.headers.get('Accept-Language', ''),
            },
            data=request.get_data() if request.method == 'POST' else None,
            allow_redirects=True,
            timeout=30
        )
        
        content = resp.content
        content_type = resp.headers.get('content-type', 'text/html')
        
        if 'text/html' in content_type:
            base_href = '/primalspirit/crm/'
            
            if b'<base' in content:
                import re
                content = re.sub(
                    b'<base[^>]*href="[^"]*"[^>]*>',
                    f'<base href="{base_href}">'.encode(),
                    content
                )
            elif b'<head>' in content:
                content = content.replace(
                    b'<head>',
                    f'<head><base href="{base_href}">'.encode()
                )
        
        response = Response(content, resp.status_code)
        response.headers['Content-Type'] = content_type
        
        if 'cache-control' in resp.headers:
            response.headers['Cache-Control'] = resp.headers['cache-control']
        
        return response
        
    except requests.exceptions.ConnectionError:
        return """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>CRM недоступна</title>
            <style>
                body { font-family: Arial; text-align: center; padding: 50px; background: #f0f0f0; }
                .box { background: white; padding: 40px; border-radius: 15px; display: inline-block; box-shadow: 0 2px 20px rgba(0,0,0,0.1); }
                h1 { color: #e74c3c; margin-bottom: 10px; }
                a { color: #3498db; text-decoration: none; margin: 0 10px; }
                a:hover { text-decoration: underline; }
            </style>
        </head>
        <body>
            <div class="box">
                <h1>🔧 CRM временно недоступна</h1>
                <p>Streamlit сервер не отвечает на порту 8501</p>
                <p style="color: #999;">Проверьте: systemctl status fb-crm.service</p>
                <p>
                    <a href="/primalspirit/crm/"> =( Попробовать снова</a>
                    <a href="/primalspirit/">← На сайт</a>
                </p>
            </div>
        </body>
        </html>
        """, 503
    except Exception as e:
        return f"<h1>Ошибка: {str(e)}</h1>", 500

# ----- Статика для Streamlit
@app.route('/primalspirit/crm/static/<path:filename>')
@CRM_auth_required
def crm_static_proxy(filename):
    try:
        resp = requests.get(
            f'http://127.0.0.1:8501/static/{filename}',
            timeout=10
        )
        return Response(
            resp.content, 
            resp.status_code,
            content_type=resp.headers.get('content-type', 'application/octet-stream')
        )
    except:
        return "", 404

@app.route('/primalspirit/crm/_stcore/<path:filename>')
@CRM_auth_required
def crm_stcore_proxy(filename):
    """Прокси для _stcore файлов"""
    try:
        resp = requests.get(
            f'http://127.0.0.1:8501/_stcore/{filename}',
            timeout=10
        )
        return Response(
            resp.content,
            resp.status_code,
            content_type=resp.headers.get('content-type', 'application/octet-stream')
        )
    except:
        return "", 404

@app.route('/primalspirit/crm/healthz')
@CRM_auth_required
def crm_health():
    return "OK", 200



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)