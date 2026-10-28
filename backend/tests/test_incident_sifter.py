import pytest
from backend.src.services.incident_sifter import incident_sifter

def test_stacktrace_parser_python():
    sample_trace = """Traceback (most recent call last):
  File "server/api.py", line 42, in handle_request
    result = compute_balance(account_id)
  File "src/workers/queue_processor.py", line 87, in compute_balance
    return balance / total_shares
ZeroDivisionError: division by zero"""

    mock_tree = [
        "README.md",
        "server/api.py",
        "src/workers/queue_processor.py",
        "tests/test_worker.py"
    ]

    res = incident_sifter.parse_user_stacktrace(sample_trace, mock_tree, "Manthan-cpp/GramRaksha-AI")
    assert res is not None
    assert res["failingFile"] == "src/workers/queue_processor.py"
    assert res["failingLine"] == 87
    assert res["exceptionType"] == "ZeroDivisionError"
    assert "division by zero" in res["errorMessage"]
    assert res["sourceMode"] == "manual_stacktrace"

def test_stacktrace_parser_javascript():
    sample_trace = """TypeError: Cannot read properties of undefined (reading 'token')
    at Authenticator.verify (src/auth/jwt.ts:34:12)
    at handleRequest (src/server/handler.ts:55:18)"""

    mock_tree = [
        "package.json",
        "src/auth/jwt.ts",
        "src/server/handler.ts"
    ]

    res = incident_sifter.parse_user_stacktrace(sample_trace, mock_tree, "Manthan-cpp/GramRaksha-AI")
    assert res is not None
    assert res["failingFile"] == "src/auth/jwt.ts"
    assert res["failingLine"] == 34
    assert res["exceptionType"] == "TypeError"

def test_sift_github_issues():
    mock_issues = [
        {
            "number": 12,
            "title": "Deadlock occurring during concurrent payments",
            "body": "When multiple requests call src/workers/queue_processor.py, workers freeze.",
            "labels": [{"name": "bug"}, {"name": "critical"}],
            "html_url": "https://github.com/Manthan-cpp/GramRaksha-AI/issues/12"
        }
    ]
    mock_tree = ["src/workers/queue_processor.py", "package.json"]

    scenarios = incident_sifter.sift_github_issues_and_ci(mock_issues, [], mock_tree, "Manthan-cpp/GramRaksha-AI")
    assert len(scenarios) == 1
    assert scenarios[0]["code"] == "ISSUE-#12"
    assert scenarios[0]["failingFile"] == "src/workers/queue_processor.py"
    assert "P0" in scenarios[0]["diagnosticReport"]["businessImpact"]["severity"]
