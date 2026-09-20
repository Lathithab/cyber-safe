"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardNavIcon from "../components/DashboardNavIcon";
import { DASHBOARD_NAV } from "../components/dashboardNav";

const MODULES = [
  {
    id: "banking-safety",
    title: "Banking safety essentials",
    description: "Protect your banking details and respond safely to suspicious alerts.",
    duration: "30 min",
    category: "Banking",
    badge: "Banking Safety Starter",
    scenario:
      "You receive an SMS saying your banking profile will be blocked unless you approve a request immediately.",
    overview:
      "Criminals copy bank branding and create urgency so that you act before checking the message. A legitimate bank will never need your PIN, password, card details, or one-time password over an SMS, email, or phone call.",
    redFlags: ["Pressure to act immediately", "A link that does not use your bank's official app", "Any request for a PIN, password, or OTP"],
    takeaway: "Slow down: use your official banking app or a verified bank number, not the message link.",
    actions: [
      "Open your official banking app directly; never use the link in an unexpected message.",
      "Call the number on the back of your bank card if you are unsure.",
      "Never share a PIN, password, card number, or OTP with anyone.",
    ],
  },
  {
    id: "phishing",
    title: "Spot a phishing attempt",
    description: "Learn the warning signs behind fake emails, websites, and urgent messages.",
    duration: "20 min",
    category: "Social engineering",
    badge: "Phishing Spotter",
    scenario:
      "An email says your parcel is waiting and asks you to pay a small fee through a shortened link.",
    overview:
      "Phishing messages impersonate familiar companies to steal login or payment information. They often use a realistic logo and language, but small details—such as the sender address or web address—reveal that the message is fake.",
    redFlags: ["Unexpected payment or account warning", "A shortened or misspelled web address", "Threats that a parcel or account will be lost soon"],
    takeaway: "Do not trust a link just because the message looks familiar; verify through the real company website.",
    actions: [
      "Check the sender address and website independently before acting.",
      "Do not enter card or login details after following an unexpected link.",
      "Visit the company website or app yourself to verify the message.",
    ],
  },
  {
    id: "whatsapp",
    title: "Protect your WhatsApp",
    description: "Keep your account secure from verification-code and takeover scams.",
    duration: "15 min",
    category: "Social engineering",
    badge: "WhatsApp Guardian",
    scenario:
      "A contact says they accidentally sent their WhatsApp code to you and asks you to forward it.",
    overview:
      "A WhatsApp verification code proves that somebody is trying to register your phone number on another device. Sharing that code can give a scammer control of your account, contacts, and conversations.",
    redFlags: ["A request for a six-digit code", "A friend acting unusually urgent", "A WhatsApp verification message you did not request"],
    takeaway: "Verification codes are private—never forward them, even to a friend or family member.",
    actions: [
      "Never share a verification code, even with someone you know.",
      "Enable WhatsApp two-step verification and add a recovery email.",
      "Tell the real contact through another channel if their account may be compromised.",
    ],
  },
  {
    id: "school-safety",
    title: "Digital safety for schools",
    description: "Build safer habits for shared devices, learning platforms, and class groups.",
    duration: "25 min",
    category: "School resources",
    badge: "School Safety Ally",
    scenario:
      "A learner logs in to a shared school computer and sees a browser prompt asking to save their password.",
    overview:
      "Shared devices can be useful for learning, but they are not private. Saved passwords, open browser sessions, and public class chats can expose a learner's account or personal information to the next person using the device.",
    redFlags: ["A browser offering to save a password on a shared computer", "An account still logged in after a lesson", "Unknown links posted in a class group"],
    takeaway: "On a shared device, sign out completely and never save your password in the browser.",
    actions: [
      "Sign out fully and do not save passwords on shared devices.",
      "Use only trusted school platforms and report suspicious prompts to an educator.",
      "Keep personal details out of public class chats and posts.",
    ],
  },
  {
    id: "sim-swap",
    title: "Stop a SIM-swap attack",
    description: "Know the early warning signs and the urgent steps to protect your accounts.",
    duration: "20 min",
    category: "Banking",
    badge: "SIM-Swap Responder",
    scenario:
      "Your phone suddenly loses signal and you receive a notification that a SIM swap was requested.",
    overview:
      "In a SIM-swap attack, criminals try to move your phone number to their SIM card. They may then receive SMS verification codes used to reset banking, email, or social-media accounts, so fast action matters.",
    redFlags: ["Unexpected loss of mobile signal", "A SIM-swap notification you did not request", "Password-reset messages or bank alerts you did not trigger"],
    takeaway: "Treat an unexplained loss of signal as urgent: call your network and bank from another phone.",
    actions: [
      "Call your mobile network from another phone immediately.",
      "Contact your bank and secure accounts that use SMS verification.",
      "Change important passwords from a safe device if you suspect account access.",
    ],
  },
  {
    id: "research",
    title: "Safe online research",
    description: "Check sources, avoid misinformation, and use online information responsibly.",
    duration: "20 min",
    category: "School resources",
    badge: "Smart Researcher",
    scenario:
      "A class group shares a shocking cybercrime post and asks everyone to repost it immediately.",
    overview:
      "False or misleading information spreads quickly when it creates fear, anger, or urgency. Checking who published a claim, when it was published, and whether reliable sources confirm it helps stop misinformation.",
    redFlags: ["A demand to share before it is deleted", "No named or reliable source", "Old information presented as a new emergency"],
    takeaway: "Pause before sharing: check the source, date, and evidence first.",
    actions: [
      "Check the source, author, and publication date before sharing.",
      "Use official or recognised organisations to confirm important claims.",
      "Pause before reposting content designed to create fear or urgency.",
    ],
  },
  {
    id: "shopping",
    title: "Shop and sell safely online",
    description: "Recognise payment, delivery, and marketplace scams before you lose money.",
    duration: "20 min",
    category: "Banking",
    badge: "Safe Trader",
    scenario:
      "A buyer sends a payment screenshot and asks a courier to collect your item before the money reflects.",
    overview:
      "Online marketplace scams commonly use fake proof of payment, fake couriers, or a promise that money will reflect later. A screenshot can be edited; only cleared funds visible in your own banking app confirm payment.",
    redFlags: ["Pressure to release an item quickly", "A payment screenshot instead of cleared funds", "A buyer arranging an unfamiliar courier"],
    takeaway: "A screenshot is not payment—release goods only after cleared funds show in your account.",
    actions: [
      "Only release goods after cleared funds appear in your official banking app.",
      "Do not trust payment screenshots or emails alone.",
      "Keep conversations and payments on the marketplace where possible.",
    ],
  },
  {
    id: "passwords",
    title: "Passwords and two-factor authentication",
    description: "Create stronger account protection without relying on reused passwords.",
    duration: "20 min",
    category: "Social engineering",
    badge: "Account Defender",
    scenario:
      "A giveaway site asks you to reuse your school email password to create an account.",
    overview:
      "When the same password is used on several sites, one data breach can expose every account that uses it. Two-factor authentication adds a second check, making it harder for someone to sign in even if they know your password.",
    redFlags: ["A site asking you to reuse an important password", "A password that is short or easy to guess", "An account with no two-factor authentication enabled"],
    takeaway: "Use a different strong password for every important account and turn on two-factor authentication.",
    actions: [
      "Use a unique, long password for every important account.",
      "Turn on two-factor authentication, preferably with an authenticator app.",
      "Use a trusted password manager instead of writing passwords in notes or chats.",
    ],
  },
  {
    id: "wifi",
    title: "Stay safe on public Wi-Fi",
    description: "Use public networks more safely and avoid risky prompts and logins.",
    duration: "15 min",
    category: "School resources",
    badge: "Wi-Fi Wise",
    scenario:
      "You connect to free Wi-Fi and a pop-up asks you to install a security certificate.",
    overview:
      "Public Wi-Fi can be convenient, but you do not control who runs the network or what they can see. Fake Wi-Fi names and malicious sign-in pages may try to collect data or install software on your device.",
    redFlags: ["A network name that looks almost like the real venue", "A request to install a profile, certificate, or app", "A public connection asking for banking credentials"],
    takeaway: "Use public Wi-Fi for low-risk browsing only; use mobile data for banking and private accounts.",
    actions: [
      "Avoid banking and sensitive logins on untrusted public Wi-Fi.",
      "Do not install unknown apps, profiles, or certificates.",
      "Forget the network when you are finished and use mobile data for important tasks.",
    ],
  },
  {
    id: "cyberbullying",
    title: "Respond to cyberbullying safely",
    description: "Support yourself or others without spreading harmful content further.",
    duration: "25 min",
    category: "School resources",
    badge: "Digital Support Ally",
    scenario:
      "Someone posts hurtful messages about a learner and asks others to share screenshots.",
    overview:
      "Cyberbullying can spread beyond the original post when others comment, repost, or share screenshots. Keeping evidence for a report is helpful, but public sharing can make the harm worse and remove the person's privacy.",
    redFlags: ["Repeated hurtful messages or threats", "Pressure to share embarrassing content", "A post encouraging others to target someone"],
    takeaway: "Do not amplify harm—save evidence privately, report it, and get support from a trusted adult.",
    actions: [
      "Save evidence privately without amplifying the harmful post.",
      "Block and report the account using the platform tools.",
      "Tell a trusted adult, educator, or support person as soon as possible.",
    ],
  },
  {
    id: "privacy",
    title: "Protect your personal information",
    description: "Know what information to keep private and how identity scams begin.",
    duration: "20 min",
    category: "Social engineering",
    badge: "Privacy Protector",
    scenario:
      "A caller claiming to be from a service provider asks for your ID number and OTP to confirm an upgrade.",
    overview:
      "Identity scammers collect small pieces of personal information—such as an ID number, address, date of birth, and verification code—to impersonate you or take over accounts. Legitimate organisations do not need an OTP to verify you on an unexpected call.",
    redFlags: ["An unexpected request for your ID number or OTP", "A caller asking you to keep the request secret", "A link requesting a photo of an identity document"],
    takeaway: "Keep identity details and OTPs private, then verify any request using an official channel.",
    actions: [
      "Do not provide OTPs or identity details during an unexpected call.",
      "Verify requests through an official number or website you find yourself.",
      "Review privacy settings and avoid posting sensitive documents online.",
    ],
  },
  {
    id: "jobs",
    title: "Find jobs safely online",
    description: "Avoid fake job offers, recruitment fees, and identity-harvesting scams.",
    duration: "20 min",
    category: "Social engineering",
    badge: "Safe Job Seeker",
    scenario:
      "A recruiter offers you a job but asks for a training fee and a copy of your ID before an interview.",
    overview:
      "Fake job adverts exploit people who are looking for work. Scammers may copy a company name, promise an easy job, then request a payment or personal documents before a genuine interview or employment process begins.",
    redFlags: ["A job offer without a real interview", "A request for a fee, voucher, or payment", "An email address that does not match the employer's official website"],
    takeaway: "A genuine employer will not ask you to pay money to secure a job opportunity.",
    actions: [
      "Never pay an upfront fee to secure a job opportunity.",
      "Verify vacancies on the employer's official website or verified channels.",
      "Share only the information needed for a legitimate application.",
    ],
  },
];

