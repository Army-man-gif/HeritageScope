# temp-python-backend

Minimal mock backend for area highlight API (no database required).

## Start

```powershell
cd "c:\Users\GY\Documents\GitHub\HeritageScope\digital-dream-team\temp-python-backend"
python .\server.py
```

Default address is `http://127.0.0.1:8080`.

If port `8080` is occupied:

```powershell
$env:PORT="8090"; python .\server.py
```

Then set frontend backend base before app scripts run:

```html
<script>
  globalThis.HS_BACKEND_BASE_URL = 'http://127.0.0.1:8090';
</script>
```

## Endpoints

- `GET /api/areas/{id}`: returns polygon JSON when id exists, else 404
- `GET /api/areas/by-marker?latitude=...&longitude=...`: returns polygon JSON when marker is known, else 404
- `GET /health`: quick health check
