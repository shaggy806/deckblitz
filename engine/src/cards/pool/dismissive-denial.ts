import { defineCard } from "../define.js";

export default defineCard({
  name: "Dismissive Denial",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  cycling: { cost: "{2}", search: { supertype: "basic", type: "land" } },
  text: "Counter target spell.\nBasic landcycling {2} ({2}, Discard this card: Search your library for a basic land card, reveal it, put it into your hand, then shuffle.)",
  targets: ["spell"],
  effect: { kind: "counter", target: 0 },
});
