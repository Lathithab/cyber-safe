# CyberSafe Demonstration Script

## Opening

Good day. Today I will demonstrate CyberSafe South Africa, a cybersecurity awareness platform designed to give people practical, local, and safe guidance when they encounter online threats.

The key idea behind CyberSafe is that users need guided action at moments of vulnerability. The platform combines learning, scam awareness, community reporting, and direct help resources in one place.

## 1. Login

I will begin on the Login page. Users can switch between **Log In** and **Register**, enter an email address and password, and use the sign-in button to enter the platform. At this stage, this is a frontend demonstration flow; full account authentication will be connected to the backend later.

After logging in, the user is taken to the CyberSafe landing page.

## 2. CyberSafe Home

The Home page gives immediate, simple choices. The safety message reminds users that if money is moving or an account may be compromised, they should call their bank immediately and never share a PIN, password, or one-time password.

The three main actions are **I need help now**, **Check a suspicious message**, and **Report a scam**. These open the Helpline Hub, Scam Library, and Report Incident form respectively.

## 3. Community Feed

Next, I will open **Community Feed**. This page allows the community to share safety information and report threats that may affect other South Africans.

Users can create a post, choose a category, attach an image as evidence, and interact with posts by liking, saving, sharing, commenting, hiding, or deleting their own locally stored report. Report text, location, incident date, and image evidence can appear here. During frontend testing, reports are stored in the browser; when Supabase is configured, approved reports are read from the database.

## 4. Learn Security

The **Learn Security** page is the Interactive Safety Academy. It provides practical learning modules focused on local digital threats.

I can use the filters to show **All modules**, **Finance**, **Social engineering**, or **School resources**. The current modules cover banking safety, phishing, WhatsApp security, SIM-swap attacks, digital safety for schools, and safe online research.

## 5. Scam Library

The **Scam Library** is separate from Learn Security. It is a quick-reference tool for people who may already be facing a suspicious situation.

Users can search by scam type or warning sign, filter the guides by category, and open a guide to see warning signs and recommended actions. Examples include WhatsApp verification-code scams, fake bank links, SIM-swap fraud, job scams, fake proof of payment, OTP requests, fake delivery messages, fake SARS notices, remote-access scams, advance-fee loans, charity impersonation, and boss or family emergency scams.

## 6. Report Incident

I will now demonstrate **Report Incident**. The user selects the incident type, writes a detailed description, enters the incident date and location, and can choose to post anonymously to the community feed.

The user can upload PNG or JPG evidence. On submission, the text details and image evidence are saved together so the image can appear with the post in the Community Feed. The report journey describes submission, review, escalation where SAPS or bank action is needed, and anonymous community alerts where appropriate.

## 7. Get Help

The **Get Help** page is the Critical Helpline Hub. It provides national emergency contacts, searchable South African bank fraud hotlines, telecom and SIM-swap numbers, and a link to find the nearest SAPS police station.

It also includes a **Quick Exit** button for users who may need to leave the app quickly on an unsafe or shared device.

## 8. CyberBot AI

The **CyberBot AI** tab has been created and reserved for the future AI assistant. It is intentionally blank at this stage while the team plans the AI functionality and backend integration.

## 9. Notifications

The **Notifications** page keeps users informed about threat alerts, community activity, learning updates, and report feedback. Users can filter notifications, mark them as read, and open Notification Preferences to choose which categories of updates they want to receive.

## 10. User Profile

The **User Profile** page presents a user’s security profile, community activity, incident-report status, security score, and earned badges. Users can switch between profile tabs and use **Edit Profile** to move to Settings.

## 11. Settings

Finally, the **Settings** page lets users manage account and safety preferences. The user can enable or disable two-factor authentication, SMS scam advisories, email learning reminders, push incident alerts, high-contrast mode, and screen-reader support. It also highlights POPIA compliance and user control over personal information and reports.

## Closing

To conclude, CyberSafe combines prevention through learning, recognition through the Scam Library, community awareness through the Community Feed, incident reporting, and practical emergency support through the Helpline Hub.

The platform is designed to be local, supportive, and actionable. It does not replace emergency services or a bank’s official fraud process, but it helps users take the right next step quickly and safely.
