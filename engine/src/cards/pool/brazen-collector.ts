import { defineCard } from "../define.js";

// EDHREC rank 10384.
//
// "Until end of turn, you don't lose this mana as steps and phases end" is
// `persists` on the mana (Savage Ventmaw's shape).

const TEXT =
  "Whenever this creature attacks, add {R}. Until end of turn, you don't lose this mana as steps and phases end.";

export default defineCard({
  name: "Brazen Collector",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Raccoon", "Rogue"],
  power: 2,
  toughness: 1,
  keywords: ["first-strike"],
  text: `First strike\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "add-mana", mana: "R", amount: 1, persists: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
