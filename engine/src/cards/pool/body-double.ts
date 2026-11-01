import { defineCard } from "../define.js";

// A card has only what's printed on it to copy (rule 707.2). Declining, or
// with no creature card in any graveyard, it's a 0/0 (its ruling).
export default defineCard({
  name: "Body Double",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 0,
  toughness: 0,
  text: "You may have this creature enter as a copy of any creature card in a graveyard.",
  copyOnEnter: { filter: { type: "creature" }, from: "graveyards" },
});
