# Contributing to JobPilot

First off, thank you for considering contributing to JobPilot! It's people like you that make JobPilot such a great platform for career development.

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the [issue list](https://github.com/logicbyroshan/jobpilot/issues) as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title**
* **Describe the exact steps which reproduce the problem**
* **Provide specific examples to demonstrate the steps**
* **Describe the behavior you observed after following the steps**
* **Explain which behavior you expected to see instead and why**
* **Include screenshots and animated GIFs if possible**
* **Include your environment details** (OS, Python version, Node.js version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* **Use a clear and descriptive title**
* **Provide a step-by-step description of the suggested enhancement**
* **Provide specific examples to demonstrate the steps**
* **Describe the current behavior and expected behavior**
* **Explain why this enhancement would be useful**

### Pull Requests

* Fill in the required template
* Follow the code style guide (see below)
* End all files with a newline
* Avoid platform-dependent code
* Document new code with comments
* Write meaningful commit messages
* Include tests for new functionality

## Development Setup

### Prerequisites
- **Python**: 3.11+
- **Node.js**: 18+
- **npm**: Latest LTS

### Backend Setup

1. **Clone and navigate to the API directory**
```bash
git clone https://github.com/YOUR-USERNAME/jobpilot.git
cd jobpilot/apps/api
```

2. **Create and activate Python virtual environment**
```bash
python -m venv .venv

# On Windows (PowerShell):
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Initialize the database**
```bash
python ../../scripts/seed.py
```

5. **Start the development server**
```bash
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

1. **Navigate to the web directory**
```bash
cd jobpilot/apps/web
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

### Create a feature branch
```bash
git checkout -b feature/your-feature-name
```

### Make your changes and commit
```bash
git add .
git commit -m "feat: add your feature description"
```

### Push to your fork
```bash
git push origin feature/your-feature-name
```

### Create a Pull Request
- Go to the original repository and create a Pull Request
- Describe your changes clearly
- Reference any related issues with `fixes #123`

## Style Guide

### Commit Messages

* Use the imperative mood ("add feature" not "added feature")
* Use the present tense ("move cursor to..." not "moved cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line

**Format:**
```
<type>: <subject>

<body>

<footer>
```

**Types:**
- `feat:` A new feature
- `fix:` A bug fix
- `docs:` Documentation only changes
- `style:` Changes that do not affect the meaning of the code (formatting, etc)
- `refactor:` A code change that neither fixes a bug nor adds a feature
- `perf:` A code change that improves performance
- `test:` Adding missing tests or correcting existing tests
- `chore:` Changes to build process, dependencies, or tools

### Python Style

* Follow PEP 8 guidelines
* Use 4 spaces for indentation
* Use meaningful variable names
* Add docstrings to functions and classes
* Use type hints where appropriate

## Testing

* Write tests for new features
* Ensure all tests pass before submitting a PR
* Run backend tests: `pytest apps/api/tests -v`
* Run frontend build: `npm run build --prefix apps/web`
* Aim for at least 80% code coverage on new code

## Documentation

* Update README.md if you change functionality
* Add docstrings to new Python functions
* Add JSDoc comments to new TypeScript functions
* Update architecture documentation if you change system design
* Include examples for new features

## Licensing

By contributing to JobPilot, you agree that your contributions will be licensed under its MIT License.

---

**Thank you for contributing to JobPilot! 🎉**