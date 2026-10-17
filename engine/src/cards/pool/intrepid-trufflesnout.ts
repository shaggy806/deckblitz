import { defineCard } from "../define.js";

// Rulings:
//   [2023-09-01] A creature attacks alone if it's the only creature declared as an attacker
//     during the declare attackers step.

const TEXT =
  "Whenever this creature attacks alone, create a Food token. (It's an artifact with \"{2}, {T}, Sacrifice this token: You gain 3 life.\")";

export default defineCard({
  name: "Intrepid Trufflesnout",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Boar"],
  power: 3,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks-alone", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Food Token", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Intrepid Trufflesnout", "Go Hog Wild"],
  adventure: true,
});
