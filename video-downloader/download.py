#!/usr/bin/env python3
"""
Video downloader for TikTok, Instagram, and Facebook.
Requires: pip install yt-dlp
Usage: python download.py <URL> [--name FILENAME]
"""

import argparse
import os
import sys

DOWNLOADS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "downloads")


def download(url: str, name=None) -> None:
    try:
        import yt_dlp
    except ImportError:
        print("yt-dlp not found. Run: pip install yt-dlp")
        sys.exit(1)

    os.makedirs(DOWNLOADS_DIR, exist_ok=True)

    if name:
        # Strip any extension the user typed — yt-dlp adds the correct one
        name = os.path.splitext(name)[0]
        outtmpl = os.path.join(DOWNLOADS_DIR, f"{name}.%(ext)s")
    else:
        outtmpl = os.path.join(DOWNLOADS_DIR, "%(title)s.%(ext)s")

    ydl_opts = {
        "outtmpl": outtmpl,
        # Best quality with audio merged into a single file
        "format": "bestvideo+bestaudio/best",
        "merge_output_format": "mp4",
        # Instagram / Facebook sometimes require cookies — skip unavailable content gracefully
        "ignoreerrors": True,
        "quiet": False,
        "no_warnings": False,
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        print(f"\nDownloading: {url}")
        ydl.download([url])

    print(f"\nSaved to: {DOWNLOADS_DIR}/")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Download TikTok / Instagram / Facebook videos with audio."
    )
    parser.add_argument("url", help="Video URL (TikTok, Instagram, or Facebook)")
    parser.add_argument(
        "--name", "-n", help="Output filename (no extension needed)", default=None
    )
    args = parser.parse_args()

    download(args.url, args.name)


if __name__ == "__main__":
    main()
