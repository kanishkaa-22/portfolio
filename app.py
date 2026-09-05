# ═══════════════════════════════════════════
#  app.py — Flask Backend for Portfolio
#  Kanishkaa S. Portfolio
# ═══════════════════════════════════════════

from flask import Flask, render_template, request, jsonify, session
import sqlite3, json, os, hashlib

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', '')

ADMIN_PASS = os.environ.get('ADMIN_PASS', '')
DB_PATH = os.path.join(os.path.dirname(__file__), 'database.db')

# ── DB SETUP ────────────────────────────────
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()

    c.executescript('''
        CREATE TABLE IF NOT EXISTS about (
            id INTEGER PRIMARY KEY,
            name TEXT, role TEXT, bio TEXT, tags TEXT,
            github TEXT, linkedin TEXT, email TEXT,
            stat_projects_sub TEXT,
            stat_education_sub TEXT,
            stat_certs_sub TEXT,
            stat_internship_sub TEXT
        );

        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cat TEXT, title TEXT, desc TEXT,
            chips TEXT, col TEXT,
            start_date TEXT, end_date TEXT,
            github TEXT, live TEXT,
            featured INTEGER DEFAULT 0,
            sort_order INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS experience (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            year INTEGER, start_date TEXT, end_date TEXT,
            status TEXT, type TEXT, role TEXT,
            org TEXT, desc TEXT, tags TEXT, col TEXT,
            sort_order INTEGER DEFAULT 0, proof TEXT
        );

        CREATE TABLE IF NOT EXISTS certifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            icon TEXT, issuer TEXT, name TEXT,
            start_date TEXT, end_date TEXT,
            status TEXT, link TEXT
        );

        CREATE TABLE IF NOT EXISTS achievements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            icon TEXT, icon_bg TEXT,
            category TEXT, title TEXT,
            desc TEXT, date TEXT, proof TEXT,
            sort_order INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS soft_skills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            icon TEXT, name TEXT, desc TEXT,
            sort_order INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS tech_skills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT, color TEXT, grp TEXT,
            sort_order INTEGER DEFAULT 0
        );
    ''')

    # Seed default data if tables are empty
    if not c.execute('SELECT 1 FROM about').fetchone():
        c.execute('''INSERT INTO about VALUES (1,
            "Kanishkaa S.",
            "B.Tech CSE · FinTech Honours · SRM Institute, Chennai · 2024–2028",
            "I build things that bridge data and decisions — from ML pipelines predicting air quality to full-stack security tools and graph algorithm visualizers. Currently pursuing Computer Science with a specialization in Financial Technology, blending code with real-world problem solving.",
            "Machine Learning,Full-Stack Dev,Data Analytics,FinTech,Cloud Engineering",
            "https://github.com/kanishkaa-22",
            "https://linkedin.com/in/",
            "your@email.com"
        )''')

    if not c.execute('SELECT 1 FROM projects').fetchone():
        projects = [
            ('Machine Learning','PM2.5 Air Quality Predictor','End-to-end ML pipeline on Beijing Multi-Site dataset. Random Forest achieved R²=0.93. Deployed as Streamlit app via Colab + ngrok.','Python,Scikit-learn,Random Forest,Streamlit,Pandas,ngrok','#60a5fa','Jan 2025','Mar 2025','https://github.com/kanishkaa-22/pm25-air-quality-prediction',None,1,0),
            ('Algorithms · Visualization','Smart City MST Optimizer',"Interactive graph tool visualizing Kruskal's and Prim's MST algorithms with canvas animation. Flask backend.",'Flask,Python,JavaScript,Canvas API','#34d399','2024','2025','https://github.com/',None,1,1),
            ('Security · Full-Stack','Phishing Awareness Simulator','Ethical phishing training platform. HMAC-signed tokens, SQLite logging, admin dashboard, Docker + Nginx, 30 pytest tests.','Flask,SQLite,HMAC,Docker,Nginx,pytest','#fb7185','2024','2025','https://github.com/',None,1,2),
            ('Web Application','Online Election Voting System','Flask/MySQL MVC app with secure voter auth and real-time results. Extended with mock online voting feature.','Flask,MySQL,MVC,Python','#a78bfa','2024','2025','https://github.com/',None,0,3),
        ]
        c.executemany('INSERT INTO projects (cat,title,desc,chips,col,start_date,end_date,github,live,featured,sort_order) VALUES (?,?,?,?,?,?,?,?,?,?,?)', projects)

    if not c.execute('SELECT 1 FROM experience').fetchone():
        exps = [
            (2025,'Jan 2025','Mar 2025','completed','Virtual Programme','Data Analytics Virtual Experience','Quantium — via Forage','Completed all 3 tasks — customer analytics in R, uplift testing, and Pyramid Principles report.','R,ggplot2,Uplift Testing','#fbbf24',0),
            (2025,'Feb 2025','Present','ongoing','Academic Elective','Enterprise Cloud Engineering for InsurTech','Guidewire Technology Labs × SRM','Industry-partnered elective on cloud architecture for insurance tech platforms.','Cloud,Guidewire,InsurTech','#60a5fa',1),
            (2024,'Aug 2024','Present','ongoing','Honours Specialization','Financial Technology (FinTech)','SRM Institute of Science and Technology','Pursuing FinTech Honours — blockchain, digital payments, financial systems.','FinTech,Blockchain','#a78bfa',2),
            (2024,'Aug 2024','Present','ongoing','Education · Started','B.Tech Computer Science Engineering','SRM Institute of Science and Technology','Started undergraduate studies. Core: DSA, DBMS, OS, software engineering.','CSE,DBMS,DSA','#34d399',3),
        ]
        c.executemany('INSERT INTO experience (year,start_date,end_date,status,type,role,org,desc,tags,col,sort_order) VALUES (?,?,?,?,?,?,?,?,?,?,?)', exps)

    if not c.execute('SELECT 1 FROM certifications').fetchone():
        certs = [
            ('📊','Forage · Quantium','Data Analytics Virtual Experience Programme','Jan 2025','Mar 2025','completed','https://your-certificate-link.com'),
            ('☁️','Guidewire × SRM','Enterprise Cloud Engineering for Insurance Technology','Feb 2025','Present','inprogress',None),
            ('💳','SRM — Honours','Financial Technology (FinTech) Specialization','Aug 2024','2028','ongoing',None),
        ]
        c.executemany('INSERT INTO certifications (icon,issuer,name,start_date,end_date,status,link) VALUES (?,?,?,?,?,?,?)', certs)

    if not c.execute('SELECT 1 FROM achievements').fetchone():
        achs = [
            ('🏛️','rgba(167,139,250,.12)','Membership','IEEE Student Member','Active student member of the Institute of Electrical and Electronics Engineers','2024 – Present'),
            ('🎓','rgba(251,191,36,.12)','Academic','GPA 9.10 / 10','Maintained a strong academic record in B.Tech CSE at SRM Institute','2024 – Present'),
            ('🏆','rgba(251,113,133,.12)','Internship Recognition','Best Performance Award','Recognised for outstanding performance during internship','2025'),
            ('⚡','rgba(96,165,250,.12)','Hackathon','Hackathon Participation','Participated in — add hackathon name and details','2025'),
            ('🛠️','rgba(52,211,153,.12)','Workshop','Workshop Participation','Attended — add workshop name and topic','2025'),
        ]
        c.executemany('INSERT INTO achievements (icon,icon_bg,category,title,desc,date) VALUES (?,?,?,?,?,?)', achs)

    if not c.execute('SELECT 1 FROM soft_skills').fetchone():
        skills = [
            ('🧠','Problem Solving','Breaking complex problems into clear, logical steps',0),
            ('💬','Communication','Translating technical ideas into simple language',1),
            ('🤝','Teamwork','Collaborating effectively in academic and project teams',2),
            ('📋','Project Management','Planning, prioritising and delivering projects on time',3),
            ('🔍','Research & Analysis','Deep-diving into data and literature to extract insights',4),
            ('🎯','Attention to Detail','Catching edge cases, bugs and inconsistencies early',5),
            ('⚡','Fast Learning','Picking up new tools, frameworks and domains quickly',6),
            ('📊','Data Storytelling','Presenting findings clearly through visuals and reports',7),
        ]
        c.executemany('INSERT INTO soft_skills (icon,name,desc,sort_order) VALUES (?,?,?,?)', skills)

    if not c.execute('SELECT 1 FROM tech_skills').fetchone():
        tech = [
            ('Python','#3b82f6','Languages',0),('JavaScript','#f59e0b','Languages',1),
            ('R','#10b981','Languages',2),('SQL','#6366f1','Languages',3),
            ('HTML / CSS','#f97316','Languages',4),
            ('Flask','#10b981','Frameworks & Libraries',0),('Streamlit','#06b6d4','Frameworks & Libraries',1),
            ('Scikit-learn','#f59e0b','Frameworks & Libraries',2),('Pandas / NumPy','#8b5cf6','Frameworks & Libraries',3),
            ('Matplotlib','#ec4899','Frameworks & Libraries',4),
            ('Docker','#0ea5e9','Tools & Cloud',0),('Git / GitHub','#f97316','Tools & Cloud',1),
            ('MySQL','#34d399','Tools & Cloud',2),('Google Colab','#a78bfa','Tools & Cloud',3),
            ('Nginx','#facc15','Tools & Cloud',4),
        ]
        c.executemany('INSERT INTO tech_skills (name,color,grp,sort_order) VALUES (?,?,?,?)', tech)

    conn.commit()
    conn.close()

