# Contributing to Chronos-SRE

Thank you for your interest in contributing to Chronos-SRE! We welcome contributions to enhance autonomous site reliability engineering, telemetry parsers, and agentic reasoning swarms.

---

## 🛠️ Development Setup

1. **Fork and Clone the Repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Chronos-SRE.git
   cd Chronos-SRE
   ```

2. **Backend Setup**
   ```bash
   # Install dependencies
   pip install -r backend/requirements.txt

   # Configure environment variables
   cp .env.example .env
   # Add your NEBIUS_API_KEY, TAVILY_API_KEY, and GITHUB_TOKEN
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

---

## 🧪 Testing Guidelines

Before opening a pull request, ensure all backend and frontend checks pass:

```bash
# Run backend pytest suite
pytest backend/tests/ -v

# Run frontend type-checking
cd frontend
npm run type-check   # or npx tsc --noEmit
```

---

## 📋 Pull Request Process

1. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Commit Changes**: Use clear, conventional commit messages (`feat: ...`, `fix: ...`, `refactor: ...`).
3. **Deterministic Verification**: Any code modifying the agent pipeline must maintain AST safety and zero-hallucination invariants.
4. **Submit PR**: Open a pull request against `main` with a clear description of the problem and your solution.

---

## ⚖️ Code of Conduct

We are committed to providing a welcoming, respectful, and inclusive environment. Please treat all contributors with kindness and professionalism.

## 📄 License

By contributing to Chronos-SRE, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).
