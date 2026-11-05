import { defineCard } from "../define.js";

// EDHREC rank 19457.

export default defineCard({
  name: "Loyal Pegasus",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Pegasus"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nThis creature can't attack or block alone.",
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["cant-attack-alone", "cant-block-alone"],
      text: "This creature can't attack or block alone.",
    },
  ],
});
