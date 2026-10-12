import { defineCard } from "../define.js";

export default defineCard({
  name: "Marvelous Melee",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["instant"],
  cycling: { cost: "{2}", search: { supertype: "basic", type: "land" } },
  text: "Marvelous Melee deals 6 damage to target creature.\nBasic landcycling {2} ({2}, Discard this card: Search your library for a basic land card, reveal it, put it into your hand, then shuffle.)",
  targets: ["creature"],
  effect: { kind: "damage", amount: 6, target: 0 },
});
