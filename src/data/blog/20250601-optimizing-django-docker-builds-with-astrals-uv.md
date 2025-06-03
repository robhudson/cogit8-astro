---
title: "Optimizing Django Docker Builds with Astral’s `uv`"
author: Rob Hudson
pubDatetime: 2025-06-01T12:00:00-08:00
slug: optimizing-django-docker-builds-with-astrals-uv
tags:
  - django
  - docker
  - python
  - uv
description:
  Learn how to speed up and harden your Django Docker builds using Astral’s uv for faster installs,
  better caching, and reproducible environments.

---

If you're using pip for Python dependency management in your Docker containers, Astral's `uv` offers some compelling advantages. With significantly faster dependency resolution and installation times, `uv` can notably improve your Django Docker build performance while providing more robust dependency handling. I also find the dependency upgrade workflow, mentioned later, much simpler.

## Setting Up uv in Docker

Let's walk through a production-ready `uv` setup for Django. Here's how to get the latest `uv` binary into your container:

```dockerfile
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv
```

This approach uses Docker's multi-stage capabilities to grab the `uv` binary without needing to install it through pip or other package managers. It's clean, efficient, and always gets you the latest version.

## Environment Variables

I define environment variables in my `Dockerfile` rather than pass command flags. Here are the key ones I'm using and why they matter:

### Core Configuration

```dockerfile
ENV UV_PROJECT_ENVIRONMENT=/venv \
    UV_NO_MANAGED_PYTHON=1 \
    UV_PYTHON_DOWNLOADS=never \
    VIRTUAL_ENV=/venv
```

* **`UV_NO_MANAGED_PYTHON=1`**: Prevents `uv` from trying to manage Python installations. In my Docker container, I already have Python installed and don't want `uv` attempting to download or manage different Python versions.
* **`UV_PYTHON_DOWNLOADS=never`**: Reinforces that `uv` should never try to download Python interpreters. Essential for reproducible container builds.
* **`UV_PROJECT_ENVIRONMENT=/venv`**: Tells `uv` where to create and manage the virtual environment. This keeps everything organized and predictable, which is leveraged as part of my multi-stage build process. Later in my Dockerfile I copy the `/venv` from the build step to the final production image and this defines that location.

### Performance Optimizations

```dockerfile
ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_CACHE_DIR=/app/.cache/uv
```

* **`UV_COMPILE_BYTECODE=1`**: Pre-compiles Python bytecode during installation. This means faster application startup times since Python doesn't need to compile .py files to .pyc on first import.
* **`UV_LINK_MODE=copy`**: Configures `uv` to copy files instead of attempting to create hard links. This prevents warning messages that occur when `uv` tries to use hard links between Docker cache mounts and the target directory, which typically exist on different filesystems where hard links aren't supported.
* **`UV_CACHE_DIR=/app/.cache/uv`**: Explicitly sets the cache location. When combined with Docker's mount caching, this dramatically speeds up subsequent builds.

### Security and Reproducibility

```dockerfile
ENV UV_FROZEN=1 \
    UV_REQUIRE_HASHES=1 \
    UV_VERIFY_HASHES=1
```

* **`UV_FROZEN=1`**: Tells `uv` to strictly respect the lock file and refuse to update dependencies. This is critical for production deployments where you want identical dependencies every time.
* **`UV_REQUIRE_HASHES=1`** and **`UV_VERIFY_HASHES=1`**: These enforce cryptographic verification of every package. If a package's hash doesn't match what's expected in the lock file, the build fails. This protects against supply chain attacks and corrupted packages.

## Installing Dependencies with uv

Here's how the actual dependency installation works:

```dockerfile
# Create the virtual environment
RUN uv venv $VIRTUAL_ENV

# Install dependencies with mount caching
RUN --mount=type=cache,target=/app/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --no-install-project --no-editable
```

The `uv sync` command installs dependencies listed in your lock file and ensures that only the exact versions specified in your `uv.lock` file are installed, making builds deterministic and secure when using hash verification.

The `--mount=type=cache` instruction tells Docker to persist `uv`'s cache between builds. This means that packages downloaded in previous builds don't need to be downloaded again, leading to incredibly fast rebuilds.

The mounts for `uv.lock` and `pyproject.toml` are here to avoid having to do a `COPY`. Once the `/venv` is created we no longer need these in our production image so these aren't copied later either.