const QUIZZES = {
  Banking: [
    {
      question: "What is the safest way to check a suspicious banking alert?",
      options: ["Use the message link", "Open your official banking app or call a verified number", "Reply and ask the sender"],
      answer: 1,
    },
    {
      question: "When selling an item online, when should you release it?",
      options: ["After receiving a payment screenshot", "After cleared funds appear in your official bank account", "As soon as a courier arrives"],
      answer: 1,
    },
    {
      question: "Your phone loses signal unexpectedly and you suspect a SIM swap. What should you do?",
      options: ["Wait until tomorrow", "Restart your phone repeatedly", "Contact your network and bank immediately"],
      answer: 2,
    },
  ],
  "Social engineering": [
    {
      question: "Which item should never be shared with another person?",
      options: ["A public business address", "A one-time password or verification code", "A first name"],
      answer: 1,
    },
    {
      question: "What should you do with an unexpected link asking you to sign in?",
      options: ["Open it quickly before it expires", "Check the service through its official app or website", "Forward it to a friend"],
      answer: 1,
    },
    {
      question: "How should you respond to an unexpected call asking for your personal details?",
      options: ["Provide details to avoid account closure", "Ask the caller to text you a link", "End the call and verify through an official channel"],
      answer: 2,
    },
  ],
  "School resources": [
    {
      question: "What should you do after using a shared computer?",
      options: ["Leave the account open for the next learner", "Sign out and avoid saving your password", "Save your login to make it faster next time"],
      answer: 1,
    },
    {
      question: "What is a safe response to cyberbullying?",
      options: ["Share the post widely so others can see it", "Save evidence, report it, and tell a trusted adult", "Reply with an insult"],
      answer: 1,
    },
    {
      question: "What is safest on an unknown public Wi-Fi network?",
      options: ["Avoid sensitive logins and banking", "Install every security prompt", "Use it for any private task"],
      answer: 0,
    },
  ],
};

