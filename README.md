# My IlovePDF

Clon de iLovePDF — una aplicación web para manipular archivos PDF de forma rápida y sencilla.

## Funcionalidades

- **Unir PDFs** — Combina múltiples archivos PDF en uno solo.
- **Dividir PDF** — Extrae páginas específicas de un PDF usando rangos y páginas individuales (ej: `1-3, 5, 8-10`).

> Más funcionalidades serán agregadas próximamente (comprimir PDF, convertir a Word, proteger PDF, etc.).

## Tech Stack

| Capa | Tecnología |
|------|------------|
| Frontend | React 19, Vite 7, Tailwind CSS 4 |
| Backend | Python, FastAPI, pypdf |

## Requisitos

- Node.js 18+
- Python 3.10+

## Instalación

### Backend

```bash
cd backend
pip install fastapi uvicorn pypdf
```

### Frontend

```bash
cd frontend
npm install
```

## Ejecución

### Backend

```bash
cd backend
uvicorn backend_main:app --reload
```

El servidor se inicia en `http://127.0.0.1:8000`.

### Frontend

```bash
cd frontend
npm run dev
```

La app se abre en `http://localhost:5173`.

## Endpoints de la API

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/merge` | Recibe múltiples PDFs y devuelve uno unificado |
| POST | `/api/split` | Recibe un PDF y `pages_string` (ej: `1-3, 5, 8-10`), devuelve las páginas extraídas |

## Estructura del Proyecto

```
IlovePDF-clone/
├── backend/
│   └── backend_main.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── MergePDF.jsx
│   │   │   └── SplitPDF.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
├── LICENSE
└── README.md
```

## Licencia

Este proyecto está bajo la [Licencia MIT](LICENSE).

---

Hecho por **Josue Samuel Philco Puma**
