"""
MLflow UI Direct Server with Python 3.14 compatibility patch
"""
import sys
import os
from pathlib import Path
import importlib.abc
import importlib.resources.abc

# Python 3.14 compatibility patch
if not hasattr(importlib.abc, "Traversable"):
    try:
        importlib.abc.Traversable = importlib.resources.abc.Traversable
    except Exception:
        pass

if not hasattr(importlib.abc, "TraversableResources"):
    try:
        importlib.abc.TraversableResources = importlib.resources.abc.TraversableResources
    except Exception:
        pass

# Configure MLflow Environment with absolute paths
project_dir = Path(__file__).resolve().parent
db_path = f"sqlite:///{(project_dir / 'mlflow.db').as_posix()}"
artifact_path = (project_dir / "mlruns").resolve().as_uri()

os.environ["MLFLOW_ALLOW_FILE_STORE"] = "true"
os.environ["MLFLOW_BACKEND_STORE_URI"] = db_path
os.environ["MLFLOW_DEFAULT_ARTIFACT_ROOT"] = artifact_path
os.environ["_MLFLOW_SERVER_FILE_STORE"] = db_path
os.environ["_MLFLOW_SERVER_ARTIFACT_ROOT"] = artifact_path
os.environ["_MLFLOW_SERVER_ARTIFACT_DESTINATION"] = artifact_path
os.environ["MLFLOW_REGISTRY_URI"] = db_path

from mlflow.server import app

if __name__ == "__main__":
    port = 8080
    host = os.environ.get("MLFLOW_HOST", "127.0.0.1")
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            pass
    if len(sys.argv) > 2:
        host = sys.argv[2]

    print(f"[*] MLflow UI starting on http://{host}:{port} ...")
    try:
        from waitress import serve
        serve(app, host=host, port=port)
    except ImportError:
        app.run(host=host, port=port, threaded=True)
