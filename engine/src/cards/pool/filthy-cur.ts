import { defineCard } from "../define.js";

// EDHREC rank 28187.

const TEXT = "Whenever this creature is dealt damage, you lose that much life.";

export default defineCard({
  name: "Filthy Cur",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Dog"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "self" },
      targets: [],
      effect: { kind: "lose-life", amount: { triggerValue: true } },
      resolve: null,
      text: TEXT,
    },
  ],
});
