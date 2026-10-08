import { useState } from 'react'

const ACCORDIONS = [
  {
    id: 'physical',
    icon: '🦽',
    title: 'Physical & Mobility Disabilities',
    subtitle: 'Wheelchair users, limb differences, spinal cord injuries, cerebral palsy (motor)',
    tips: [
      { icon: '👁️', text: 'Get to their eye level when talking — crouch or kneel rather than standing over a wheelchair user. This signals respect and makes conversation natural.' },
      { icon: '🚫', text: 'Never push or grab a wheelchair without asking first. It\'s an extension of their personal space. Always say "Can I help?" before touching.' },
      { icon: '🎯', text: 'Adapt activities for chair users — hand throws, ramp assists, and modified targets all count. A goal scored with hands is still a goal.' },
      { icon: '🛞', text: 'Watch for terrain challenges on grass fields. Help identify smooth paths and position participants strategically before activities start.' },
      { icon: '💪', text: 'Participants with limb differences often have impressive adaptive strategies — follow their lead on what works for them. Don\'t assume what they can or can\'t do.' },
    ],
  },
  {
    id: 'intellectual',
    icon: '🧩',
    title: 'Intellectual & Developmental Disabilities',
    subtitle: 'Down syndrome, intellectual disability, Williams syndrome, Prader-Willi',
    tips: [
      { icon: '🗣️', text: 'Use clear, short sentences with one instruction at a time. Wait for processing — it may take longer than you expect. Silence isn\'t confusion; it\'s thinking.' },
      { icon: '👏', text: 'Positive reinforcement works powerfully. Specific praise ("Great pass to Sarah!") is more effective than general praise ("Good job!").' },
      { icon: '🔁', text: 'Repetition builds confidence. Doing the same drill many times isn\'t boring to participants — it builds mastery and pride.' },
      { icon: '📸', text: 'Visual demonstrations are very effective. Show the skill alongside the instruction — don\'t rely on verbal-only directions.' },
      { icon: '❤️', text: 'Participants with Down syndrome are often highly social and thrive on connection. Prioritize relationship over skill — they\'ll try harder for someone they trust.' },
    ],
  },
  {
    id: 'asd',
    icon: '🌊',
    title: 'Autism Spectrum Disorder (ASD)',
    subtitle: 'Varies widely — from minimally verbal to fully verbal, from sensory-seeking to sensory-avoidant',
    tips: [
      { icon: '🌈', text: '"If you\'ve met one autistic person, you\'ve met one autistic person." Autism is a spectrum. Don\'t apply what worked with one participant to another without checking.' },
      { icon: '📢', text: 'Sensory environments matter. Loud noises, bright lights, crowds, and unexpected sounds can cause distress. If a participant covers their ears or withdraws, reduce sensory input first.' },
      { icon: '📋', text: 'Transitions can be hard. Warn participants before activity changes: "In two minutes, we\'re going to move to passing drills." Predictability reduces anxiety.' },
      { icon: '🚫', text: 'Don\'t take non-response personally. A participant who avoids eye contact or doesn\'t respond to their name isn\'t being rude — they\'re processing the world differently.' },
      { icon: '🎮', text: 'Some autistic participants are highly motivated by specific interests or systems (rules, scoring, patterns). Tap into these when you discover them — they unlock engagement.' },
      { icon: '😌', text: 'If a participant is having a hard moment (meltdown, shutdown, high distress): create calm space, lower your voice, reduce demands, and give time. Don\'t escalate or crowd them.' },
    ],
  },
  {
    id: 'deaf',
    icon: '👂',
    title: 'Deaf & Hard of Hearing',
    subtitle: 'Varies from mild hearing loss to profound deafness; may use ASL, hearing aids, cochlear implants, or lip reading',
    tips: [
      { icon: '👀', text: 'Always face the person when speaking. Many individuals who are Deaf or hard of hearing lip read — don\'t cover your mouth, turn away, or speak while walking.' },
      { icon: '✋', text: 'Get their visual attention before starting. A gentle wave in their field of vision or a tap on the shoulder (ask first) lets them know you\'re about to communicate.' },
      { icon: '💡', text: 'Use gestures, signals, and demonstrations extensively. Visual communication — point, mime, show — is often more effective than spoken words.' },
      { icon: '🔊', text: 'Don\'t assume a hearing aid or cochlear implant means they hear like you do. Background noise on a field or gym can still make verbal communication very difficult.' },
      { icon: '📝', text: 'If verbal communication isn\'t landing, writing or showing text on a phone can help. Have a notepad on hand.' },
    ],
  },
  {
    id: 'visual',
    icon: '👁️',
    title: 'Visual Impairments',
    subtitle: 'From low vision to total blindness; may use white canes, guide dogs, or other mobility aids',
    tips: [
      { icon: '🗣️', text: 'Speak your name when you approach: "Hi Marcus, it\'s Sarah!" Don\'t assume they\'ll recognize you by voice right away.' },
      { icon: '🤝', text: 'When offering physical guidance, let the person take your arm (at the elbow) rather than grabbing theirs. This gives them control of the movement.' },
      { icon: '🔔', text: 'Use sound cues where possible — clapping, whistles, beeping balls, or calling out location ("ball is to your right!"). Verbal description replaces visual information.' },
      { icon: '🚧', text: 'Describe the environment before activities: "There are three cones in a line ahead of you, about 8 feet away." Spatial awareness info reduces anxiety and improves confidence.' },
      { icon: '🐕', text: 'Never pet or interact with a guide dog without explicit permission from the handler. A working guide dog is doing a job — don\'t distract it.' },
    ],
  },
  {
    id: 'abi',
    icon: '🧠',
    title: 'Acquired Brain Injuries & Stroke',
    subtitle: 'May affect speech, memory, motor control, or emotional regulation; every individual presents differently',
    tips: [
      { icon: '⏳', text: 'Processing speed may be significantly slower. Give extra time for responses and movements. Never interpret slowness as disengagement or disinterest.' },
      { icon: '😤', text: 'Emotional lability (sudden tears or laughter unrelated to the situation) is common after brain injury. Respond calmly without drawing attention to it.' },
      { icon: '🔁', text: 'Short-term memory challenges mean participants may need the same instruction repeated multiple times in one session. Repeat kindly, without frustration.' },
      { icon: '💪', text: 'Fatigue comes faster than expected. Watch for signs of tiring (reduced engagement, head drooping, slower response) and offer rest without it being made obvious.' },
    ],
  },
]

