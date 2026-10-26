import { defineCard } from "../define.js";

// Planar Chaos (PLC). EDHREC rank 16122.

export default defineCard({
  name: "Reckless Wurm",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 4,
  toughness: 4,
  keywords: ["trample"],
  madness: { cost: "{2}{R}" },
  text: "Trample\nMadness {2}{R} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)",
});
