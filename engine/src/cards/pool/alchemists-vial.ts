import { defineCard } from "../define.js";

// Magic Origins (ORI). EDHREC rank 11259.

export default defineCard({
  name: "Alchemist's Vial",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: "When this artifact enters, draw a card.\n{1}, {T}, Sacrifice this artifact: Target creature can't attack or block this turn.",
  activated: [
    {
      cost: { mana: "{1}", tap: true, sacrifice: "self" },
      targets: ["creature"],
      effect: { kind: "restrict", target: 0, restrictions: ["cant-attack", "cant-block"] },
      resolve: null,
      text: "{1}, {T}, Sacrifice this artifact: Target creature can't attack or block this turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "When this artifact enters, draw a card.",
    },
  ],
});
