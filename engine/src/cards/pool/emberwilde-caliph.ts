import { defineCard } from "../define.js";

// EDHREC rank 30938.

export default defineCard({
  name: "Emberwilde Caliph",
  manaCost: "{2}{U}{R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Djinn"],
  power: 4,
  toughness: 4,
  keywords: ["flying", "trample"],
  text: "Flying, trample\nThis creature attacks each combat if able.\nWhenever this creature deals damage, you lose that much life.",
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["must-attack"],
      text: "This creature attacks each combat if able.",
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self" },
      targets: [],
      effect: { kind: "lose-life", amount: { triggerValue: true } },
      resolve: null,
      text: "Whenever this creature deals damage, you lose that much life.",
    },
  ],
});
