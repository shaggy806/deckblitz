import { defineCard } from "../define.js";

// Every creature the defending player controls, tapped ones too: one that
// can't block it leaves it unblockable (the reminder text, rule 509.1b).
const HEXPROOF = "Tromokratis has hexproof unless it's attacking or blocking.";
const EVASION =
  "Tromokratis can't be blocked unless all creatures defending player controls block it. (If any creature that player controls doesn't block this creature, it can't be blocked.)";

export default defineCard({
  name: "Tromokratis",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Kraken"],
  power: 8,
  toughness: 8,
  text: `${HEXPROOF}\n${EVASION}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { attacking: false, blocking: false } },
      grantKeywords: ["hexproof"],
      text: HEXPROOF,
    },
    { affects: { scope: "self" }, blockedOnlyByAll: true, text: EVASION },
  ],
});
