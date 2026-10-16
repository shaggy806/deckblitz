import { defineCard } from "../define.js";

// EDHREC rank 17723.

export default defineCard({
  name: "Attentive Sunscribe",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["artifact", "creature"],
  subtypes: ["Gnome"],
  power: 2,
  toughness: 2,
  text: "Whenever this creature becomes tapped, scry 1. (Look at the top card of your library. You may put that card on the bottom.)",
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "self" },
      targets: [],
      effect: { kind: "scry", amount: 1 },
      resolve: null,
      text: "Whenever this creature becomes tapped, scry 1.",
    },
  ],
});
