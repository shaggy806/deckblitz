import { defineCard } from "../define.js";

// An attack requirement aimed at you (rule 508.1d): obeyed only by attacking
// you, so it binds only while it can attack you — a planeswalker of yours is
// not you.
const TAP_TEXT = "{T}: Target creature an opponent controls attacks you this turn if able.";

export default defineCard({
  name: "Alluring Siren",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Siren"],
  power: 1,
  toughness: 1,
  text: TAP_TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "attack-requirement", target: 0, attacks: "you", duration: "this-turn" },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
});
