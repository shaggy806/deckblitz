import { defineCard } from "../define.js";

export default defineCard({
  name: "Fiery Fall",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["instant"],
  cycling: { cost: "{1}{R}", search: { supertype: "basic", type: "land" } },
  text: "Fiery Fall deals 5 damage to target creature.\nBasic landcycling {1}{R} ({1}{R}, Discard this card: Search your library for a basic land card, reveal it, put it into your hand, then shuffle.)",
  targets: ["creature"],
  effect: { kind: "damage", amount: 5, target: 0 },
});
