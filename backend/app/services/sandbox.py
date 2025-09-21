from __future__ import annotations

import time
from typing import Dict, Any, List
import docker
from docker.errors import DockerException, NotFound

from app.config import get_settings


def _nanos(cpus: float) -> int:
    # nano_cpus is in units of 1e-9 CPUs
    return int(cpus * 1_000_000_000)


def execute_code(language: str, code: str, stdin: str = "") -> Dict[str, Any]:
    settings = get_settings()
    client = docker.from_env()

    lang = language.lower()
    workdir = "/workspace"
    if lang == "python":
        image = "python:3.11-slim"
        run_cmd = f"python {workdir}/main.py < {workdir}/input.txt"
        files = {"main.py": code.encode("utf-8")}
    elif lang in ("cpp", "c++"):  # C++
        image = "gcc:13"
        # Compile then run
        run_cmd = f"g++ -O2 -std=c++17 {workdir}/main.cpp -o {workdir}/a.out && {workdir}/a.out < {workdir}/input.txt"
        files = {"main.cpp": code.encode("utf-8")}
    else:
        return {"stdout": "", "stderr": f"language {language} not supported", "executionTime": "0ms", "memory": "", "status": "error"}

    cmd = ["/bin/sh", "-lc", run_cmd]

    container = None
    start_ts = time.monotonic()
    try:
        # Ensure image present
        try:
            client.images.pull(image)
        except Exception:
            # If pull not allowed (offline), assume present
            pass

        container = client.containers.create(
            image=image,
            command=cmd,
            working_dir=workdir,
            network_disabled=True,
            mem_limit=f"{settings.sandbox_memory_mb}m",
            nano_cpus=_nanos(settings.sandbox_cpus),
            detach=True,
            name=None,
        )

        # Prepare files via put_archive (tar stream)
        import io, tarfile

        tar_stream = io.BytesIO()
        with tarfile.open(fileobj=tar_stream, mode="w") as tar:
            def add_bytes(name: str, data: bytes):
                info = tarfile.TarInfo(name=name)
                info.size = len(data)
                info.mtime = int(time.time())
                tar.addfile(info, io.BytesIO(data))

            for fname, fdata in files.items():
                add_bytes(fname, fdata)
            add_bytes("input.txt", (stdin or "").encode("utf-8"))
        tar_stream.seek(0)
        container.put_archive(workdir, tar_stream.read())

        container.start()

        # Wait with timeout
        try:
            container.wait(timeout=settings.sandbox_timeout_sec)
            status = "success"
        except Exception:
            # Timeout or other error
            status = "timeout"
            try:
                container.stop(timeout=1)
            except Exception:
                pass

        stdout = container.logs(stdout=True, stderr=False).decode("utf-8", errors="replace")
        stderr = container.logs(stdout=False, stderr=True).decode("utf-8", errors="replace")
        end_ts = time.monotonic()
        elapsed_ms = int((end_ts - start_ts) * 1000)
        return {
            "stdout": stdout,
            "stderr": stderr,
            "executionTime": f"{elapsed_ms}ms",
            "memory": "",
            "status": status,
        }
    except DockerException as e:
        return {"stdout": "", "stderr": str(e), "executionTime": "0ms", "memory": "", "status": "error"}
    finally:
        if container is not None:
            try:
                container.remove(force=True)
            except Exception:
                pass
