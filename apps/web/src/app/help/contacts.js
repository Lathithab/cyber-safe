
// Emergency Contacts
export const emergency = [
  { name: "SAPS Emergency", detail: "Police — crime in progress", tel: "10111" },
  { name: "SAPS Crime Stop", detail: "Report a crime anonymously", tel: "0860010111" },
  { name: "Emergency (from a cellphone)", detail: "Connects to emergency services", tel: "112" },
];

// Bank fraud lines
export const banks = [
  { name: "Absa", detail: "Fraud hotline", tel: "0860557557" },
  { name: "Capitec", detail: "Fraud line", tel: "0860100155" },
  { name: "FNB", detail: "Fraud line", tel: "0800110132" },
  { name: "Nedbank", detail: "Fraud line", tel: "0800110929" },
  { name: "Standard Bank", detail: "Fraud line", tel: "0800020600" },
  { name: "TymeBank", detail: "Customer support", tel: "0860999119" },
];

// Mobile networks to report SIM-swap fraud / lost SIM.
export const networks = [
  { name: "Vodacom", detail: "Customer care / SIM-swap", tel: "082111" },
  { name: "MTN", detail: "Customer care / SIM-swap", tel: "083123" },
  { name: "Cell C", detail: "Customer care / SIM-swap", tel: "084140" },
  { name: "Telkom", detail: "Customer care / SIM-swap", tel: "081180" },
];

// "Find help near you" opens the phone's maps app with a search.
// No location is stored or sent anywhere by the app itself.
export const geoLinks = [
  {
    label: "Nearest police station",
    query: "police station near me",
    note: "Opens your maps app",
  },
];
