#!/bin/zsh
#
# add-videos.sh — Adds new (untracked) videos from BDU/vid/ to the best-matching HTML page
#
# Usage:
#   cd BDU && ./add-videos.sh              # interactive mode
#   ./add-videos.sh --auto                 # auto-accept all defaults
#   ./add-videos.sh cleanFirstTouch.mp4    # add a specific video only
#   ./add-videos.sh --auto cleanFirstTouch.mp4

# Resolve BDU directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BDU_DIR="$SCRIPT_DIR"
if [[ ! -f "$BDU_DIR/defensive-drills.html" ]]; then
    BDU_DIR="$SCRIPT_DIR/BDU"
fi
cd "$BDU_DIR"

# ── Parse flags ──
AUTO=false
file_args=()
for arg in "$@"; do
    if [[ "$arg" == "--auto" ]]; then
        AUTO=true
    else
        file_args+=("$arg")
    fi
done

# ── Helper: split filename into searchable keywords ──
split_keywords() {
    local name="$1"
    name="${name%.mp4}"
    # camelCase → spaces
    name=$(echo "$name" | sed 's/\([a-z]\)\([A-Z]\)/\1 \2/g')
    # underscores/hyphens → spaces
    name=$(echo "$name" | tr '_-' '  ')
    echo "$name" | tr '[:upper:]' '[:lower:]'
}

# ── Helper: title-case keywords ──
make_title() {
    echo "$1" | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) tolower(substr($i,2))}1'
}

# ── Helper: make slug id ──
make_id() {
    echo "$1" | tr ' ' '-'
}

# ── Get page keywords ──
get_page_keywords() {
    local page="$1"
    case "$page" in
        defensive-drills.html) echo "defend defense defensive def tackle closing stance marking pressure cover block" ;;
        defensive-tactics.html) echo "contact physical body tackle low get tackle" ;;
        offensive-drills.html) echo "offensive attack attacking forward goal score finish" ;;
        offensive-tactics.html) echo "offensive attack tactic combination" ;;
        dribbling.html) echo "dribble dribbling draw skill move ball carry" ;;
        1v1-moves.html) echo "1v1 one move feint fake technical trick" ;;
        footskills.html) echo "foot footwork skill step quick feet toe juggle soccer skills" ;;
        passing.html) echo "pass passing through weight delivery" ;;
        short-passing.html) echo "short pass passing quick one two" ;;
        faster-passing.html) echo "fast faster passing speed quick pass" ;;
        shooting.html) echo "shoot shooting shot strike finish" ;;
        power-shots.html) echo "power shot strike driven shoot plant" ;;
        one-touch-shots.html) echo "one touch shot finish first time" ;;
        receiving.html) echo "receive receiving trap control touch first clean" ;;
        ball-control.html) echo "control ball touch trap receive first clean" ;;
        trapping.html) echo "trap trapping control receive ball" ;;
        turns.html) echo "turn turning rotate spin move direction" ;;
        crossing.html) echo "cross crossing delivery wide wing service" ;;
        heading.html) echo "head heading header aerial" ;;
        scanning.html) echo "scan scanning awareness look decision" ;;
        setups.html) echo "setup movement position shot create space" ;;
        throw-in.html) echo "throw in throwing set piece" ;;
        corner-kick.html) echo "corner kick set piece" ;;
        goal-kick.html) echo "goal kick distribution" ;;
        kick-off.html) echo "kick off kickoff restart" ;;
        off-ball-runs.html) echo "off ball run runs movement space" ;;
        speed.html) echo "speed sprint fast agility quick" ;;
        conditioning-drills.html) echo "conditioning fitness endurance cardio stamina" ;;
        fun.html) echo "fun game physical fitness team" ;;
        possession.html) echo "possession keep hold rondo" ;;
        small-sided.html) echo "small sided game scrimmage box steps less" ;;
        team-drills.html) echo "team drill group session" ;;
        partner-drills.html) echo "partner drill two pair" ;;
        goalie-drills.html) echo "goalie goalkeeper keeper save dive" ;;
        goalkeeper.html) echo "goalie goalkeeper keeper" ;;
        juggling.html) echo "juggle juggling" ;;
        marking.html) echo "mark marking track runner" ;;
        striker-drills.html) echo "striker forward finish" ;;
        midfielder-drills.html) echo "midfielder midfield" ;;
        outside-back-drills.html) echo "outside back fullback wing back" ;;
        centerback-drills.html) echo "centerback center back cb" ;;
        indoor-training.html) echo "indoor inside" ;;
        transition-plan.html) echo "transition counter attack turnover" ;;
        set-pieces.html) echo "set piece free kick" ;;
        *) echo "" ;;
    esac
}

