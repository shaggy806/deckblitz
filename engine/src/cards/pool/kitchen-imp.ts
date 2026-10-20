import { defineCard } from "../define.js";

export default defineCard({
  name: "Kitchen Imp",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Imp"],
  power: 2,
  toughness: 2,
  keywords: ["flying", "haste"],
  madness: { cost: "{B}" },
  text: "Flying, haste\nMadness {B} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)",
});
