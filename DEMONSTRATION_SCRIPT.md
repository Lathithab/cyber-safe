# CyberSafe South Africa — final presentation notes

Use these as speaking notes, not a word-for-word script. Keep the tone conversational, share the speaking between team members, and let the user journey carry the story.

## 1. Video introduction and pitch — 5–7 minutes

### Slide 1 — Who this is for (about 1 minute)

“Good day. We’re presenting CyberSafe South Africa, a digital-safety project developed in the UCT and C3SA context. The operating environment has three parts: people looking for help, a platform team maintaining guidance and reviewing incident reports, and trusted external services—such as banks, public agencies, and WhatsApp—that users may need to contact next. CyberSafe is designed for people in South Africa who use online banking, messaging, marketplaces, job platforms, and public digital services—and who may need help deciding what to do when a message or interaction feels suspicious.

“The people we have in mind are everyday users: students, families, community members, and anyone who may not have a cyber-safety expert to call. A scam can reach someone at a stressful moment, in a language or format that looks familiar, and it can be hard to know which source to trust.”

### Slide 2 — The problem and opportunity (about 1–1.5 minutes)

“The problem is not only that scams exist. It is that guidance is scattered. Someone may see a suspicious WhatsApp message, search online, find conflicting advice, and still not know whether to report it, contact their bank, or warn other people.

“That creates an opportunity for a trusted, locally relevant starting point: practical advice, clear next steps, and a way for community warnings to reach other people. We are not claiming the platform replaces banks, law enforcement, or official support. The opportunity is to reduce the gap between ‘this seems wrong’ and ‘I know what safe step to take next.’”

### Slide 3 — Our solution (give it its own slide; about 1 minute)

“Our solution is CyberSafe: one place that brings together a searchable Scam Library, short security-learning modules, incident reporting, community safety posts, a South African help directory, and a WhatsApp hand-off to CyberBot.

“The value is in the journey between those pieces. A user can learn how a scam works before it happens, check a suspicious message when it arrives, report an incident for review, and find a verified next step if they need urgent help. Module completion can also be saved to the user profile and earns a topic-related badge.”

### Slide 4 — Why this can be useful (about 1 minute)

“For users, the benefit is less searching and more actionable guidance. For community organisations and support teams, structured reports and repeated scam patterns can help make warnings more visible. For a potential partner or investor, the opportunity is a reusable digital-safety service that can grow its local guides, learning content, and trusted support pathways over time.

“We will be careful about how we measure that value. The next step is to validate whether people can find the right guidance quickly, understand it, and take the intended action—not to claim impact we have not yet measured.”

### Slide 5 — Team and hand-off (about 30–45 seconds)

“We built and tested this as a team. Each of us has worked across the product, and we can all explain the main user journey and how the key parts fit together. We’ll now show one realistic scenario from the user’s point of view.”

## 2. Product demonstration — 3–5 minutes

### Story: Thandi receives a suspicious traffic-fine message

**Set-up:** Sign in with a prepared demo account before recording. Do not show or say a real password, email, phone number, incident location, or other private data. Keep a sample suspicious message ready; do not click its link.

**Opening (15 seconds)**

“This is Thandi, a student in South Africa. She receives a text claiming she has an unpaid vehicle fine and must pay immediately to avoid penalties. She is unsure whether it is real, so she opens CyberSafe rather than following the message link.”

**1. Check the message (about 1 minute)**

- Open **Scam Library** and search for “vehicle fine.”
- Open **Unpaid vehicle fine scam**.
- Point out the familiar pressure tactic, the link warning, and the safe action: verify through the relevant authority using contact details found independently.

Say: “The guide does not ask Thandi to trust another link. It gives her a safer way to verify the claim and explains what to do if she already shared details.”

**2. Report it safely (about 1 minute)**

- Open **Report Incident**. Show the incident type, description, date/location fields, optional evidence, and anonymity choice.
- To demonstrate validation, attempt to submit with a required field missing, show the validation message, then complete the form using fictional demo information.
- Submit once. Show the confirmation that the report is submitted for review.

Say: “CyberSafe separates reporting from urgent response. This report is submitted for review; it is not represented as an emergency service or an automatically approved public post. Thandi can check report status from her profile. Once a report is approved, it can contribute to a community warning.”

**3. Find a trusted next step and close the loop (about 45 seconds)**

- Open **Get Help** and show that the page provides South African support contacts. Explain that Thandi should use a verified bank or authority contact if she entered payment details.
- Open **CyberBot AI** and show the QR code or **Open WhatsApp** button. Explain that the current website hands the user off to WhatsApp; it is not an embedded chat window.

Say: “If Thandi needs another route for guidance, CyberBot opens WhatsApp. If money or account access may be at risk, the help directory makes the immediate next step easier to find.”

**Optional 20-second learning beat:** Open **Learn Security**, show a relevant module, and mention that passing its quiz with the required score saves completion and awards a badge visible on the user profile.

**Close (10 seconds)**

“One suspicious message has taken Thandi from uncertainty to a safe verification step, a reviewed report, and an appropriate support channel. That is the user journey CyberSafe is intended to make simpler.”

### Demo safety and recovery notes

- Use a test account and fictional incident details. Avoid creating multiple live reports during rehearsal.
- If the form rejects a submission, explain the visible validation or error and do not claim it was saved. Retry only after checking the form and connection.
- If the library is loading, use the prepared backup capture and explain that guides are fetched from Supabase. Do not spend demo time repeatedly refreshing.
- Do not click the scam link, send a real payment, or expose personal data on screen.

