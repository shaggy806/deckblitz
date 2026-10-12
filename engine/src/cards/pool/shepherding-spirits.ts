import { defineCard } from "../define.js";

export default defineCard({
  name: "Shepherding Spirits",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 4,
  toughness: 5,
  keywords: ["flying"],
  cycling: { cost: "{2}", search: { subtype: "Plains" } },
  text: "Flying\nPlainscycling {2} ({2}, Discard this card: Search your library for a Plains card, reveal it, put it into your hand, then shuffle.)",
});