export default function Volunteer() {
  const [openId, setOpenId] = useState(null)

  function toggle(id) {
    setOpenId(prev => prev === id ? null : id)
  }

  return (
    <main>
      <section className="vol-hero-band">
        <div className="hero-badge" style={{ position: 'relative' }}>🤝 Volunteer Resource</div>
        <span className="hero-sport-icon" style={{ fontSize: '3.5rem', display: 'block', margin: '.75rem 0', position: 'relative' }}>🌟</span>
        <h1 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 800, marginBottom: '.75rem', position: 'relative' }}>
          Volunteer <span style={{ color: 'var(--orange)' }}>Guide</span>
        </h1>
        <p style={{ fontSize: '1.05rem', opacity: .88, maxWidth: '580px', margin: '0 auto', lineHeight: 1.6, position: 'relative' }}>
          Everything you need to show up with confidence, connect with participants, and create a session they'll talk about all week.
        </p>
      </section>

      <div className="container-wide" data-testid="volunteer-home">

        {/* WHY YOU'RE HERE */}
        <div className="section-header" style={{ marginTop: '3rem' }}>
          <h2>Why You're Here</h2>
          <div className="section-divider"></div>
        </div>

        <div className="philosophy-banner">
          <blockquote>
            Those who have volunteered with Empower Sports know that you often leave feeling like you received more than you gave. Show up with an open heart, and the rest takes care of itself.
          </blockquote>
        </div>

        <div className="alert alert-blue" style={{ marginTop: '1.5rem' }}>
          <span>💡</span>
          <span>Your role isn't to be a perfect coach — it's to be a consistent, enthusiastic, caring presence. Participants remember how you made them feel long after the session ends.</span>
        </div>

        {/* CORE PRINCIPLES */}
        <div className="section-header" style={{ marginTop: '3.5rem' }}>
          <h2>Core Volunteer Principles</h2>
          <div className="section-divider"></div>
          <p>These eight principles are the foundation of the Empower Sports volunteer experience</p>
        </div>

        <div className="principle-grid">
          <div className="principle-card">
            <span className="principle-icon">😊</span>
            <h3>Patience Is a Superpower</h3>
            <p>What takes a typical athlete 2 seconds may take a participant 20. That's not a problem — that's the moment. Wait for it. Celebrate it. Never rush it.</p>
          </div>
          <div className="principle-card">
            <span className="principle-icon">🎯</span>
            <h3>Demonstrate, Don't Just Explain</h3>
            <p>Show the skill first. Verbal instructions alone often don't land. Get on the ground, pick up the ball, and do it with them.</p>
          </div>
          <div className="principle-card">
            <span className="principle-icon">🗣️</span>
            <h3>Simple Language</h3>
            <p>Short sentences. One instruction at a time. Wait for it to be processed before moving to the next step. Pause. Check in. Repeat if needed.</p>
          </div>
          <div className="principle-card">
            <span className="principle-icon">🤲</span>
            <h3>Always Ask Before Touching</h3>
            <p>"Can I help guide your arm?" — always ask. Physical prompting is sometimes helpful, but consent is non-negotiable. A nod or smile counts.</p>
          </div>
          <div className="principle-card">
            <span className="principle-icon">👁️</span>
            <h3>Read the Room</h3>
            <p>Watch for signs of frustration, sensory overload, or fatigue. If someone is struggling emotionally, step back. Space and a calm voice work better than pushing through.</p>
          </div>
          <div className="principle-card">
            <span className="principle-icon">🏆</span>
            <h3>Celebrate Everything</h3>
            <p>A toe touching the ball. A pass that didn't reach anyone. A moment of eye contact. All of these deserve genuine, enthusiastic celebration. Don't fake it — mean it.</p>
          </div>
          <div className="principle-card">
            <span className="principle-icon">🌊</span>
            <h3>Follow Their Energy</h3>
            <p>Some days a participant is fired up. Some days they want to sit and watch. Both are valid. Follow their lead, not the script. Connection over completion.</p>
          </div>
          <div className="principle-card">
            <span className="principle-icon">🔄</span>
            <h3>Adapt Everything</h3>
            <p>The drill in the playbook is a starting point. If a rule change, distance adjustment, or entirely different activity serves a participant better — do that. Flexibility is a skill.</p>
          </div>
        </div>

        {/* PERSON-FIRST LANGUAGE */}
        <div className="section-header" style={{ marginTop: '4rem' }}>
          <h2>Person-First Language</h2>
          <div className="section-divider"></div>
          <p>How we talk about disability reflects how we think about people</p>
        </div>

        <div className="card card-orange" style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '.97rem', lineHeight: 1.7, color: 'var(--gray-700)' }}>
            <strong style={{ color: 'var(--blue)' }}>Person-first language</strong> puts the person before their disability. It acknowledges that a disability is one characteristic — not the defining one. At Empower Sports, we always default to person-first language unless the individual has expressed a preference otherwise (some communities, like many in the Deaf and autistic communities, prefer identity-first language — "autistic person" rather than "person with autism." When in doubt, follow the individual's lead).
          </p>
        </div>

        <div className="dos-donts">
          <div className="dos-box">
            <h3>✓ Say This</h3>
            <ul className="dos-list">
              <li>Person with a disability</li>
              <li>Person who uses a wheelchair</li>
              <li>Person with Down syndrome</li>
              <li>Person with autism</li>
              <li>Person who is deaf / hard of hearing</li>
              <li>Person with an intellectual disability</li>
              <li>Person with cerebral palsy</li>
              <li>Participants / athletes / players</li>
              <li>Person who has had a stroke</li>
            </ul>
          </div>
          <div className="donts-box">
            <h3>✗ Avoid This</h3>
            <ul className="donts-list">
              <li>Disabled person / the disabled</li>
              <li>Wheelchair-bound / confined to a wheelchair</li>
              <li>Down's person / Downs kid</li>
              <li>Autistic / they're autistic (as a label in third-person)</li>
              <li>Deaf-mute / hearing impaired</li>
              <li>Mentally challenged / intellectually challenged</li>
              <li>Suffers from cerebral palsy</li>
              <li>Special needs athletes / specials</li>
              <li>Stroke victim</li>
            </ul>
          </div>
        </div>

        <div className="alert alert-orange" style={{ marginTop: '1.25rem' }}>
          <span>💡</span>
          <span><strong>When in doubt:</strong> use the person's name. "Marcus went for the ball!" is always better than any label.</span>
        </div>

        {/* WORKING WITH DIFFERENT ABILITIES */}
        <div className="section-header" style={{ marginTop: '4rem' }}>
          <h2>Working With Different Abilities</h2>
          <div className="section-divider"></div>
          <p>Every participant is different — these are starting-point guides, not labels to apply</p>
        </div>

        <div className="alert alert-blue">
          <span>📋</span>
          <span>Staff will brief volunteers on individual participants' needs before each session. These sections provide general background knowledge, not instructions for specific individuals.</span>
        </div>

        <div className="disability-accordion">
          {ACCORDIONS.map(({ id, icon, title, subtitle, tips }) => {
            const isOpen = openId === id
            return (
              <div key={id} className="accordion-item">
                <button
                  className={`accordion-trigger${isOpen ? ' open' : ''}`}
                  data-testid={`accordion-${id}`}
                  onClick={() => toggle(id)}
                >
                  <span className="accordion-trigger-icon">{icon}</span>
                  <div className="accordion-trigger-text">
                    <strong>{title}</strong>
                    <span>{subtitle}</span>
                  </div>
                  <span className="accordion-arrow">▼</span>
                </button>
                <div className={`accordion-body${isOpen ? ' open' : ''}`}>
                  <div className="accordion-tips">
                    {tips.map((tip, i) => (
                      <div key={i} className="accordion-tip">
                        <span className="tip-icon">{tip.icon}</span>
                        <span>{tip.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* NAVIGATING TOUGH MOMENTS */}
        <div className="section-header" style={{ marginTop: '4rem' }}>
          <h2>Navigating Tough Moments</h2>
          <div className="section-divider"></div>
          <p>How to respond when a participant is struggling — on the field or off</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', marginTop: '1.5rem' }}>

          <div className="card card-orange">
            <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '.75rem' }}>
              <span style={{ fontSize: '1.5rem' }}>😤</span>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--blue)' }}>Frustration &amp; Resistance</h3>
            </div>
            <p style={{ fontSize: '.88rem', color: 'var(--gray-600)', lineHeight: 1.6, marginBottom: '.75rem' }}>When a participant refuses an activity or shows frustration with a drill:</p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
              {['Don\'t push through — offer a short break first', 'Ask "Would you like to watch for a minute?"', 'Try a different version of the same skill', 'Involve a favorite peer or other participant', 'Alert a staff member if it escalates'].map((item, i) => (
                <li key={i} style={{ fontSize: '.87rem', color: 'var(--gray-700)', paddingLeft: '1.1rem', position: 'relative', lineHeight: 1.5 }}>
                  <span style={{ position: 'absolute', left: 0, color: 'var(--orange)', fontWeight: 700 }}>→</span> {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="card card-orange">
            <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '.75rem' }}>
              <span style={{ fontSize: '1.5rem' }}>🌊</span>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--blue)' }}>Sensory Overload Signs</h3>
            </div>
            <p style={{ fontSize: '.88rem', color: 'var(--gray-600)', lineHeight: 1.6, marginBottom: '.75rem' }}>Watch for these cues that a participant may be overwhelmed:</p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
              {['Covering ears or eyes', 'Withdrawing from the group', 'Stimming increasing (rocking, flapping, humming)', 'Meltdown or shutdown behavior', 'Sudden increase in agitation'].map((item, i) => (
                <li key={i} style={{ fontSize: '.87rem', color: 'var(--gray-700)', paddingLeft: '1.1rem', position: 'relative', lineHeight: 1.5 }}>
                  <span style={{ position: 'absolute', left: 0, color: 'var(--orange)', fontWeight: 700 }}>→</span> {item}
                </li>
              ))}
            </ul>
            <div className="coach-tip" style={{ marginTop: '.75rem' }}>When you see these signs: reduce noise, reduce demands, create quiet space, and get a staff member. Don't escalate or crowd the participant.</div>
          </div>

          <div className="card card-orange">
            <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '.75rem' }}>
              <span style={{ fontSize: '1.5rem' }}>😢</span>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--blue)' }}>Emotional Distress</h3>
            </div>
            <p style={{ fontSize: '.88rem', color: 'var(--gray-600)', lineHeight: 1.6, marginBottom: '.75rem' }}>When a participant is upset, crying, or emotionally dysregulated:</p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
              {['Lower your own voice and body posture', 'Sit at their level if they\'re seated', '"I\'m here. You\'re safe." — and mean it', 'Don\'t ask "what\'s wrong?" immediately — give space first', 'Always loop in staff — you shouldn\'t handle this alone'].map((item, i) => (
                <li key={i} style={{ fontSize: '.87rem', color: 'var(--gray-700)', paddingLeft: '1.1rem', position: 'relative', lineHeight: 1.5 }}>
                  <span style={{ position: 'absolute', left: 0, color: 'var(--orange)', fontWeight: 700 }}>→</span> {item}
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* DO'S AND DON'TS ON THE FIELD */}
        <div className="section-header" style={{ marginTop: '4rem' }}>
          <h2>On the Field: Do's &amp; Don'ts</h2>
          <div className="section-divider"></div>
        </div>

        <div className="dos-donts">
          <div className="dos-box">
            <h3>✓ Do This</h3>
            <ul className="dos-list">
              <li>Use the participant's first name often — it builds connection</li>
              <li>Celebrate loudly and specifically ("That was a great kick, Tyler!")</li>
              <li>Demonstrate skills alongside verbal explanation</li>
              <li>Ask before providing physical assistance</li>
              <li>Give one instruction at a time, then pause</li>
              <li>Keep energy high and playful — fun is the goal</li>
              <li>Adapt any drill on the fly if it's not working</li>
              <li>Let participants set the pace of progression</li>
              <li>Make eye contact and smile (even if not returned)</li>
              <li>Stay near your assigned participant throughout</li>
              <li>Involve yourself in activities — play alongside them</li>
              <li>Report concerns to staff immediately</li>
              <li>Arrive 15 minutes early and stay through cleanup</li>
            </ul>
          </div>
          <div className="donts-box">
            <h3>✗ Don't Do This</h3>
            <ul className="donts-list">
              <li>Talk over participants' heads as if they're not there</li>
              <li>Use baby talk — communicate at a normal adult tone</li>
              <li>Rush a participant through an activity</li>
              <li>Touch or move a participant without asking first</li>
              <li>Use a participant's disability to explain their behavior</li>
              <li>Take photographs without checking with staff first</li>
              <li>Make comparisons to "typical" athletes or peers</li>
              <li>Lose your cool or show frustration — they notice everything</li>
              <li>Leave your assigned participant unattended</li>
              <li>Correct or argue with a participant's parent or caregiver</li>
              <li>Handle a medical situation alone — get staff</li>
              <li>Use your phone during active session time</li>
            </ul>
          </div>
        </div>

        {/* COMMUNICATION STRATEGIES */}
        <div className="section-header" style={{ marginTop: '4rem' }}>
          <h2>Communication Strategies</h2>
          <div className="section-divider"></div>
          <p>Practical tools for connecting with participants who communicate differently</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginTop: '1.5rem' }}>
          <div className="card card-blue">
            <div style={{ fontSize: '1.5rem', marginBottom: '.6rem' }}>📟</div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--blue)', marginBottom: '.5rem' }}>AAC Devices</h3>
            <p style={{ fontSize: '.88rem', color: 'var(--gray-600)', lineHeight: 1.55 }}>Some participants use augmentative &amp; alternative communication (AAC) devices — tablets, speech-generating devices, or picture boards. Always wait for the device to generate the response before reacting. Never speak for someone who uses AAC.</p>
          </div>
          <div className="card card-blue">
            <div style={{ fontSize: '1.5rem', marginBottom: '.6rem' }}>✋</div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--blue)', marginBottom: '.5rem' }}>Gestures &amp; Sign</h3>
            <p style={{ fontSize: '.88rem', color: 'var(--gray-600)', lineHeight: 1.55 }}>Many participants use gestures, pointing, or informal signs. Learn the basics staff use during your session: thumbs up for yes/good, point for "go," wave for "stop." Match and mirror the gestures you see the participant using.</p>
          </div>
          <div className="card card-blue">
            <div style={{ fontSize: '1.5rem', marginBottom: '.6rem' }}>👐</div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--blue)', marginBottom: '.5rem' }}>Total Communication</h3>
            <p style={{ fontSize: '.88rem', color: 'var(--gray-600)', lineHeight: 1.55 }}>Combine all channels at once: words + gesture + demo + expression. The more modalities you use, the more likely the message lands. Pair "let's try passing" with a gesture toward the cones and a demonstration of the pass.</p>
          </div>
          <div className="card card-blue">
            <div style={{ fontSize: '1.5rem', marginBottom: '.6rem' }}>🃏</div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--blue)', marginBottom: '.5rem' }}>Visual Supports</h3>
            <p style={{ fontSize: '.88rem', color: 'var(--gray-600)', lineHeight: 1.55 }}>Staff may use picture schedules or visual sequence cards to help participants understand the session flow. Reference these tools when available — "We just finished dribbling, and now we're going to passing [points to picture]."</p>
          </div>
        </div>

        {/* MAKING IT MEANINGFUL */}
        <div className="section-header" style={{ marginTop: '4rem' }}>
          <h2>Making It Meaningful</h2>
          <div className="section-divider"></div>
        </div>

        <div className="philosophy-banner">
          <blockquote>
            The sport is the vehicle. The joy, the connection, the confidence — those are the destination. Keep your eyes on what matters most.
          </blockquote>
        </div>

        <div className="principle-grid" style={{ marginTop: '2rem' }}>
          <div className="principle-card">
            <span className="principle-icon">🧭</span>
            <h3>Remember Why You're Here</h3>
            <p>You didn't sign up to be a coach — you signed up to connect. The most impactful thing you'll do today is make one person feel truly seen and celebrated.</p>
          </div>
          <div className="principle-card">
            <span className="principle-icon">📸</span>
            <h3>Build a Memory Together</h3>
            <p>Participants remember specific moments: the time you made them laugh, the goal you celebrated, the name you remembered. Create those moments on purpose.</p>
          </div>
          <div className="principle-card">
            <span className="principle-icon">🌟</span>
            <h3>Let Them Teach You</h3>
            <p>Participants often have surprising skills, strategies, and adaptations you haven't seen. Slow down enough to notice them — and then be genuinely amazed.</p>
          </div>
          <div className="principle-card">
            <span className="principle-icon">🔄</span>
            <h3>Come Back</h3>
            <p>Consistency matters. A participant who sees the same volunteer week after week feels safe. Relationships are built over time — show up again.</p>
          </div>
        </div>

        <div className="alert alert-green" style={{ marginTop: '2rem' }}>
          <span>✅</span>
          <span><strong>Before you leave today:</strong> Make sure every participant you worked with knows you're glad you were there. A high-five, a "see you next week," and a genuine smile take 5 seconds and mean everything.</span>
        </div>

      </div>

      <footer className="page-footer">
        <strong>Empower Sports</strong> Volunteer Guide — Program Playbook
      </footer>
    </main>
  )
}
