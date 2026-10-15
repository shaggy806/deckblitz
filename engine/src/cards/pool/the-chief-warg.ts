import { defineCard } from "../define.js";

// EDHREC rank 17002.
//
// Rulings:
//   [2026-06-29] The Chief Warg's triggered ability will check when you attack to see if you
//     control a creature with power 4 or greater. If you don't, the ability won't trigger at all.
//     It will not check again when it resolves, so the trigger will resolve even if you no longer
//     control a creature with power 4 or greater.
//
// "While you control …" is part of the trigger condition, not an intervening
// "if" (the ruling): `whileCondition`, checked only as you attack.

const TEXT =
  "Ferocious — Whenever you attack while you control a creature with power 4 or greater, you draw a card and lose 1 life.";

export default defineCard({
  name: "The Chief Warg",
  manaCost: "{2}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Wolf"],
  power: 3,
  toughness: 3,
  keywords: ["menace"],
  text: `Menace (This creature can't be blocked except by two or more creatures.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      whileCondition: { kind: "controls", filter: { type: "creature", power: { op: "gte", n: 4 } }, atLeast: 1 },
      targets: [],
      effect: { kind: "sequence", effects: [{ kind: "draw", amount: 1 }, { kind: "lose-life", amount: 1 }] },
      resolve: null,
      text: TEXT,
    },
  ],
});