## 3. Code walkthrough — 5–10 minutes

Keep this to the architecture hierarchy and one feature’s data flow. Every speaker should be ready to point out the client, database, and the boundary between the browser and external services.

### A. Start at the top of the tree (about 1 minute)

In VS Code Explorer, show `CYBER-SAFE-7`:

```text
CYBER-SAFE-7/
├── apps/
│   └── web/
│       ├── src/app/       # Next.js routes and UI
│       ├── lib/           # shared client setup
│       └── public/        # static assets
├── supabase/              # database schema and migrations
└── whatsapp-bot/          # WhatsApp integration/service
```

Say: “At the top level, the project separates the web application, Supabase database setup, and WhatsApp integration. Inside the web app, the App Router groups each user-facing journey into a route. Shared UI and the Supabase client live separately so individual pages can use the same navigation and data connection.”

### B. Explain the main layers (about 1 minute)

“The browser renders the Next.js and React interface. Route components collect input and show loading, success, and error states. The shared Supabase client is initialized in `apps/web/lib/supabase.js` using public environment variables. Supabase Auth manages sign-in, while Postgres stores application records such as guides, posts, profiles, and learning progress. Row-level security policies restrict which authenticated users can read or change their own records.

“The WhatsApp path is a separate hand-off: the web page offers a QR code and a `wa.me` link. The browser opens WhatsApp; it does not put a WhatsApp conversation inside the site.”

### C. Walk one feature through the layers: incident report (about 2–3 minutes)

Open these files in order:

1. `apps/web/src/app/postReport/page.js` — form state, validation, evidence handling, and submit flow. Search for `handleSubmit`.
2. `apps/web/lib/supabase.js` — shared Supabase client and environment-based configuration.
3. `supabase/schema.sql` — show the `posts` table definition; then open `supabase/migrations/20260925150000_admin_community_moderation.sql` for the pending/approved status and row-level access rules.
4. `apps/web/src/app/feed/page.js` — approved posts are fetched for the public community feed.

Say: “The report page first checks the form and prepares optional evidence. With Supabase configured, it gets the signed-in user and inserts a post with a pending-review status. The interface reports success only when the database insert succeeds; otherwise it shows an error. The feed queries approved posts, so a new report is not exposed as a public warning before review. Supabase row-level security is the database-side boundary; the page’s UI is not treated as the security control.”

“There is also a local demo fallback for some reporting flows when Supabase is not configured. That is useful for UI development, but it is not the live database path. Before the demo, we confirm which mode we are using and describe it accurately.”

### D. Show one more small example (about 1 minute)

Optional: open `apps/web/src/app/library/page.js` and show how the Scam Library fetches published guides from `scam_guides`, then filters them by search text and category. The guide content is database-driven, so administrators can maintain the library without hard-coding every guide in the page.

Or open `apps/web/src/app/learn/[module_id]/quiz/page.js` and show the pass threshold and `user_progress` upsert. Explain that the profile reads completed progress to display module badges.

### E. Development environment and trade-offs (about 1 minute)

“We develop the web app locally with Next.js, React, and npm; `npm run dev` starts the local development server. Supabase gives us hosted authentication and Postgres without building those services ourselves. The trade-off is that local development depends on correct environment configuration and network access to Supabase. We surface configuration, loading, and submission errors so a failed request is not presented as a successful save.

“We also keep the WhatsApp experience as a link/QR hand-off. This reuses a familiar channel and avoids pretending the current web interface is an embedded bot, but it means the user leaves the site to continue in WhatsApp.”

### F. Personal reflection and team understanding (about 30–60 seconds)

Each team member should add one genuine sentence, for example:

- “The most interesting part for me was connecting the user journey to the data flow, because a report is not just a form—it has a review state and visibility rules.”
- “The part I found hardest was diagnosing a request that looked like a frozen page. We separated the UI loading state from the database request and added a timeout/error path so users get feedback.”
- “I learned that UI validation improves usability, but access rules belong in the database as well; both layers matter.”

Replace these examples with your own real experience. Do not claim a challenge or solution that the team did not actually encounter or implement.

## Slide and visual checklist

- Make the solution its own slide, after the context/problem and before the demo.
- Identify the audience directly on the title slide, poster, and title image: everyday South African internet users and community members who need practical scam guidance.
- Keep the visual identity consistent with the product: navy `#00243A`, orange `#EB630F`, warm cream, and the established CyberSafe typography/components.
- Respect the institutional hierarchy: UCT is the parent institution and should be the most prominent institutional logo; School of IT and C3SA appear as associated units, not larger than UCT. Keep CyberSafe as the project/product brand.
- Add small, consistent technology marks for Next.js, React, Supabase, and WhatsApp on an architecture/stack slide. Use official, permitted logo assets and do not let them overpower UCT or CyberSafe branding.
- Add a simple architecture diagram: **User → Next.js web app → Supabase Auth/Postgres (RLS)**, with a separate **CyberBot → WhatsApp** hand-off. Label the report review step between submission and public feed.
- Give the abstract a title and restrained CyberSafe/UCT branding so it belongs to the same presentation set.
- Present naturally: use the timings and bold cues as prompts, make eye contact, and let different team members take turns in the story and walkthrough.
