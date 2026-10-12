import { defineCard } from "../define.js";

export default defineCard({
  name: "Bloodrite Invoker",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Shaman"],
  power: 3,
  toughness: 1,
  text: "{8}: Target player loses 3 life and you gain 3 life.",
  activated: [
    {
      cost: { mana: "{8}", tap: false },
      targets: ["player"],
      effect: {
        kind: "sequence",
        effects: [{ kind: "lose-life", amount: 3, target: 0 }, { kind: "gain-life", amount: 3 }],
      },
      resolve: null,
      text: "{8}: Target player loses 3 life and you gain 3 life.",
    },
  ],
});
