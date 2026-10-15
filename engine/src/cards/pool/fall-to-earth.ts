import { defineCard } from "../define.js";

// EDHREC rank 27163.

export default defineCard({
  name: "Fall to Earth",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["instant"],
  cycling: { cost: "{2}", search: { supertype: "basic", type: "land" } },
  text: "Exile target creature. Each player gains 3 life.\nBasic landcycling {2} ({2}, Discard this card: Search your library for a basic land card, reveal it, put it into your hand, then shuffle.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      { kind: "gain-life", amount: 3, who: "each-player" },
    ],
  },
});
