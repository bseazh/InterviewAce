from __future__ import annotations

import io
import tarfile
import time
from dataclasses import dataclass
from typing import Dict, Any

import docker
from docker.errors import DockerException

from app.config import get_settings


@dataclass(frozen=True)
class LanguageConfig:
    image: str
    filename: str
    run_command: str
    compile_command: str | None = None

    def build_command(self, workdir: str) -> str:
        parts = []
        if self.compile_command:
            parts.append(self.compile_command.format(workdir=workdir))
        parts.append(self.run_command.format(workdir=workdir))
        return " && ".join(parts)


LANGUAGE_MAP: Dict[str, LanguageConfig] = {
    "python": LanguageConfig(
        image="python:3.11-slim",
        filename="main.py",
        run_command="python {workdir}/main.py < {workdir}/input.txt",
    ),
    "py": LanguageConfig(
        image="python:3.11-slim",
        filename="main.py",
        run_command="python {workdir}/main.py < {workdir}/input.txt",
    ),
    "cpp": LanguageConfig(
        image="gcc:13",
        filename="main.cpp",
        compile_command="g++ -O2 -std=c++17 {workdir}/main.cpp -o {workdir}/program",
        run_command="{workdir}/program < {workdir}/input.txt",
    ),
    "c++": LanguageConfig(
        image="gcc:13",
        filename="main.cpp",
        compile_command="g++ -O2 -std=c++17 {workdir}/main.cpp -o {workdir}/program",
        run_command="{workdir}/program < {workdir}/input.txt",
    ),
    "java": LanguageConfig(
        image="eclipse-temurin:17-jdk",
        filename="Main.java",
        compile_command="cd {workdir} && javac Main.java",
        run_command="cd {workdir} && java Main < input.txt",
    ),
    "go": LanguageConfig(
        image="golang:1.23",
        filename="main.go",
        compile_command="cd {workdir} && go build -o program main.go",
        run_command="{workdir}/program < {workdir}/input.txt",
    ),
}


def _nanos(cpus: float) -> int:
    # nano_cpus is in units of 1e-9 CPUs
    return int(cpus * 1_000_000_000)


def execute_code(language: str, code: str, stdin: str = "") -> Dict[str, Any]:
    settings = get_settings()
    client = docker.from_env()

    lang = (language or "").lower()
    config = LANGUAGE_MAP.get(lang)
    if config is None:
        return {
            "stdout": "",
            "stderr": f"language {language} not supported",
            "executionTime": "0ms",
            "memory": "",
            "status": "error",
        }

    workdir = "/workspace"
    command = ["/bin/sh", "-lc", config.build_command(workdir)]

    container = None
    start_ts = time.monotonic()
    try:
        # Ensure image present locally (ignore failures in offline mode)
        try:
            client.images.pull(config.image)
        except Exception:
            pass

        container = client.containers.create(
            image=config.image,
            command=command,
            working_dir=workdir,
            network_disabled=True,
            mem_limit=f"{settings.sandbox_memory_mb}m",
            nano_cpus=_nanos(settings.sandbox_cpus),
            detach=True,
        )

        tar_stream = io.BytesIO()
        with tarfile.open(fileobj=tar_stream, mode="w") as tar:
            def add_file(name: str, data: bytes) -> None:
                info = tarfile.TarInfo(name=name)
                info.size = len(data)
                info.mtime = int(time.time())
                tar.addfile(info, io.BytesIO(data))

            add_file(config.filename, code.encode("utf-8"))
            add_file("input.txt", (stdin or "").encode("utf-8"))

        tar_stream.seek(0)
        container.put_archive(workdir, tar_stream.read())

        container.start()
        try:
            container.wait(timeout=settings.sandbox_timeout_sec)
            status = "success"
        except Exception:
            status = "timeout"
            try:
                container.stop(timeout=1)
            except Exception:
                pass

        stdout = container.logs(stdout=True, stderr=False).decode("utf-8", errors="replace")
        stderr = container.logs(stdout=False, stderr=True).decode("utf-8", errors="replace")
        elapsed_ms = int((time.monotonic() - start_ts) * 1000)
        return {
            "stdout": stdout,
            "stderr": stderr,
            "executionTime": f"{elapsed_ms}ms",
            "memory": "",
            "status": status,
        }
    except DockerException as exc:
        return {
            "stdout": "",
            "stderr": str(exc),
            "executionTime": "0ms",
            "memory": "",
            "status": "error",
        }
    finally:
        if container is not None:
            try:
                container.remove(force=True)
            except Exception:
                pass
