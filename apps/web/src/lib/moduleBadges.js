const MODULE_BADGES = [
  { test: /password/i, title: "Password Guardian", icon: "key" },
  { test: /phishing/i, title: "Phishing Spotter", icon: "shieldcheck" },
  { test: /whatsapp/i, title: "WhatsApp Account Guardian", icon: "shieldcheck" },
  { test: /bank/i, title: "Banking Safety Protector", icon: "shieldcheck" },
  { test: /sim.swap/i, title: "SIM-Swap Sentinel", icon: "medal" },
  { test: /shop|sell|marketplace/i, title: "Marketplace Safety Pro", icon: "medal" },
  { test: /school/i, title: "School CyberSafe Champion", icon: "users" },
  { test: /research|fact.check/i, title: "Digital Fact-Checker", icon: "shieldcheck" },
  { test: /wi.fi|wifi/i, title: "Wi-Fi Wise", icon: "key" },
  { test: /cyberbullying/i, title: "Kindness & Safety Advocate", icon: "heart" },
  { test: /personal information|privacy/i, title: "Privacy Protector", icon: "shieldcheck" },
  { test: /job search|job scam/i, title: "Job Scam Spotter", icon: "medal" },
];

export function getModuleBadge(module) {
  const title = module?.title || "Learning Module";
  const match = MODULE_BADGES.find(({ test }) => test.test(title));

  return {
    title: match?.title || `${title} Graduate`,
    icon: match?.icon || "medal",
    body: `Completed the ${title} learning module and its quiz.`,
  };
}
