# Play from Video (Lab) — How to Use

A hidden feature of the tactics board: give it a video clip of a drill, and Claude (Anthropic's AI) drafts it as a play you can edit and save.

---

## 1. Turn it on

The feature is hidden from everyone until you turn it on in your own browser.

| Where | Address |
|---|---|
| Live site | `https://aaglass20.github.io/tactics/?lab=1` |
| Local dev (`npm run dev`) | `http://localhost:5174/tactics/?lab=1` |

- You only need `?lab=1` **once per browser / device**. After that the button stays on.
- To hide it again, visit the same address with `?lab=0`.
- The live site only has it after the feature has been deployed (`npm run deploy`, then commit and push).

## 2. Open it

- **Desktop:** the gold **🎬 From video** button at the top, next to Save and Open.
- **Phone:** tap **⋯** (top right), then **🎬 Play from video**.

## 3. Draft a play

1. **Switch to the right sport first.** The draft uses the current sport's objects and fields.
2. Click **📁 Choose video file** and pick the clip. An **.mp4** works best.
   - You can paste a direct `.mp4` link instead, but many sites block this.
   - **YouTube and Vimeo links don't work.** Download the clip first.
3. Trim to one drill: play the video, then click **Start here** and **End here**. Under a minute works best.
4. *(Optional)* Tell Claude what it's looking at, for example: *"4v2 rondo in a 15×15 yd grid; blue bibs are defenders; camera is behind the goal."* Notes like this make the result noticeably better.
5. *(Optional)* Pick the number of **Frames**. 16 is the default; use more for longer or faster drills.
6. Paste your **Anthropic API key** (see section 5). Tick **Remember on this device** so you don't have to paste it every time.
7. Click **Analyze clip**. It usually takes about a minute. **Stop** cancels it.

## 4. Use the result

You'll see a small top-down preview, the drill name, a summary, the steps and the frames Claude looked at.

- **Open on board:** loads it like any saved play, ready to move, lock, animate and edit. It replaces what's on the board, and asks first if the board isn't empty.
- **💾 Save file:** saves it as a normal play `.json` to open later with **📂 Open**.
- **Draw arrows for runs and passes:** tick it to add arrows to the draft.
- **Try again:** go back and change the trim, notes or frames.

**What to expect:** it's a first draft, not a perfect copy. Overhead or elevated camera angles come out closest. Low sideline or TV angles get the setup roughly right, with movements approximate.

## 5. Getting an Anthropic API key

An **API key** is a password that lets an app use Claude and bills that use to your account. The board needs one because it sends the clip's frames to Claude to analyze.

> It's **separate from a Claude.ai chat subscription.** Even with Claude Pro, the API is billed on its own, pay as you go.

**To get one:**

1. Go to **https://console.anthropic.com** and sign up or log in.
2. Open **Billing**, add a payment method and buy some credits. **$5 is plenty** to start; each analysis costs roughly **$0.10–$0.40**.
3. Open **API Keys** → **Create Key**. Name it something like `tactics board`.
4. **Copy the key right away.** It starts with `sk-ant-…`, and the console won't show it again.
5. Paste it into the **Anthropic API key** box in the video dialog.

**Keep it safe:**

- Treat it like a password. Anyone with it can spend your credits.
- Don't share it, email it or put it in the code or repo.
- The board keeps it only in your own browser, and only if you tick "Remember on this device".
- If it leaks or you lose it: in the console, **delete** the key under **API Keys** and create a new one.
- Optional: set a monthly **spend limit** in the console (under **Limits**) so testing can never cost more than you expect.

## 6. Troubleshooting

| Message | What to do |
|---|---|
| "That API key was not accepted" | Re-copy the key, or create a new one in the console. |
| "This API key is not allowed to use that model" / billing errors | Check the console under Billing that you have credits. |
| "Rate limited" | Wait a minute and try again. |
| "That link does not allow its frames to be read" / link won't play | Download the video and use **Choose video file**. |
| "This browser can't play that video" | Convert it to a standard .mp4 (H.264). |
| "The answer was cut off" | Trim the clip shorter or pick fewer frames. |
| "Claude couldn't find a drill to draw" | Make sure the clip shows the drill clearly; add notes describing it. |
| Don't see the 🎬 button | Visit the board once with `?lab=1` (each browser / device needs it once). |

---

*Technical details (prompt, data format, how the draft becomes a play) are in `DESIGN.md` → "Lab: Play from Video".*
