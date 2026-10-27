"""
Git AST Diff and Code Structure Inspector.
Analyzes Python source trees to detect semantic structural flaws (locks, context managers, kwarg signatures).
"""

import ast
from pathlib import Path
from typing import Dict, Any, List

class CodeASTInspector:
    def analyze_file(self, file_path: Path) -> Dict[str, Any]:
        if not file_path.exists():
            return {"error": f"File {file_path} not found"}

        with open(file_path, "r", encoding="utf-8") as f:
            code = f.read()

        try:
            tree = ast.parse(code, filename=str(file_path))
        except SyntaxError as e:
            return {"error": f"SyntaxError parsing {file_path}: {e}"}

        functions: List[Dict[str, Any]] = []
        classes: List[Dict[str, Any]] = []
        async_locks_used: List[str] = []
        calls_with_kwargs: List[Dict[str, Any]] = []

        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                functions.append({
                    "name": node.name,
                    "is_async": isinstance(node, ast.AsyncFunctionDef),
                    "line": node.lineno,
                    "args": [arg.arg for arg in node.args.args]
                })
            elif isinstance(node, ast.ClassDef):
                classes.append({
                    "name": node.name,
                    "line": node.lineno
                })
            elif isinstance(node, ast.AsyncWith):
                # Inspect context managers
                for item in node.items:
                    expr_str = ast.unparse(item.context_expr)
                    async_locks_used.append(expr_str)
            elif isinstance(node, ast.Call):
                if node.keywords:
                    func_name = ast.unparse(node.func)
                    calls_with_kwargs.append({
                        "func": func_name,
                        "line": node.lineno,
                        "keywords": [kw.arg for kw in node.keywords if kw.arg]
                    })

        return {
            "file": str(file_path).replace("\\", "/"),
            "classes": classes,
            "functions": functions,
            "async_contexts": async_locks_used,
            "calls_with_kwargs": calls_with_kwargs,
            "total_lines": len(code.splitlines())
        }

code_ast_inspector = CodeASTInspector()
