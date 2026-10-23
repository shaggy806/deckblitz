import { defineCard } from "../define.js";

// EDHREC rank 17835.

export default defineCard({
  name: "Twins of Maurer Estate",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 3,
  toughness: 5,
  madness: { cost: "{2}{B}" },
  text: "Madness {2}{B} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)",
});
