# /practice-plan — Generate a complete BDU practice plan as an HTML page

You are a soccer coaching assistant helping build the BDU (Blue Devils U) coaching library. Generate a complete, ready-to-use practice session plan and save it as a properly-formatted BDU HTML page.

## Step 1: Gather inputs (ask if not provided)

Ask for:
1. **Session focus** — what is the main theme? (e.g., "pressing triggers", "finishing under pressure", "switching the point of attack", "1v1 defending", "combination play in the final third")
2. **Age group / team** — (e.g., U10, U12, U14, U16, high school)
3. **Session duration** — total practice time in minutes (e.g., 60, 75, 90)
4. **Number of players** — approximate roster size
5. **Any constraints** — limited space? No goals? Specific players to focus on? Tie-in to last game?

## Step 2: Generate the session plan content

Based on the inputs, design a complete practice session with these components. Use your soccer coaching knowledge — make the drills specific, age-appropriate, and pedagogically sound:

### Session objectives (2-3 clear, measurable outcomes)
What players will be able to do by the end of practice.

### Warm-up (10-15 min)
- Dynamic movement routine (reference the standard BDU warm-up from `current-practice.html` for the physical portion)
- Ball work warm-up that introduces the session theme (rondos, passing patterns, etc.)
- Coaching cue to set the tone

### Technical activity (15-20 min)
- A focused drill directly building the skill
- Setup description (grid size, player positions, equipment)
- Progressions (easy → hard)
- Key coaching points (3-4 bullet points)

### Tactical / functional activity (15-20 min)
- A small group activity (4v4, 5v5, or functional shape) applying the skill in context
- Rules or constraints that force the theme
- Coaching points and common errors to watch for

### Small-sided game (15-20 min)
- Full SSG (e.g., 7v7 or full numbers) with a rule or condition that rewards the session theme
- How to coach it live without stopping play too much

### Cool-down / debrief (5 min)
- Light stretch
- 1-2 questions to ask the players to reinforce the session theme
- Connection to next session or upcoming game

## Step 3: Create the HTML file

Save as `BDU/practice-YYYY-MM-DD-[slug].html` where slug is 2-3 words from the focus topic (e.g., `practice-2026-04-14-pressing-triggers.html`).

Use this exact BDU HTML structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BDU Soccer - [Session Focus]</title>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
<header>
    <div class="highlight-banner">
        <img src="images/INDEPENDENCE%20BDU_SHIELD_WHITE_small.png" alt="BDU Logo">
        <h1>[Session Focus] — [Date]</h1>
    </div>
</header>

<div class="waffle-menu-toggle" onclick="toggleWaffleMenu()">
    <span></span><span></span><span></span>
</div>
<div id="waffleMenuContainer"></div>
<div id="training-menu"></div>
<script>
    fetch('menus/index-menu.html')
        .then(r => r.text())
        .then(data => {
            document.getElementById('training-menu').innerHTML = data;
            const current = window.location.pathname.split('/').pop();
            document.querySelectorAll('.menu-item').forEach(item => {
                if (item.getAttribute('href') === current) {
                    item.classList.add('active');
                    setTimeout(() => item.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' }), 100);
                }
            });
        });
</script>

<div class="container">

    <!-- Session Overview -->
    <section class="collapsible-section" id="session-overview">
        <h2 class="section-title">
            <i class="fas fa-clipboard-list"></i> Session Overview
            <button class="toggle-button" aria-expanded="true"><i class="fas fa-chevron-down"></i></button>
        </h2>
        <div class="collapsible-content" style="display:block;">
            <p><strong>Focus:</strong> [session focus]</p>
            <p><strong>Age Group:</strong> [age group] &nbsp;|&nbsp; <strong>Duration:</strong> [X] min &nbsp;|&nbsp; <strong>Players:</strong> [N]</p>
            <h3>Objectives</h3>
            <ul>
                <li>[Objective 1]</li>
                <li>[Objective 2]</li>
                <li>[Objective 3]</li>
            </ul>
        </div>
    </section>

    <!-- Warm-up -->
    <section class="collapsible-section" id="warmup">
        <h2 class="section-title">
            <i class="fas fa-dumbbell"></i> Warm-Up ([X] min)
            <button class="toggle-button" aria-expanded="false"><i class="fas fa-chevron-down"></i></button>
        </h2>
        <div class="collapsible-content">
            [warm-up content]
        </div>
    </section>

    <!-- Technical Activity -->
    <section class="collapsible-section" id="technical">
        <h2 class="section-title">
            <i class="fas fa-futbol"></i> Technical: [Drill Name] ([X] min)
            <button class="toggle-button" aria-expanded="false"><i class="fas fa-chevron-down"></i></button>
        </h2>
        <div class="collapsible-content">
            [technical drill content with setup, progressions, coaching points]
        </div>
    </section>

    <!-- Tactical Activity -->
    <section class="collapsible-section" id="tactical">
        <h2 class="section-title">
            <i class="fas fa-chess"></i> Tactical: [Activity Name] ([X] min)
            <button class="toggle-button" aria-expanded="false"><i class="fas fa-chevron-down"></i></button>
        </h2>
        <div class="collapsible-content">
            [tactical activity content]
        </div>
    </section>

    <!-- Small-Sided Game -->
    <section class="collapsible-section" id="ssg">
        <h2 class="section-title">
            <i class="fas fa-trophy"></i> Small-Sided Game ([X] min)
            <button class="toggle-button" aria-expanded="false"><i class="fas fa-chevron-down"></i></button>
        </h2>
        <div class="collapsible-content">
            [SSG content with format, conditions, coaching approach]
        </div>
    </section>

    <!-- Debrief -->
    <section class="collapsible-section" id="debrief">
        <h2 class="section-title">
            <i class="fas fa-comments"></i> Debrief ([X] min)
            <button class="toggle-button" aria-expanded="false"><i class="fas fa-chevron-down"></i></button>
        </h2>
        <div class="collapsible-content">
            [cool-down and debrief questions]
        </div>
    </section>

</div>

<script src="scripts/scripts.js"></script>
</body>
</html>
```

Fill in all `[placeholders]` with the generated session content. Write in a direct coaching voice — clear, specific, practical. Not generic. Use real drill names, real measurements (yards/meters), real player counts.

## Step 4: Update the search index

After saving the file, run:
```
cd /Users/aaronglass/git/aaglass20.github.io/BDU
python3 scripts/update-search-index.py
```

## Step 5: Commit

```
git add BDU/practice-YYYY-MM-DD-[slug].html BDU/search-index.json
git commit -m "BDU: add practice plan — [session focus] ([date])"
```

Then ask if the user wants to push.

## Quality bar
- Drills must have specific setup instructions (grid size, player roles, equipment needed)
- Coaching points must be actionable ("show for the ball before it arrives" not "be aware")
- Progressions must actually build on each other
- Time allocations must add up to the total session duration
- Language and complexity must match the age group
