import { defineCard } from "../define.js";

export default defineCard({
  name: "Orcish Artillery",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Orc", "Warrior"],
  power: 1,
  toughness: 3,
  text: "{T}: This creature deals 2 damage to any target and 3 damage to you.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["any-target"],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [{ kind: "damage", amount: 2, target: 0 }, { kind: "damage", amount: 3, who: "you" }],
      },
      resolve: null,
      text: "{T}: This creature deals 2 damage to any target and 3 damage to you.",
    },
  ],
});
