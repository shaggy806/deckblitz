import { defineCard } from "../define.js";

// EDHREC rank 7579. Ixalan.

export default defineCard({
  name: "Raging Swordtooth",
  manaCost: "{3}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 5,
  toughness: 5,
  keywords: ["trample"],
  text: "Trample\nWhen this creature enters, it deals 1 damage to each other creature.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "damage-all", filter: { type: "creature" }, amount: 1, exceptSource: true },
      resolve: null,
      text: "When this creature enters, it deals 1 damage to each other creature.",
    },
  ],
});
