import urllib.request
import urllib.error
import json

url = 'http://localhost:8000/api/auth/login'
test_users = [
    ('scarrasquel', 'said1234'),
    ('linfante', 'aa11..**'),
    ('scarrasquel@restauracion.org', 'said1234'),
    ('linfante@restauracion.org', 'aa11..**')
]

for identifier, password in test_users:
    payload = json.dumps({'email': identifier, 'password': password}).encode('utf-8')
    req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            user = data.get('user', {})
            print(f"[EXITO] {identifier} -> ID: {user.get('id')}, Rol: {user.get('role')}, MustChangePass: {data.get('must_change_password')}")
    except urllib.error.HTTPError as e:
        print(f"[ERROR] {identifier} -> Status {e.code}: {e.read().decode('utf-8')}")