function ShieldIcon() {
  return <span className="shield-icon" aria-hidden="true">✓</span>;
}

export default function LearnPage() {
  const router = useRouter();
  const [filter, setFilter] = useState("All modules");
  const [selectedModule, setSelectedModule] = useState(null);
  const [answers, setAnswers] = useState({});
  const [quizChecked, setQuizChecked] = useState(false);
  const [earnedBadges, setEarnedBadges] = useState([]);

  const visibleModules = useMemo(
    () => (filter === "All modules" ? MODULES : MODULES.filter((module) => module.category === filter)),
    [filter]
  );
  const quiz = selectedModule ? QUIZZES[selectedModule.category] : [];
  const allAnswered = quiz.length > 0 && quiz.every((_, index) => answers[index] !== undefined);
  const score = quiz.reduce((total, question, index) => total + (answers[index] === question.answer ? 1 : 0), 0);
  const badgeEarned = selectedModule ? earnedBadges.includes(selectedModule.id) : false;

  function openModule(module) {
    setSelectedModule(module);
    setAnswers({});
    setQuizChecked(false);
  }

  function closeModule() {
    setSelectedModule(null);
  }

  function earnBadge() {
    if (!selectedModule) return;
    setEarnedBadges((current) => (current.includes(selectedModule.id) ? current : [...current, selectedModule.id]));
  }

  return (
    <main className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <button className="brand" onClick={() => router.push("/feed")} aria-label="Open community feed">
          <span className="brand-shield">♢</span>
          <span><strong>CyberSafe</strong><small>South Africa</small></span>
        </button>
        <nav className="dashboard-nav" aria-label="Main navigation">
          {DASHBOARD_NAV.map(([label, href, icon]) => (
            <button key={href} className={href === "/learn" ? "active" : ""} onClick={() => router.push(href)}>
              <DashboardNavIcon name={icon} />{label}
            </button>
          ))}
        </nav>
        <section className="emergency-card">
          <strong>☎&nbsp; EMERGENCY</strong>
          <p>Victim of a scam or cyber hack?</p>
          <button onClick={() => router.push("/help")}>Get Help Now</button>
        </section>
      </aside>

      <section className="learn-content">
        <header className="page-header">
          <div>
            <p className="eyebrow">INTERACTIVE SAFETY ACADEMY</p>
            <h1>Learn Security</h1>
            <p>Practical courses built to tackle local South African digital threats.</p>
          </div>
          <button className="help-button" onClick={() => router.push("/help")}>Get Help Now</button>
        </header>

        <section className="featured-course">
          <span>FEATURED MODULE</span>
          <h2>Secure your banking apps against OTP scams</h2>
          <p>Learn the warning signs of fake banking messages and the immediate steps that protect your money.</p>
          <button onClick={() => openModule(MODULES[0])}>Start free module <b>→</b></button>
        </section>

        <section className="filter-bar" aria-label="Module filters">
          {["All modules", "Banking", "Social engineering", "School resources"].map((item) => (
            <button key={item} className={filter === item ? "selected" : ""} onClick={() => setFilter(item)}>{item}</button>
          ))}
          <span>{visibleModules.length} modules</span>
        </section>

        <section className="module-grid" aria-label="Security courses">
          {visibleModules.map((module) => (
            <article className="module-card" key={module.id}>
              <div className="module-top"><span>{module.category}</span></div>
              <h2>{module.title}</h2>
              <p>{module.description}</p>
              <div className="module-meta"><span>{module.duration} · 3-question quiz</span>{earnedBadges.includes(module.id) && <strong>Badge earned</strong>}</div>
              <button onClick={() => openModule(module)}>Open module <b>→</b></button>
            </article>
          ))}
        </section>
      </section>

      {selectedModule && (
        <div className="module-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && closeModule()}>
          <section className="module-modal" role="dialog" aria-modal="true" aria-labelledby="module-title">
            <button className="close-module" onClick={closeModule} aria-label="Close module">×</button>
            <p className="eyebrow">{selectedModule.category} · {selectedModule.duration}</p>
            <h2 id="module-title">{selectedModule.title}</h2>
            <p className="module-intro">Complete the scenario, practical actions, and quick quiz to earn your completion badge.</p>

            <div className="lesson-block overview-block"><h3>What you need to know</h3><p>{selectedModule.overview}</p></div>
            <div className="lesson-block scenario-block"><h3>Short scenario</h3><p>{selectedModule.scenario}</p></div>
            <div className="lesson-block red-flags-block"><h3>Warning signs to recognise</h3><ul>{selectedModule.redFlags.map((flag) => <li key={flag}>{flag}</li>)}</ul></div>
            <div className="lesson-block"><h3>Practical actions</h3><ol>{selectedModule.actions.map((action) => <li key={action}>{action}</li>)}</ol></div>
            <div className="key-takeaway"><strong>Key takeaway</strong><p>{selectedModule.takeaway}</p></div>

            <div className="lesson-block quiz-block">
              <h3>Quick check</h3>
              <p>Answer all three questions, then check your understanding.</p>
              {quiz.map((question, questionIndex) => (
                <fieldset key={question.question}>
                  <legend>{questionIndex + 1}. {question.question}</legend>
                  {question.options.map((option, optionIndex) => {
                    const isCorrect = quizChecked && optionIndex === question.answer;
                    const isWrong = quizChecked && answers[questionIndex] === optionIndex && optionIndex !== question.answer;
                    return (
                      <label className={isCorrect ? "correct" : isWrong ? "incorrect" : ""} key={option}>
                        <input type="radio" name={`question-${questionIndex}`} checked={answers[questionIndex] === optionIndex} disabled={quizChecked}
                          onChange={() => setAnswers((current) => ({ ...current, [questionIndex]: optionIndex }))} />
                        {option}
                      </label>
                    );
                  })}
                </fieldset>
              ))}
              {!quizChecked ? (
                <button className="primary-action" disabled={!allAnswered} onClick={() => setQuizChecked(true)}>Check answers</button>
              ) : (
                <div className="quiz-result">
                  <strong>{score} / {quiz.length} correct</strong>
                  <p>{score === quiz.length ? "Excellent work — you spotted every safe choice." : "Review the highlighted answers, then complete the course to keep your badge."}</p>
                </div>
              )}
            </div>

            <div className={badgeEarned ? "badge-card earned" : "badge-card"}>
              <ShieldIcon />
              <div><strong>{badgeEarned ? "Badge earned" : "Completion badge"}</strong><p>{selectedModule.badge}</p></div>
              {!badgeEarned && <button className="primary-action" disabled={!quizChecked} onClick={earnBadge}>Complete course</button>}
            </div>
          </section>
        </div>
      )}

      <style jsx>{`
        :global(*) { box-sizing: border-box; }
        .dashboard-shell { min-height: 100vh; display: grid; grid-template-columns: 290px minmax(0, 1fr); background: #f6f9fc; color: #121a32; font-family: Arial, sans-serif; }
        .dashboard-sidebar { min-height: 100vh; background: #fff; border-right: 1px solid #dde6f0; padding: 40px 28px 28px; display: flex; flex-direction: column; }
        .brand { display: flex; align-items: center; gap: 13px; border: 0; background: transparent; text-align: left; cursor: pointer; color: #121a32; padding: 0 8px; }
        .brand-shield { width: 55px; height: 55px; display: grid; place-items: center; border-radius: 16px; background: #e6faff; color: #31c7e6; font-size: 34px; font-weight: 800; }
        .brand strong { display: block; font-size: 29px; letter-spacing: -1px; }.brand small { display: block; color: #31c7e6; font-size: 16px; margin-top: 2px; }
        .dashboard-nav { margin-top: 62px; display: grid; gap: 8px; }.dashboard-nav button { border: 0; background: transparent; color: #596984; cursor: pointer; padding: 15px 17px; border-radius: 16px; display: flex; align-items: center; gap: 17px; font-size: 17px; font-weight: 700; text-align: left; }.dashboard-nav button:hover, .dashboard-nav button.active { background: #e6faff; color: #121a32; }.dashboard-nav button.active :global(svg) { color: #31c7e6; }
        .emergency-card { margin-top: auto; border: 2px solid #ff5a60; background: #fff4f4; border-radius: 20px; padding: 21px; color: #ff535a; }.emergency-card strong { font-size: 16px; }.emergency-card p { color: #586984; margin: 17px 0 10px; line-height: 1.4; }.emergency-card button { border: 0; background: transparent; color: #ff535a; font-weight: 800; cursor: pointer; padding: 0; font-size: 16px; }
        .learn-content { width: min(1240px, calc(100% - 72px)); margin: 0 auto; padding: 48px 0 70px; }.page-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; border-bottom: 1px solid #dce5ee; padding-bottom: 31px; }.eyebrow { margin: 0 0 8px; color: #31c7e6; font-weight: 800; letter-spacing: .04em; font-size: 12px; }.page-header h1 { font-size: clamp(34px, 4.3vw, 57px); letter-spacing: -2.4px; margin: 0; }.page-header p:not(.eyebrow) { max-width: 710px; color: #62728d; font-size: 18px; line-height: 1.45; margin: 8px 0 0; }.help-button, .primary-action { border: 0; border-radius: 12px; background: #31c7e6; color: #102039; font-weight: 800; cursor: pointer; padding: 15px 22px; white-space: nowrap; font-size: 15px; }.help-button { margin-top: 12px; }
        .featured-course { margin: 32px 0; min-height: 245px; background: linear-gradient(105deg, #101b37, #173458); border-radius: 23px; color: #fff; padding: 38px 46px; position: relative; overflow: hidden; }.featured-course:after { content: ""; position: absolute; width: 360px; height: 360px; border: 55px solid rgba(49,199,230,.13); border-radius: 50%; right: -95px; top: -125px; }.featured-course > * { position: relative; z-index: 1; }.featured-course span { display: inline-block; padding: 8px 13px; border-radius: 5px; background: #31c7e6; color: #102039; font-size: 12px; font-weight: 800; }.featured-course h2 { font-size: clamp(27px, 3vw, 42px); margin: 21px 0 11px; max-width: 800px; letter-spacing: -1.4px; }.featured-course p { max-width: 760px; color: #c9d6e7; font-size: 17px; line-height: 1.45; }.featured-course button, .module-card button { border: 0; cursor: pointer; font-weight: 800; }.featured-course button { margin-top: 11px; border-radius: 11px; background: #31c7e6; color: #102039; padding: 14px 20px; }.featured-course b, .module-card b { font-size: 19px; margin-left: 9px; }
        .filter-bar { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; border: 1px solid #dce5ee; background: #f9fbfd; padding: 10px; }.filter-bar button { border: 1px solid #dce5ee; background: #fff; border-radius: 10px; color: #52627c; padding: 10px 15px; cursor: pointer; font-weight: 700; }.filter-bar button.selected { border-color: #31c7e6; background: #e6faff; color: #159ec2; }.filter-bar span { margin-left: auto; color: #66758d; font-size: 14px; }
        .module-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 18px; margin-top: 27px; }.module-card { background: #fff; border: 1px solid #dce5ee; border-radius: 18px; padding: 23px; box-shadow: 0 8px 25px rgba(17, 38, 70, .04); display: flex; flex-direction: column; min-height: 272px; }.module-top { display: flex; align-items: center; gap: 10px; color: #64738b; font-size: 13px; font-weight: 700; }.shield-icon { width: 31px; height: 31px; border-radius: 10px; display: inline-grid; place-items: center; background: #e6faff; color: #159ec2; font-weight: 900; }.module-card h2 { font-size: 20px; letter-spacing: -.5px; margin: 18px 0 9px; }.module-card p { color: #65748b; line-height: 1.45; margin: 0; }.module-meta { margin-top: auto; padding-top: 18px; display: flex; justify-content: space-between; gap: 8px; align-items: center; color: #6a7890; font-size: 13px; }.module-meta strong { color: #119f76; font-size: 12px; }.module-card button { background: transparent; color: #159ec2; padding: 16px 0 0; text-align: left; font-size: 15px; }
        .module-overlay { position: fixed; z-index: 30; inset: 0; background: rgba(9, 22, 43, .55); padding: 20px; display: grid; place-items: center; }.module-modal { width: min(760px, 100%); max-height: calc(100vh - 40px); overflow: auto; position: relative; background: #fff; border-radius: 22px; padding: 36px; box-shadow: 0 22px 65px rgba(0,0,0,.28); }.close-module { position: absolute; top: 17px; right: 19px; background: transparent; border: 0; font-size: 31px; color: #576782; cursor: pointer; }.module-modal h2 { margin: 0; font-size: 31px; letter-spacing: -1px; }.module-intro { color: #65748b; margin: 9px 0 24px; line-height: 1.45; }.lesson-block { border: 1px solid #dce5ee; border-radius: 15px; padding: 20px; margin-top: 14px; }.scenario-block { border-color: #b7ebf7; background: #f2fcff; }.overview-block { border-left: 4px solid #31c7e6; }.red-flags-block { background: #fff9ee; border-color: #f3d38d; }.lesson-block h3 { margin: 0 0 9px; font-size: 19px; }.lesson-block p { margin: 0; color: #576782; line-height: 1.5; }.lesson-block ol, .lesson-block ul { margin: 0; padding-left: 20px; color: #576782; line-height: 1.55; }.lesson-block li + li { margin-top: 6px; }.key-takeaway { border-radius: 14px; background: #e6faff; color: #183553; padding: 17px 20px; margin-top: 14px; }.key-takeaway strong { color: #139fbd; }.key-takeaway p { margin: 5px 0 0; line-height: 1.45; }.quiz-block fieldset { border: 0; margin: 19px 0; padding: 0; }.quiz-block legend { font-weight: 800; margin-bottom: 8px; line-height: 1.4; }.quiz-block label { display: block; border: 1px solid #dce5ee; border-radius: 9px; padding: 10px; margin-top: 7px; color: #52627c; cursor: pointer; }.quiz-block input { margin-right: 8px; accent-color: #31c7e6; }.quiz-block label.correct { border-color: #20bb88; background: #edfff8; color: #118362; }.quiz-block label.incorrect { border-color: #ff7373; background: #fff4f4; color: #bf3a3a; }.primary-action:disabled { opacity: .45; cursor: not-allowed; }.quiz-result { border-left: 4px solid #31c7e6; padding-left: 13px; margin-top: 8px; }.quiz-result strong { color: #159ec2; }.quiz-result p { margin-top: 4px; }.badge-card { display: flex; align-items: center; gap: 13px; border: 1px dashed #92dfee; border-radius: 15px; background: #f7fdff; margin-top: 16px; padding: 17px; }.badge-card.earned { border-style: solid; border-color: #20bb88; background: #edfff8; }.badge-card strong { display: block; }.badge-card p { margin: 2px 0 0; color: #65748b; }.badge-card .primary-action { margin-left: auto; padding: 11px 14px; }
        @media (max-width: 850px) { .dashboard-shell { grid-template-columns: 1fr; }.dashboard-sidebar { min-height: auto; padding: 20px; }.dashboard-nav { margin-top: 22px; display: flex; overflow-x: auto; }.dashboard-nav button { white-space: nowrap; }.emergency-card { margin-top: 20px; }.learn-content { width: min(100% - 32px, 760px); padding-top: 28px; }.page-header { display: block; }.help-button { margin-top: 18px; }.featured-course { padding: 28px; }.module-modal { padding: 28px 20px; }.filter-bar span { width: 100%; margin-left: 0; }.badge-card { align-items: flex-start; flex-wrap: wrap; }.badge-card .primary-action { margin-left: 0; } }
      `}</style>
    </main>
  );
}
