#!/bin/bash
# ── Repo Launcher ──────────────────────────────────────────
# Run from anywhere: bash run.sh  OR  ./run.sh
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

GREEN="\033[0;32m"
BLUE="\033[0;34m"
GOLD="\033[0;33m"
BOLD="\033[1m"
RESET="\033[0m"

header() {
  echo ""
  echo -e "${BLUE}${BOLD}╔══════════════════════════════════════════╗${RESET}"
  echo -e "${BLUE}${BOLD}║        aaglass20.github.io Launcher      ║${RESET}"
  echo -e "${BLUE}${BOLD}╚══════════════════════════════════════════╝${RESET}"
  echo ""
}

menu() {
  echo -e "${BOLD}  Pick a tool to run:${RESET}"
  echo ""
  echo -e "  ${GOLD}1)${RESET} 🎬  Video Downloader     ${GREEN}(opens browser UI at localhost:8765)${RESET}"
  echo -e "  ${GOLD}2)${RESET} 📹  Add Videos to BDU    ${GREEN}(interactive — adds new .mp4s to HTML pages)${RESET}"
  echo -e "  ${GOLD}3)${RESET} 🔄  Update BDU Index      ${GREEN}(rebuilds search-index.json)${RESET}"
  echo ""
  echo -e "  ${GOLD}q)${RESET} Quit"
  echo ""
}

run_video_downloader() {
  echo ""
  echo -e "${GREEN}Starting Video Downloader...${RESET}"
  bash "$REPO/video-downloader/start.sh"
}

run_add_videos() {
  echo ""
  echo -e "${GREEN}Launching Add Videos wizard...${RESET}"
  echo ""
  cd "$REPO/BDU" && zsh add-videos.sh
}

run_update_index() {
  echo ""
  echo -e "${GREEN}Updating BDU Search Index...${RESET}"
  bash "$REPO/BDU/UPDATE-INDEX.sh"
}

header

while true; do
  menu
  read -rp "  → " choice
  case "$choice" in
    1) run_video_downloader; break ;;
    2) run_add_videos; break ;;
    3) run_update_index; break ;;
    q|Q) echo ""; echo "  Bye!"; echo ""; exit 0 ;;
    *) echo -e "\n  ${GOLD}Invalid choice — try again.${RESET}" ;;
  esac
done