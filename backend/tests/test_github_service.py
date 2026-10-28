import pytest
from backend.src.services.github_service import github_service

def test_repo_normalization():
    assert github_service._normalize_repo("https://github.com/Manthan-cpp/Chronos-SRE.git") == "Manthan-cpp/Chronos-SRE"
    assert github_service._normalize_repo("https://github.com/Manthan-cpp/Chronos-SRE") == "Manthan-cpp/Chronos-SRE"
    assert github_service._normalize_repo("Manthan-cpp/Chronos-SRE") == "Manthan-cpp/Chronos-SRE"
    assert github_service._normalize_repo("owner/repo") == "Manthan-cpp/Chronos-SRE"
    assert github_service._normalize_repo(None) == "Manthan-cpp/Chronos-SRE"
    # Alias support for GramRaksha
    assert github_service._normalize_repo("Manthan-cpp/GramRaksha") == "Manthan-cpp/GramRaksha-AI"
    assert github_service._normalize_repo("GramRaksha") == "Manthan-cpp/GramRaksha-AI"

@pytest.mark.asyncio
async def test_repo_info_chronos():
    info = await github_service.get_repo_info("Manthan-cpp/Chronos-SRE")
    assert info["name"] == "Chronos-SRE"
    assert info["owner"] == "Manthan-cpp"
    assert "default_branch" in info
