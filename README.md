# ProductivityAgent-StarTime

- Run this app in 8080!
```bash
cd backend
python manage.py makemigrations
python manage.py migrate
python manage.py collectstatic
python manage.py runserver 8080 / daphne -p 8080 backend.asgi:application / daphne 0.0.0.0:$PORT backend.asgi:application (for deployment)
```

```bash
cd ai
uvicorn src.main:backend_app --reload --env-file .env
```

```bash
cd frontend
yarn
yarn run dev
```
