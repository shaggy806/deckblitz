import { defineCard } from "../define.js";

// Rolls to visit (rule 701.52a) as the ability resolves — the same roll as
// the precombat main phase's turn-based one, and a second visit to anything lit
// up for it.

const ENTER = "When this creature enters, roll to visit your Attractions.";

export default defineCard({
  name: "Line Cutter",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Rogue", "Guest"],
  power: 3,
  toughness: 4,
  text: ENTER,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "roll-to-visit" },
      resolve: null,
      text: ENTER,
    },
  ],
});
