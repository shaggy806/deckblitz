import { defineCard } from "../define.js";

// EDHREC rank 18315.
//
// Rulings:
//   [2026-06-29] Nighthowl Pursuer's triggered ability will check when it attacks to see if you
//     control a creature with power 4 or greater. If you don't, the ability won't trigger at all.
//     It will not check again when it resolves, so the ability will resolve even if you no longer
//     control a creature with power 4 or greater.
//
// Ruby, Daring Tracker's trigger: `whileCondition`, asked only as it attacks.

const TEXT =
  "Ferocious — Whenever this creature attacks while you control a creature with power 4 or greater, this creature gets +2/+2 until end of turn.";

export default defineCard({
  name: "Nighthowl Pursuer",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Wolf"],
  power: 1,
  toughness: 1,
  keywords: ["menace"],
  text: `Menace (This creature can't be blocked except by two or more creatures.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      whileCondition: { kind: "controls", filter: { type: "creature", power: { op: "gte", n: 4 } }, atLeast: 1 },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