# ── Score a video against a page ──
score_page() {
    local keywords="$1"
    local page="$2"
    local score=0

    local page_kw=$(get_page_keywords "$page")
    for word in ${=keywords}; do
        [[ ${#word} -lt 3 ]] && continue
        for pk in ${=page_kw}; do
            if [[ "$word" == *"$pk"* ]] || [[ "$pk" == *"$word"* ]]; then
                score=$((score + 3))
            fi
        done
    done

    # Also check actual HTML file content
    if [[ -f "$page" ]]; then
        local page_content=$(tr '[:upper:]' '[:lower:]' < "$page")
        for word in ${=keywords}; do
            [[ ${#word} -lt 3 ]] && continue
            if echo "$page_content" | grep -q "$word"; then
                score=$((score + 1))
            fi
        done
    fi

    echo "$score"
}

# ── Find insertion line (before first collapsible-section) ──
find_insert_line() {
    local page="$1"
    grep -n '<section class="collapsible-section"' "$page" | head -1 | cut -d: -f1
}

# ── Generate HTML section block ──
generate_section() {
    local video_file="$1"
    local title="$2"
    local id="$3"
    local summary="$4"

    cat <<SECTION

    <section class="collapsible-section" id="$id">
        <h2 class="section-title">
            <i class="fas fa-futbol"></i> $title
            <button class="toggle-button" aria-expanded="false">
                <i class="fas fa-chevron-down"></i>
            </button>
        </h2>
        <p class="drill-summary">
            $summary
        </p>
        <ul>
            <div class="collapsible-content">
                <div class="video-container">
                    <video controls>
                        <source src="vid/$video_file" type="video/mp4">
                    </video>
                </div>
            </div>
        </ul>
    </section>
SECTION
}

# ── Main ──
echo "Scanning for new videos in vid/..."
echo ""

# Get list of videos to process
videos=()
if [[ ${#file_args[@]} -gt 0 ]]; then
    videos=("${file_args[@]}")
else
    # Find untracked mp4 files
    local raw_list=$(git ls-files --others --exclude-standard 'vid/*.mp4' 2>/dev/null)
    if [[ -n "$raw_list" ]]; then
        while IFS= read -r f; do
            [[ -n "$f" ]] && videos+=("${f#vid/}")
        done <<< "$raw_list"
    fi
fi

if [[ ${#videos[@]} -eq 0 ]]; then
    echo "No new videos found."
    exit 0
fi

echo "Found ${#videos[@]} new video(s):"
for v in "${videos[@]}"; do
    echo "  - $v"
done
echo ""

# Collect HTML pages with collapsible sections
pages=()
local raw_pages=$(grep -rl 'collapsible-section' *.html 2>/dev/null | sort)
while IFS= read -r p; do
    [[ -n "$p" ]] && pages+=("$p")
done <<< "$raw_pages"

for video in "${videos[@]}"; do
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Processing: $video"

    keywords=$(split_keywords "$video")
    title=$(make_title "$keywords")
    id=$(make_id "$keywords")
    echo "  Keywords: $keywords"
    echo "  Title:    $title"

    # Score all pages
    best_page=""
    best_score=0

    for page in "${pages[@]}"; do
        s=$(score_page "$keywords" "$page")
        if [[ $s -gt 0 ]]; then
            echo "    $page: $s pts"
        fi
        if [[ $s -gt $best_score ]]; then
            best_score=$s
            best_page=$page
        fi
    done

    if [[ $best_score -eq 0 ]]; then
        echo ""
        echo "  WARNING: No matching page found."
        if [[ "$AUTO" == true ]]; then
            echo "  Skipping (no match in auto mode)."
            continue
        fi
        printf '    %s\n' "${pages[@]}"
        echo -n "  Enter page name manually (or Enter to skip): "
        read manual_page
        if [[ -z "$manual_page" ]]; then
            continue
        fi
        best_page="$manual_page"
    fi

    echo ""
    echo "  >> Best match: $best_page (score: $best_score)"
    echo ""

    default_summary="$title"

    if [[ "$AUTO" == false ]]; then
        echo -n "  Title [$title]: "
        read custom_title
        [[ -n "$custom_title" ]] && title="$custom_title"

        echo -n "  Summary [$default_summary]: "
        read custom_summary
        [[ -n "$custom_summary" ]] && default_summary="$custom_summary"

        echo -n "  Target page [$best_page]: "
        read custom_page
        [[ -n "$custom_page" ]] && best_page="$custom_page"
    fi

    section_html=$(generate_section "$video" "$title" "$id" "$default_summary")

    echo "  Preview:"
    echo "$section_html"
    echo ""

    if [[ "$AUTO" == false ]]; then
        echo -n "  Insert into $best_page? [Y/n]: "
        read confirm
        if [[ "$confirm" =~ ^[Nn] ]]; then
            echo "  Skipped."
            continue
        fi
    fi

    # Insert at top of sections list
    insert_line=$(find_insert_line "$best_page")
    if [[ -z "$insert_line" ]]; then
        echo "  ERROR: Could not find insertion point in $best_page"
        continue
    fi

    {
        head -n $((insert_line - 1)) "$best_page"
        echo "$section_html"
        tail -n +"$insert_line" "$best_page"
    } > "${best_page}.tmp"
    mv "${best_page}.tmp" "$best_page"

    echo "  ADDED to $best_page (inserted before line $insert_line)"
    echo ""

    # ── Wizard: also add to current-practice.html? ──
    add_to_practice=false
    if [[ "$AUTO" == true ]]; then
        add_to_practice=true
    else
        echo -n "  Also add to current-practice.html? [Y/n]: "
        read practice_confirm
        if [[ ! "$practice_confirm" =~ ^[Nn] ]]; then
            add_to_practice=true
        fi
    fi

    if [[ "$add_to_practice" == true ]]; then
        # Find the closing </div> of the container (last </div> before the shared-footer)
        practice_file="current-practice.html"
        # Insert before the container closing </div> — find it by looking for the line
        # right before <div id="shared-footer">
        practice_insert=$(grep -n '<div id="shared-footer">' "$practice_file" | head -1 | cut -d: -f1)
        if [[ -n "$practice_insert" ]]; then
            # Go one line up to insert before the closing </div>
            practice_insert=$((practice_insert - 1))
            # Insert before that closing </div> — so section goes at the bottom
            {
                head -n $((practice_insert - 1)) "$practice_file"
                echo "$section_html"
                echo ""
                tail -n +"$practice_insert" "$practice_file"
            } > "${practice_file}.tmp"
            mv "${practice_file}.tmp" "$practice_file"
            echo "  ADDED to current-practice.html (bottom, before line $practice_insert)"
        else
            echo "  ERROR: Could not find insertion point in current-practice.html"
        fi
    fi
    echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Done!"
