import sys
import importlib.abc
import importlib.resources.abc

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
