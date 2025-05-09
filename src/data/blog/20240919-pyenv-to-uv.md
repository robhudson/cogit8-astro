---
title: "From pyenv to uv: Streamlining Python Management"
author: Rob Hudson
pubDatetime: 2024-09-19T12:00:00-08:00
slug: 2024-09-19-pyenv-to-uv
tags:
  - python
description:
  A quick guide on transitioning from pyenv to Astral's uv, highlighting its speed, unified
  workflow, and tips for setting up Python environments efficiently.

---

Managing Python versions and project dependencies is a crucial aspect of Python development. For
years, I relied on `pyenv` for Python version management and `pyenv-virtualenv` for creating
isolated environments. This setup served me well, handling most of my development needs efficiently.
That changed when I read about `uv`, Astral’s ambitious new tool.

> Astral's `uv` is a Python management tool that promises to simplify and speed up your workflow by
combining version management, virtual environments, tool installation, and more into a single
command-line interface.

Astral's `uv` caught my attention when it was first announced. Astral's constant drive to improve
and enhance `ruff` led me to watch future development and I was particularly excited about `uv`'s
promise of speed and use-cases.  I've been keeping an eye on `uv`'s development and initially began
using it simply as a `pipx` replacement. However, with the latest blog post, ["uv: Unified Python
packaging"](https://astral.sh/blog/uv-unified-python-packaging), I decided to go all in and see how
a complete transition would pan out.

## 🫶🏽 What I like about `uv`

### Speed

You'll notice this immediately when you install Python packages. `uv` is blazingly fast and rips
through installing or compiling requirements files.

### All-in-one tool for a unified workflow

I like that I can learn one tool for managing my Python versions, managing my packages, managing
virtualenvs, installing tools, running one-off scripts. There’s less cognitive load when compared to
remembering how I installed `pyenv` via Homebrew, and `pipx` through `pip` from the default Python
installation. Everything is managed with a single tool, reducing cognitive overhead.

## 🚧 Under construction

Each system will vary but these are some of the things I did to get back to a relatively clean slate.

I was using a homebrew installed Python plus pyenv to install versions I needed for development and
testing of all supported Python versions, from 3.8 to 3.12. I also used pyenv-virtualenv to manage
isolated Python environments. Plus `pipx` for one-off tools like `ruff` and `pyupgrade`, or
`fasttyper` for fun.

I reviewed what I had installed. `pipx list` showed me everything to install using `uv tool`. And
`pyenv versions` shows me all the python versions, although I know I want all supported Python
versions installed. All of my virtualenvs are built from requirements files so I planned to update
those as I used them.

I started unraveling things and uninstalling...

* `pipx uninstall` each package
* Remove the `pyenv init` from my `.zshrc`
* `rm -rf $(pyenv root)`
* `brew uninstall pyenv-virtualenv pyenv`
* Removed any non-project directory `.python-version` files

With that I was left with 2 versions of Python on my system that I would let live and ignore going
forward.

* The Mac shipped Python 3.9.6
* The homebrew installed Python 3.12.5

I closed my shells and started a new one and ensured nothing was trying to load anything related to
`pyenv` before moving forward to building things back up.

## ⚙️ Setting up uv

I already had `uv` installed but I reviewed `uv`'s
[Installing uv](https://docs.astral.sh/uv/getting-started/installation/) docs to make sure I had an
updated version and had set up the shell autocompletion correctly.

Then I ran the following to install various Python versions:

```bash
# Update uv itself
uv self update

# See what uv says I have installed now:
# The output just shows the Mac and homebrew Python versions
uv python list

# Install all the Python versions
uv python install 3.8 3.9 3.10 3.11 3.12

# Check out python list again
uv python list
```

Next use `uv tool` to install all the packages I had with `pipx`.

```bash
uv tool install ruff
uv tool install pyupgrade
uv tool install --with tox-uv tox
uv tool install fasttyper
# etc

# See what you've installed once done
uv tool list

# Upgrade them often
uv tool upgrade --all
```

I wanted to make sure I was set up to develop and test a Python project, so I hopped over to
the django-csp directory and tried it out.

```bash
cd ~/git/django-csp

# Switch to using a venv instead of .python-version
rm .python-version
uv venv
source .venv/bin/activate

# Install the requirements for testing locally
uv pip install -e ".[tests]"

# Run tests
pytest
...
=== 159 passed in 1.15s ===
```

There may be a better or simpler way, but that works for me.

## ⚠️ Pitfalls

### uv-installed Python(s)

`uv` installs Python versions in its own managed environment, but unlike `pyenv`, it doesn't
automatically add the installed Python executables to your system's `PATH`. This means you can't just
run python directly unless you've set up a symlink or manually adjust your `PATH`.

To make uv-installed Python versions accessible, you need to symlink the Python executable or
manually add the path to your shell environment, like:
```bash
ln -s ~/.local/share/uv/python/cpython-3.8.20-macos-aarch64-none/bin/python3.8 \
  ~/.local/bin/python3.8
```

This process seems tedious, but thankfully [willkg](https://bluesock.org/~willkg/) has provided a great
[uv-python-symlink](https://github.com/willkg/dotfiles/blob/main/dotfiles/bin/uv-python-symlink)
script to do this for you. Just copy that file to your local system and run it. It'll look for all
installed Python executables in Astral's `uv python dir` directory, and symlink them to your
`~/.local/bin` directory, making the most recent one the default when you run `python`. 🎉

### Whither `pip`?

While `pyenv` provides different versions of Python, leaving `pip` to handle package management,
`uv` takes a more integrated approach. It encompasses not only Python versions but also virtual
environments and tooling, which means `pip` no longer stands alone as the primary means of managing
dependencies.

When using `uv`, `pip` still plays a crucial role inside virtual environments. You'll use `pip` as usual
to install project-specific packages within a `uv venv`.

However, for globally installed tools like `ruff` or `tox`, `pip` is quietly tucked away. `uv tool`
essentially replaces `pipx` as the go-to method for managing standalone Python tools. These tools are
installed in isolated environments managed by `uv` without the need for you to manually invoke `pip`.

There's also other related features I've yet to explore, like `uvx` and `uv run`.

📝 Conclusion

Transitioning from `pyenv` to Astral’s `uv` has been a refreshing change, simplifying my Python
workflow. By consolidating Python version management, virtual environments, and tool installations
into a single, fast tool, `uv` reduces the cognitive overhead of juggling multiple utilities. While
there are a few minor adjustments, like handling symlinks for Python executables, the overall
benefits far outweigh the initial setup efforts. If you're looking for a streamlined, efficient way
to manage your Python environments, I recommend giving `uv` a try.
