import { defineCard } from "../define.js";

// EDHREC rank 25671. Torment.

export default defineCard({
  name: "Arrogant Wurm",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 4,
  toughness: 4,
  keywords: ["trample"],
  madness: { cost: "{2}{G}" },
  text: "Trample\nMadness {2}{G} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)",
});
