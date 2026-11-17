import { defineCard } from "../define.js";

// The half of Indulge // Excess cast from the hand. A delayed triggered
// ability for the rest of the turn (rule 603.7): each creature you control
// that attacks makes a Citizen attacking whichever player or planeswalker you
// choose (rule 508.4), never declared as an attacker, so it doesn't trigger
// this again.
const FACES = ["Indulge // Excess", "Indulge", "Excess"];
const TEXT =
  "Whenever a creature you control attacks this turn, create a 1/1 green and white Citizen creature token that's tapped and attacking.";

export default defineCard({
  name: "Indulge",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "delayed-trigger",
    at: { whenever: { on: "attacks", who: "you-control", filter: { type: "creature" } } },
    effect: { kind: "create-token", token: "Citizen Token", count: 1, tapped: true, attacking: "choose" },
    text: TEXT,
  },
  faces: FACES,
  split: true,
});
