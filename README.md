# ProductivityAgent-StarTime

- Run this app in 8080!
```bash
cd backend
python manage.py makemigrations
python manage.py migrate
python manage.py loaddata fixtures\categories.json
python manage.py collectstatic
python manage.py runserver 8080 / daphne -p 8080 backend.asgi:application
```

```bash
cd frontend
yarn
yarn run dev
```
    