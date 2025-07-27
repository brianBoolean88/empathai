# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/

# Want to help us make this template better? Share your feedback here: https://forms.gle/ybq9Krt8jtBL3iCk7

ARG PYTHON_VERSION=3.11.8
FROM nvidia/cuda:12.1.1-devel-ubuntu22.04 AS base

RUN apt-get update && apt-get install -y \
    python3-pip python3-dev python3-setuptools python3-venv build-essential git && \
    ln -s /usr/bin/python3 /usr/bin/python && \
    pip3 install --upgrade pip setuptools wheel
    

# Prevents Python from writing pyc files.
ENV PYTHONDONTWRITEBYTECODE=1

# Keeps Python from buffering stdout and stderr to avoid situations where
# the application crashes without emitting any logs due to buffering.
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Create a non-privileged user that the app will run under.
# See https://docs.docker.com/go/dockerfile-user-best-practices/
ARG UID=10001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/app" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    appuser
RUN chown -R appuser:appuser /app

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.cache/pip to speed up subsequent builds.
# Leverage a bind mount to requirements.txt to avoid having to copy them into
# into this layer.

RUN pip install --upgrade pip setuptools wheel
RUN pip install packaging

RUN --mount=type=cache,target=/root/.cache/pip \
    --mount=type=bind,source=requirements.txt,target=requirements.txt \
    python -m pip install -r requirements.txt

RUN nvcc --version
RUN export CUDA_HOME=/usr/local/cuda-X.X
RUN pip install flash-attn

RUN pip install huggingface_hub

ARG HF_TOKEN
ENV HF_TOKEN=$HF_TOKEN
RUN huggingface-cli login --token $HF_TOKEN --add-to-git-credential

# Switch to the user to run the application.
USER appuser

# Copy the source code into the container.
COPY . .

# Expose the port that the application listens on.
EXPOSE 8000

# Run the application.
CMD uvicorn app:app --host=172.18.0.3 --port=8000
