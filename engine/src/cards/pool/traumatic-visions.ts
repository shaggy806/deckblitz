import { defineCard } from "../define.js";

export default defineCard({
  name: "Traumatic Visions",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  cycling: { cost: "{1}{U}", search: { supertype: "basic", type: "land" } },
  text: "Counter target spell.\nBasic landcycling {1}{U} ({1}{U}, Discard this card: Search your library for a basic land card, reveal it, put it into your hand, then shuffle.)",
  targets: ["spell"],
  effect: { kind: "counter", target: 0 },
});
