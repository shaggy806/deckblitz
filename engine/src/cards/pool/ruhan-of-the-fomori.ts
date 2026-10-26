import { defineCard } from "../define.js";

// EDHREC rank 16234. The opponent is chosen at random as the trigger
// resolves, each combat anew; Ruhan must attack that player (not one of
// their planeswalkers) if able, and is free otherwise (the rulings — Raving
// Dead's `attack-random-opponent`).
const TEXT =
  "At the beginning of combat on your turn, choose an opponent at random. Ruhan attacks that player this combat if able.";

export default defineCard({
  name: "Ruhan of the Fomori",
  manaCost: "{1}{U}{R}{W}",
  colors: ["U", "R", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Giant", "Warrior"],
  power: 7,
  toughness: 7,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: { kind: "attack-random-opponent", target: "source" },
      resolve: null,
      text: TEXT,
    },
  ],
});
