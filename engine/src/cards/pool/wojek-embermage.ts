import { defineCard } from "../define.js";

// EDHREC rank 22565.

export default defineCard({
  name: "Wojek Embermage",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 2,
  text: "Radiance — {T}: This creature deals 1 damage to target creature and each other creature that shares a color with it.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: { kind: "damage-all", amount: 1, filter: { type: "creature", sharesColorWithTarget: 0 } },
      resolve: null,
      text: "Radiance — {T}: This creature deals 1 damage to target creature and each other creature that shares a color with it.",
    },
  ],
});