# ── ROUTES ──────────────────────────────────
@app.route('/')
def index():
    return render_template('index.html')

# ── AUTH ────────────────────────────────────
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    if data.get('password') == ADMIN_PASS:
        session['admin'] = True
        return jsonify({'ok': True})
    return jsonify({'ok': False, 'error': 'Incorrect password'}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('admin', None)
    return jsonify({'ok': True})

@app.route('/api/check-auth')
def check_auth():
    return jsonify({'admin': session.get('admin', False)})

def admin_required(f):
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get('admin'):
            return jsonify({'error': 'Unauthorized'}), 401
        return f(*args, **kwargs)
    return decorated

# ── LOAD ALL DATA ───────────────────────────
@app.route('/api/data')
def get_all_data():
    conn = get_db()
    c = conn.cursor()
    about = dict(c.execute('SELECT * FROM about WHERE id=1').fetchone())
    about['tags'] = about['tags'].split(',') if about['tags'] else []
    # defaults for stat sub-texts if not set
    about.setdefault('stat_projects_sub', 'ML · Web · Cybersecurity · Algorithms')
    about.setdefault('stat_education_sub', 'B.Tech CSE · SRM 2024–28')
    about.setdefault('stat_certs_sub', 'Forage · Guidewire · SRM Honours')
    about.setdefault('stat_internship_sub', 'Available · 2026')
    projects = [dict(r) for r in c.execute('SELECT * FROM projects ORDER BY sort_order').fetchall()]
    for p in projects: p['chips'] = p['chips'].split(',') if p['chips'] else []
    experience = [dict(r) for r in c.execute('SELECT * FROM experience ORDER BY sort_order').fetchall()]
    for e in experience: e['tags'] = e['tags'].split(',') if e['tags'] else []
    certifications = [dict(r) for r in c.execute('SELECT * FROM certifications').fetchall()]
    achievements = [dict(r) for r in c.execute('SELECT * FROM achievements ORDER BY sort_order').fetchall()]
    soft_skills = [dict(r) for r in c.execute('SELECT * FROM soft_skills ORDER BY sort_order').fetchall()]
    tech_skills = [dict(r) for r in c.execute('SELECT * FROM tech_skills ORDER BY grp, sort_order').fetchall()]
    conn.close()
    return jsonify({
        'about': about, 'projects': projects, 'experience': experience,
        'certifications': certifications, 'achievements': achievements,
        'soft_skills': soft_skills, 'tech_skills': tech_skills
    })

# ── ABOUT ───────────────────────────────────
@app.route('/api/about', methods=['PUT'])
@admin_required
def update_about():
    d = request.json
    conn = get_db()
    # Add new columns if they don't exist yet
    for col in ['stat_projects_sub','stat_education_sub','stat_certs_sub','stat_internship_sub']:
        try: conn.execute(f'ALTER TABLE about ADD COLUMN {col} TEXT')
        except: pass
    conn.execute('''UPDATE about SET name=?,role=?,bio=?,tags=?,github=?,linkedin=?,email=?,
        stat_projects_sub=?,stat_education_sub=?,stat_certs_sub=?,stat_internship_sub=? WHERE id=1''',
        (d['name'],d['role'],d['bio'],','.join(d.get('tags',[])),d.get('github',''),d.get('linkedin',''),d.get('email',''),
         d.get('stat_projects_sub','ML · Web · Cybersecurity · Algorithms'),
         d.get('stat_education_sub','B.Tech CSE · SRM 2024–28'),
         d.get('stat_certs_sub','Forage · Guidewire · SRM Honours'),
         d.get('stat_internship_sub','Available · 2026')))
    conn.commit(); conn.close()
    return jsonify({'ok': True})

# ── PROJECTS ────────────────────────────────
@app.route('/api/projects', methods=['POST'])
@admin_required
def add_project():
    d = request.json
    conn = get_db()
    cur = conn.execute('INSERT INTO projects (cat,title,desc,chips,col,start_date,end_date,github,live,featured,sort_order) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
        (d['cat'],d['title'],d['desc'],','.join(d.get('chips',[])),d.get('col','#a78bfa'),
         d.get('start',''),d.get('end',''),d.get('github','#'),d.get('live'),
         d.get('featured',0),d.get('sort_order',999)))
    conn.commit(); new_id = cur.lastrowid; conn.close()
    return jsonify({'ok': True, 'id': new_id})

@app.route('/api/projects/<int:pid>', methods=['PUT'])
@admin_required
def update_project(pid):
    d = request.json
    conn = get_db()
    conn.execute('UPDATE projects SET cat=?,title=?,desc=?,chips=?,col=?,start_date=?,end_date=?,github=?,live=?,featured=? WHERE id=?',
        (d['cat'],d['title'],d['desc'],','.join(d.get('chips',[])),d.get('col','#a78bfa'),
         d.get('start',''),d.get('end',''),d.get('github','#'),d.get('live'),d.get('featured',0),pid))
    conn.commit(); conn.close()
    return jsonify({'ok': True})

@app.route('/api/projects/<int:pid>', methods=['DELETE'])
@admin_required
def delete_project(pid):
    conn = get_db()
    conn.execute('DELETE FROM projects WHERE id=?', (pid,))
    conn.commit(); conn.close()
    return jsonify({'ok': True})

# ── EXPERIENCE ──────────────────────────────
@app.route('/api/experience', methods=['POST'])
@admin_required
def add_experience():
    d = request.json
    conn = get_db()
    cur = conn.execute('INSERT INTO experience (year,start_date,end_date,status,type,role,org,desc,tags,col,proof) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
        (d.get('year',2025),d.get('start',''),d.get('end',''),d.get('status','ongoing'),
         d.get('type',''),d['role'],d['org'],d.get('desc',''),','.join(d.get('tags',[])),d.get('col','#a78bfa'),d.get('proof')))
    conn.commit(); new_id = cur.lastrowid; conn.close()
    return jsonify({'ok': True, 'id': new_id})

@app.route('/api/experience/<int:eid>', methods=['PUT'])
@admin_required
def update_experience(eid):
    d = request.json
    conn = get_db()
    conn.execute('UPDATE experience SET year=?,start_date=?,end_date=?,status=?,type=?,role=?,org=?,desc=?,tags=?,col=?,proof=? WHERE id=?',
        (d.get('year',2025),d.get('start',''),d.get('end',''),d.get('status','ongoing'),
         d.get('type',''),d['role'],d['org'],d.get('desc',''),','.join(d.get('tags',[])),d.get('col','#a78bfa'),d.get('proof'),eid))
    conn.commit(); conn.close()
    return jsonify({'ok': True})

@app.route('/api/experience/<int:eid>', methods=['DELETE'])
@admin_required
def delete_experience(eid):
    conn = get_db()
    conn.execute('DELETE FROM experience WHERE id=?', (eid,))
    conn.commit(); conn.close()
    return jsonify({'ok': True})

# ── CERTIFICATIONS ──────────────────────────
@app.route('/api/certifications', methods=['POST'])
@admin_required
def add_cert():
    d = request.json
    conn = get_db()
    cur = conn.execute('INSERT INTO certifications (icon,issuer,name,start_date,end_date,status,link) VALUES (?,?,?,?,?,?,?)',
        (d.get('icon','📜'),d['issuer'],d['name'],d.get('start',''),d.get('end',''),d.get('status','inprogress'),d.get('link')))
    conn.commit(); new_id = cur.lastrowid; conn.close()
    return jsonify({'ok': True, 'id': new_id})

@app.route('/api/certifications/<int:cid>', methods=['PUT'])
@admin_required
def update_cert(cid):
    d = request.json
    conn = get_db()
    conn.execute('UPDATE certifications SET icon=?,issuer=?,name=?,start_date=?,end_date=?,status=?,link=? WHERE id=?',
        (d.get('icon','📜'),d['issuer'],d['name'],d.get('start',''),d.get('end',''),d.get('status','inprogress'),d.get('link'),cid))
    conn.commit(); conn.close()
    return jsonify({'ok': True})

@app.route('/api/certifications/<int:cid>', methods=['DELETE'])
@admin_required
def delete_cert(cid):
    conn = get_db()
    conn.execute('DELETE FROM certifications WHERE id=?', (cid,))
    conn.commit(); conn.close()
    return jsonify({'ok': True})

# ── ACHIEVEMENTS ────────────────────────────
@app.route('/api/achievements', methods=['POST'])
@admin_required
def add_achievement():
    d = request.json
    conn = get_db()
    max_order = conn.execute('SELECT COALESCE(MAX(sort_order),-1) FROM achievements').fetchone()[0]
    cur = conn.execute('INSERT INTO achievements (icon,icon_bg,category,title,desc,date,proof,sort_order) VALUES (?,?,?,?,?,?,?,?)',
        (d.get('icon','🏆'),d.get('icon_bg','rgba(167,139,250,.12)'),d.get('category',''),d['title'],d.get('desc',''),d.get('date',''),d.get('proof'),d.get('sort_order', max_order+1)))
    conn.commit(); new_id = cur.lastrowid; conn.close()
    return jsonify({'ok': True, 'id': new_id})

@app.route('/api/achievements/<int:aid>', methods=['PUT'])
@admin_required
def update_achievement(aid):
    d = request.json
    conn = get_db()
    if 'sort_order' in d:
        conn.execute('UPDATE achievements SET icon=?,icon_bg=?,category=?,title=?,desc=?,date=?,proof=?,sort_order=? WHERE id=?',
            (d.get('icon','🏆'),d.get('icon_bg','rgba(167,139,250,.12)'),d.get('category',''),d['title'],d.get('desc',''),d.get('date',''),d.get('proof'),d.get('sort_order'),aid))
    else:
        conn.execute('UPDATE achievements SET icon=?,icon_bg=?,category=?,title=?,desc=?,date=?,proof=? WHERE id=?',
            (d.get('icon','🏆'),d.get('icon_bg','rgba(167,139,250,.12)'),d.get('category',''),d['title'],d.get('desc',''),d.get('date',''),d.get('proof'),aid))
    conn.commit(); conn.close()
    return jsonify({'ok': True})

@app.route('/api/achievements/reorder', methods=['POST'])
@admin_required
def reorder_achievements():
    """Accepts {order: [id1, id2, id3, ...]} and saves the new sort order."""
    d = request.json
    order = d.get('order', [])
    conn = get_db()
    for idx, aid in enumerate(order):
        conn.execute('UPDATE achievements SET sort_order=? WHERE id=?', (idx, aid))
    conn.commit(); conn.close()
    return jsonify({'ok': True})

@app.route('/api/achievements/<int:aid>', methods=['DELETE'])
@admin_required
def delete_achievement(aid):
    conn = get_db()
    conn.execute('DELETE FROM achievements WHERE id=?', (aid,))
    conn.commit(); conn.close()
    return jsonify({'ok': True})

# ── SOFT SKILLS ─────────────────────────────
@app.route('/api/soft-skills', methods=['POST'])
@admin_required
def add_soft_skill():
    d = request.json
    conn = get_db()
    cur = conn.execute('INSERT INTO soft_skills (icon,name,desc,sort_order) VALUES (?,?,?,?)',
        (d.get('icon','🌟'),d['name'],d.get('desc',''),d.get('sort_order',999)))
    conn.commit(); new_id = cur.lastrowid; conn.close()
    return jsonify({'ok': True, 'id': new_id})

@app.route('/api/soft-skills/<int:sid>', methods=['DELETE'])
@admin_required
def delete_soft_skill(sid):
    conn = get_db()
    conn.execute('DELETE FROM soft_skills WHERE id=?', (sid,))
    conn.commit(); conn.close()
    return jsonify({'ok': True})

# ── TECH SKILLS ─────────────────────────────
@app.route('/api/tech-skills', methods=['POST'])
@admin_required
def add_tech_skill():
    d = request.json
    conn = get_db()
    cur = conn.execute('INSERT INTO tech_skills (name,color,grp,sort_order) VALUES (?,?,?,?)',
        (d['name'],d.get('color','#a78bfa'),d.get('grp','Languages'),d.get('sort_order',999)))
    conn.commit(); new_id = cur.lastrowid; conn.close()
    return jsonify({'ok': True, 'id': new_id})

@app.route('/api/tech-skills/<int:tid>', methods=['DELETE'])
@admin_required
def delete_tech_skill_api(tid):
    conn = get_db()
    conn.execute('DELETE FROM tech_skills WHERE id=?', (tid,))
    conn.commit(); conn.close()
    return jsonify({'ok': True})

# ── RUN ─────────────────────────────────────
if __name__ == '__main__':
    init_db()
    app.run(debug=True)

# For Render / production
init_db()
