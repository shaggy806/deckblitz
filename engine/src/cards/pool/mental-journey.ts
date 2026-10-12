import { defineCard } from "../define.js";

export default defineCard({
  name: "Mental Journey",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  cycling: { cost: "{1}{U}", search: { supertype: "basic", type: "land" } },
  text: "Draw three cards.\nBasic landcycling {1}{U} ({1}{U}, Discard this card: Search your library for a basic land card, reveal it, put it into your hand, then shuffle.)",
  effect: { kind: "draw", amount: 3 },
});
