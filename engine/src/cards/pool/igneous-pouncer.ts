import { defineCard } from "../define.js";

export default defineCard({
  name: "Igneous Pouncer",
  manaCost: "{4}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 5,
  toughness: 1,
  keywords: ["haste"],
  text: "Haste\nSwampcycling {2}, mountaincycling {2} ({2}, Discard this card: Search your library for a Swamp or Mountain card, reveal it, put it into your hand, then shuffle.)",
  cycling: { cost: "{2}", search: { subtype: "Swamp" }, name: "Swampcycling" },
  moreCycling: [{ cost: "{2}", search: { subtype: "Mountain" }, name: "Mountaincycling" }],
});
