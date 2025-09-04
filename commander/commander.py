# ----- FastAPI Web (Vanilla WebSocket with raw text) -----
import asyncio
import os
import pathlib
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse

app = FastAPI(title="Quantum Commander")

# repo-root-based paths
repo_root = pathlib.Path(__file__).resolve().parent.parent
static_dir = repo_root / "static"
static_dir.mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

templates_dir = repo_root / "templates"
templates = Jinja2Templates(directory=str(templates_dir))

_AGENT = None

def get_agent():
    global _AGENT
    if _AGENT is None:
        # Assumes make_agent() is available in the module scope or imported elsewhere
        _AGENT = make_agent()
    return _AGENT

@app.get("/", response_class=HTMLResponse)
async def web_ui(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.websocket("/ws")
async def ws(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # Receive raw text from client
            try:
                message = await websocket.receive_text()
            except Exception as e:
                # Malformed frame or receive error; report and continue
                try:
                    await websocket.send_text(f"Error: {e}")
                except Exception:
                    pass
                continue

            # Process the message
            loop = asyncio.get_running_loop()
            try:
                # One-shot response per message
                resp = await loop.run_in_executor(None, get_agent().run_persisted, message)
            except Exception as e:
                resp = f"Error: {e}"

            # Send raw text response back to client
            try:
                await websocket.send_text(resp if isinstance(resp, str) else str(resp))
            except Exception:
                # If sending fails, break the loop (connection likely closed)
                break
    except WebSocketDisconnect:
        pass

# Minimal CLI entrypoint for `python -m commander.commander web`
if __name__ == "__main__":
    import sys
    if len(sys.argv) >= 2 and sys.argv[1] == "web":
        import uvicorn
        uvicorn.run("commander.commander:app", host="127.0.0.1", port=8000, reload=False)
    else:
        print("Usage: python -m commander.commander web")

