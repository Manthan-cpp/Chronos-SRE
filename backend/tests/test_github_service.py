import pytest
from backend.src.services.github_service import github_service

def test_repo_normalization():
    assert github_service._normalize_repo("https://github.com/Manthan-cpp/Chronos-SRE.git") == "Manthan-cpp/Chronos-SRE"
    assert github_service._normalize_repo("https://github.com/Manthan-cpp/Chronos-SRE") == "Manthan-cpp/Chronos-SRE"
    assert github_service._normalize_repo("Manthan-cpp/Chronos-SRE") == "Manthan-cpp/Chronos-SRE"
    assert github_service._normalize_repo("owner/repo") == "Manthan-cpp/Chronos-SRE"
    assert github_service._normalize_repo(None) == "Manthan-cpp/Chronos-SRE"
