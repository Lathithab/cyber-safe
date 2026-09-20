# CyberSafe Demonstration Script

## Opening

Good day. Today I will demonstrate CyberSafe South Africa, a cybersecurity awareness platform designed to give people practical, local, and safe guidance when they encounter online threats.

The key idea behind CyberSafe is that users need guided action at moments of vulnerability. The platform combines learning, scam awareness, community reporting, and direct help resources in one place.

## 1. Login

I will begin on the Login page. Users can switch between **Log In** and **Register**, and enter an email address and password.

When the platform is connected to Supabase, this is real authentication: Log In calls Supabase directly, Register creates a real account, and any error (wrong password, existing email, and so on) is shown inline on the form. When Supabase is not configured, the app runs in demo mode and the same form takes you straight into the app without creating an account — a small note on the screen makes that clear.

Google and Microsoft sign-in are shown but disabled ("Coming soon") since that integration isn't built yet.

After logging in, the user is taken to the CyberSafe Home page.

## 2. CyberSafe Home

The Home page gives immediate, simple choices. The safety message reminds users that if money is moving or an account may be compromised, they should call their bank immediately and never share a PIN, password, or one-time password.

The three main actions are **I need help now**, **Check a suspicious message**, and **Report a scam**. These open the Helpline Hub, Scam Library, and Report Incident form respectively.

## 3. Community Feed

Next, I will open **Community Feed**. This page allows the community to share safety information and see reports that have been reviewed and approved.

When Supabase is configured, the feed reads approved reports from the database. Composing a post directly in the feed (the box at the top) is a local, same-device demo feature for this walkthrough — it is not sent to the community and disappears if the browser's storage is cleared. Likes, comments and saves on posts are also local to this session and are not shared with other users.

## 4. Learn Security

The **Learn Security** page is the Interactive Safety Academy. It provides practical learning modules focused on local digital threats.

I can use the filters to show **All modules**, **Finance**, **Social engineering**, or **School resources**. The current modules cover banking safety, phishing, WhatsApp security, SIM-swap attacks, digital safety for schools, and safe online research. Each module ends with a short quiz; completing it awards a badge for this browsing session.

## 5. Scam Library

The **Scam Library** is separate from Learn Security. It is a quick-reference tool for people who may already be facing a suspicious situation.

Users can search by scam type or warning sign, filter the guides by category, and open a guide to see warning signs and recommended actions. Examples include WhatsApp verification-code scams, fake bank links, SIM-swap fraud, job scams, fake proof of payment, OTP requests, fake delivery messages, fake SARS notices, remote-access scams, advance-fee loans, charity impersonation, and boss or family emergency scams.

## 6. Report Incident

I will now demonstrate **Report Incident**. The user selects the incident type, writes a detailed description, enters the incident date and location, and can choose to post anonymously.

The user can upload PNG or JPG evidence; the image is automatically resized before it's stored. On submission, when Supabase is configured, the report is saved with a **pending** status and the user sees a confirmation that it's been submitted for review — it does not appear in the Community Feed immediately, since it still needs to be checked before publication. In demo mode, the report is stored locally on the device and shown in the feed right away, matching the rest of the demo-mode experience.

## 7. Get Help

The **Get Help** page is the Critical Helpline Hub. It provides national emergency contacts, searchable South African bank fraud hotlines, telecom and SIM-swap numbers, and a link to find the nearest SAPS police station.

It also includes a **Quick Exit** button for users who may need to leave the app quickly on an unsafe or shared device.

## 8. CyberBot AI

The **CyberBot AI** page shows a QR code that opens a conversation with the CyberSafe WhatsApp assistant. The assistant itself runs as a separate WhatsApp bot service (built on the WhatsApp Cloud API and an LLM), not inside this web app — the QR code is simply the bridge to it.

## 9. Notifications

The **Notifications** page keeps users informed about threat alerts, community activity, learning updates, and report feedback. Users can filter notifications, mark them as read, and open Notification Preferences to choose which categories of updates they want to receive. This screen currently shows illustrative sample notifications rather than a live feed.

## 10. User Profile

The **User Profile** page presents a user's security profile, community activity, incident-report status, security score, and earned badges. The name shown reflects the signed-in account (or "Guest" in demo mode); the activity stats and badges are illustrative placeholders for this walkthrough. Users can switch between profile tabs and use **Edit Profile** to move to Settings.

## 11. Settings

Finally, the **Settings** page lets users manage account and safety preferences, and log out. The user can enable or disable two-factor authentication, SMS scam advisories, email learning reminders, push incident alerts, high-contrast mode, and screen-reader support — these toggles are illustrative for this walkthrough and are not yet wired to real account settings. It also highlights POPIA compliance and user control over personal information and reports.

## Closing

To conclude, CyberSafe combines prevention through learning, recognition through the Scam Library, community awareness through the Community Feed, incident reporting, and practical emergency support through the Helpline Hub.

The platform is designed to be local, supportive, and actionable. It does not replace emergency services or a bank's official fraud process, but it helps users take the right next step quickly and safely.

## Known limitations

- **Likes, comments and saves are not persisted.** They are held in local browser/component state for the current session and are not visible to other users or synced across devices.
- **Notifications and profile stats are static.** The Notifications page and the Profile page's activity/security-score/badge data are illustrative sample content, not live figures pulled from real usage.
- **The WhatsApp bot's conversation memory is in-process only.** Chat history for CyberBot AI lives in the bot service's memory while it's running and is lost on a restart or redeploy; there is no persistent conversation history.
- **OAuth sign-in is disabled.** The Google and Microsoft buttons on the Login page are placeholders ("Coming soon") — only email/password sign-in works.
- **The Learn Security quiz and badges reset on refresh.** Progress is only kept in the page's state for the current visit; it is not saved against the signed-in account yet (the API has server-side quiz grading and progress tracking built, but the web app doesn't call it yet).
- **The Community Feed composer and the FastAPI backend are not yet connected.** Posts made directly in the feed are demo-only (see above), and the feed reads/writes go straight to Supabase from the browser rather than through the moderation/analytics API in `apps/api`.
