// Words learners can type, in all four languages.
const COMMANDS = {
  MENU: ["menu", "spyskaart", "menyu", "imenyu"],
  RESET: [
    "start over",
    "restart",
    "reset",
    "begin oor",
    "thoma gape",
    "qala kwakhona",
  ],
  LANGUAGE: [
    "change language",
    "language",
    "verander taal",
    "taal",
    "fetola polelo",
    "polelo",
    "tshintsha ulwimi",
    "ulwimi",
  ],
  HANDOFF: [
    "talk to a person",
    "person",
    "human",
    "agent",
    "praat met iemand",
    "bolela le motho",
    "thetha nomntu",
  ],
  END: [
    "bye",
    "goodbye",
    "end",
    "end chat",
    "done",
    "i'm done",
    "im done",
    "stop",
    "totsiens",
    "klaar",
    "beëindig gesprek",
    "šala gabotse",
    "sala gabotse",
    "ke feditše",
    "ke fedile",
    "fetša poledišano",
    "sala kakuhle",
    "ndigqibile",
    "gqiba incoko",
    "bhayi",
  ],
};

function getCommand(text) {
  const cleaned = text.trim().toLowerCase();
  return (
    Object.keys(COMMANDS).find((command) =>
      COMMANDS[command].includes(cleaned),
    ) || null
  );
}

module.exports = { COMMANDS, getCommand };
