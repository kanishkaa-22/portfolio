# Kanishkaa S. — Portfolio Website

🔗 **View it live:** https://portfolio-a86l.onrender.com

A full-stack personal portfolio showcasing my projects, experience, certifications, and skills. Built with Flask, with a built-in admin panel so I can add or update content directly through the website — no code changes needed.

**Tech stack:** Flask · PostgreSQL (Neon) · Vanilla JS · Deployed on Render

## Admin mode

Press `Ctrl+Shift+A` on the live site → enter password → edit anything directly in the browser (projects, experience, certifications, skills, achievements). 
"No touching of code for editing work in future!"

---

## Running it locally

```
pip install -r requirements.txt
```

Set environment variables (PowerShell):

```
$env:DATABASE_URL="your-neon-connection-string"
$env:SECRET_KEY="any-random-string"
$env:ADMIN_PASS="your-chosen-password"
python app.py
```

Open http://localhost:5000

## Deploying your own copy

1. Fork/clone this repo
2. Create a free Postgres database on [neon.tech](https://neon.tech) and copy the connection string
3. Create a new Web Service on [render.com](https://render.com), connect the repo
4. Render auto-detects `render.yaml`
5. In the Environment tab, set `DATABASE_URL` and `ADMIN_PASS`
6. Deploy