import { defineCard } from "../define.js";

// EDHREC rank 19940.

export default defineCard({
  name: "Weirded Vampire",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Horror"],
  power: 3,
  toughness: 3,
  madness: { cost: "{2}{B}" },
  text: "Madness {2}{B} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)",
});
