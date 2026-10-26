import { defineCard } from "../define.js";

// EDHREC rank 24878.

export default defineCard({
  name: "Gleam of Resistance",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["instant"],
  cycling: { cost: "{1}{W}", search: { supertype: "basic", type: "land" } },
  text: "Creatures you control get +1/+2 until end of turn. Untap those creatures.\nBasic landcycling {1}{W} ({1}{W}, Discard this card: Search your library for a basic land card, reveal it, put it into your hand, then shuffle.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 1,
        toughness: 2,
        duration: "end-of-turn",
      },
      { kind: "untap-all", filter: { type: "creature", controlledBy: "you" } },
    ],
  },
});
