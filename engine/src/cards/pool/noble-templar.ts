import { defineCard } from "../define.js";

export default defineCard({
  name: "Noble Templar",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric", "Soldier"],
  power: 3,
  toughness: 6,
  keywords: ["vigilance"],
  cycling: { cost: "{2}", search: { subtype: "Plains" } },
  text: "Vigilance\nPlainscycling {2} ({2}, Discard this card: Search your library for a Plains card, reveal it, put it into your hand, then shuffle.)",
});
