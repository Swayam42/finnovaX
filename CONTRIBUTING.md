# Contributing to KFintech Nexus Portal

First off, thank you for considering contributing to the KFintech Nexus Portal! It's people like you that make this application robust and scalable.

## Development Workflow

1. **Fork** the repository and clone it locally.
2. **Branch** off of `main` for your feature or bug fix: `git checkout -b feature/my-awesome-feature`.
3. **Run Locally** using Docker Compose:
   ```bash
   docker-compose -f docker-compose.cpu.yml up --build -d
   ```
4. **Commit** your changes with clear, descriptive commit messages.
5. **Push** your branch to your fork.
6. **Open a Pull Request** against our `main` branch.

## Code Style & Standards
- We use **ESLint** and **Prettier** for the React and Node.js codebases.
- Python code should adhere to **PEP 8** standards.
- Ensure all automated AWS interactions continue to mock correctly against **LocalStack**. Please *never* commit real AWS credentials.

Thank you!
