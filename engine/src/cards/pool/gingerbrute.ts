import { defineCard } from "../define.js";

// "Except by creatures with haste" is the filter's negation, and a block
// already made stands (as Resilient Roadrunner's).
const DODGE = "{1}: This creature can't be blocked this turn except by creatures with haste.";
const SNACK = "{2}, {T}, Sacrifice this creature: You gain 3 life.";

export default defineCard({
  name: "Gingerbrute",
  manaCost: "{1}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Food", "Golem"],
  power: 1,
  toughness: 1,
  keywords: ["haste"],
  text: `Haste (This creature can attack and {T} as soon as it comes under your control.)\n${DODGE}\n${SNACK}`,
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: { kind: "restrict", target: "source", restrictions: [], cantBeBlockedBy: { notKeyword: "haste" } },
      resolve: null,
      text: DODGE,
    },
    {
      cost: { mana: "{2}", tap: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 3 },
      resolve: null,
      text: SNACK,
    },
  ],
});