The `--no-install-project --no-editable` flags tell `uv` to only install dependencies, not your project itself (since we'll copy the project code separately).

### Development Dependencies

One feature of `uv` I like is its excellent support for development dependencies through dependency groups. In your `pyproject.toml`, you can separate production and development dependencies:

```toml
[project]
dependencies = [
    "django~=5.2",
    # ... production dependencies
]

[dependency-groups]
dev = [
    "django-debug-toolbar",
    # ... development tools
]
test = [
	"pytest",
	# ...
]

[tool.uv]
default-groups = []
```

By default, `uv` includes the `dev` group when syncing dependencies but I've overridden this here so the groups have to be explicit. This is so that production containers, where you want only the core dependencies, are the default.

For maximum flexibility in your Docker builds, you can use a build argument to control which dependency groups get installed:

```dockerfile
ARG BUILD_GROUPS=""

RUN --mount=type=cache,target=/app/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv venv $VIRTUAL_ENV && \
    uv sync --no-install-project --no-editable $BUILD_GROUPS
```

This approach gives you fine-grained control over what gets installed in different environments. Developers can still get all dependencies by providing the `BUILD_GROUPS` argument to Docker:

```bash
# Production: only core dependencies.
docker build .

# Development: include dev tools.
docker build --build-arg BUILD_GROUPS="--group dev" .

# CI: include testing dependencies.
docker build --build-arg BUILD_GROUPS="--group test" .
```

With Docker Compose the build arguments can be specified:

```yaml
args:
  BUILD_GROUPS: "--group dev --group test"
```

This keeps your production images lean and secure by default while giving developers and CI systems fast, tailored installs.

## Migration from pip

If you're currently using pip with `requirements.txt`, here's how to migrate:

1. **Convert your requirements.txt to pyproject.toml**:
    
    ```bash
    uv add --requirements requirements.txt
    ```
    
    This command automatically reads your requirements.txt and adds all dependencies to a pyproject.toml file (creating one if it doesn't exist). If you have separate dev requirements:
    
    ```bash
    uv add --requirements requirements.txt
    uv add --group dev --requirements requirements-dev.txt
    ```
    
2. **Generate the lock file** (if not created automatically):
    
    ```bash
    uv lock
    ```
    
3. **Update your Dockerfile** with the `uv` configuration shown above, or full example below.
    
## Keeping Dependencies Up to Date

One of the best parts about using `uv` is how simple dependency management becomes.

In my pyproject.toml, I prefer to use the `~=` (compatible release) syntax for version constraints instead of hard pins (`==`) or overly permissive ranges like `>=`. This strikes a good balance because it allows `uv lock` to pick up safe updates within a major or minor version range. It helps keep builds stable without requiring constant manual updates to version numbers. Even with a lockfile in place, it's still a good idea to review any changes before deploying to production.

Once your setup is complete, maintaining your dependencies is straightforward:

**Check for outdated packages**:

```bash
uv pip list --outdated
```

This command shows you exactly which packages have newer versions available, making it easy to see what needs attention. Update your `pyproject.toml` file as needed.

**Update your lock file**:

```bash
uv lock --upgrade
```

This regenerates your `uv.lock` file with the latest compatible versions of all dependencies, including updated hashes for security verification.

## The Dockerfile

This is a somewhat truncated but complete version of my Dockerfile with all of the above in place.

```dockerfile
### BUILD IMAGE ###

FROM python:3.13-slim AS builder

ENV DJANGO_SETTINGS_MODULE=myproj.settings \
    PATH="/venv/bin:$PATH" \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_CACHE_DIR=/root/.cache/uv \
    UV_COMPILE_BYTECODE=1 \
    UV_FROZEN=1 \
    UV_LINK_MODE=copy \
    UV_NO_MANAGED_PYTHON=1 \
    UV_PROJECT_ENVIRONMENT=/venv \
    UV_PYTHON_DOWNLOADS=never \
    UV_REQUIRE_HASHES=1 \
    UV_VERIFY_HASHES=1 \
    VIRTUAL_ENV=/venv

COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

RUN <<EOT
apt-get update -y && \
apt-get install -y --no-install-recommends \
    build-essential \
    # other build dependencies here
EOT

WORKDIR /app

ARG BUILD_GROUPS=""

RUN --mount=type=cache,target=/app/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv venv $VIRTUAL_ENV && \
    uv sync --no-install-project --no-editable $BUILD_GROUPS

# Copy what's needed to run collectstatic.
COPY myproj /app/myproj
COPY media /app/media
COPY manage.py /app/

RUN DEBUG=False ./manage.py collectstatic --noinput

### FINAL IMAGE ###

FROM python:3.13-slim

ARG PORT=8000
ENV DJANGO_SETTINGS_MODULE=myproj.settings \
    PATH="/venv/bin:$PATH" \
    PORT=${PORT} \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    VIRTUAL_ENV=/venv

EXPOSE ${PORT}
ENTRYPOINT ["/bin/bash", "/app/bin/run"]
CMD ["prod"]

WORKDIR /app

RUN <<EOT
apt-get clean -y && \
apt-get update -y && \
apt-get install -y --no-install-recommends \
	# OS dependencies, e.g. bash, db clients, etc.
    bash && \
apt-get autoremove -y && \
apt-get clean -y && \
rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
EOT

# Copy selectively from builder to optimize final image.
# --link enables better layer caching when base image changes
COPY --link --from=builder /venv /venv
COPY --link --from=builder /app/myproj /app/myproj
COPY --link --from=builder /app/static /app/static
COPY --link --from=builder /app/manage.py /app/manage.py
```
By explicitly copying only the files needed for runtime, as opposed to copying the full directory into the image, you avoid accidentally including development artifacts, temporary files, CI/CD build outputs, or other cruft that bloats the image size and potentially exposes sensitive information. This approach ensures a clean, minimal production image that contains only what's necessary to run the application.

## Wrapping up

Switching to `uv` has meaningfully improved my Docker build performance and made dependency management more predictable and secure. Whether you're optimizing for faster CI runs, tighter image sizes, or better control over your dependency graph, `uv` delivers on all fronts. The Docker patterns shared here have worked well in production, and hopefully they'll help you simplify and speed up your own deployments too.

If you're experimenting with `uv` or have your own best practices, I'd love to hear them. Feel free to reach out.
