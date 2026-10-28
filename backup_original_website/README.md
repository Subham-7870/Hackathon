# Original Website Backup Archive

This directory contains pristine backups of the original websites and prototypes prior to the UI/UX polish and redesign:

1. **`root_v1_prototype/`**:
   - The initial v1.0.0 release files: `index.html`, `styles.css`, `app.js`, `mock_data.json`, `dry_run.js`, `schema.json`, `api_integration.json`, and `webhook_handler.js`.
   - Represents the original Antigravity dark/console prototype.

2. **`sih_web_manus/`**:
   - Complete snapshot of the `sih web manus` prototype directory including React component drafts (`Home.tsx`, `Map.tsx`), documentation notes (`ideas.md`, `frontend_redesign_notes.md`), and raw assets.

### How to run or view the backup:
To preview the original v1 prototype:
```bash
cd root_v1_prototype
python3 -m http.server 8080
```
Then open `http://localhost:8080` in your web browser.
