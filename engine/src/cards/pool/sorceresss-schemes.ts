import { defineCard } from "../define.js";

// One slot over two zones (`one-of`). Of the two returns, only the one from the
// zone the target is in does anything.
export default defineCard({
  name: "Sorceress's Schemes",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text:
    "Return target instant or sorcery card from your graveyard or exiled card with flashback you own to your hand. Add {R}.\n" +
    "Flashback {4}{R} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: [
    {
      kind: "one-of",
      of: [
        { kind: "card-in-graveyard", whose: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
        { kind: "card-in-exile", whose: "you", filter: { hasKeyword: "flashback" } },
      ],
    },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0, from: "graveyard" },
      { kind: "return-to-hand", target: 0, from: "exile" },
      { kind: "add-mana", mana: "R", amount: 1 },
    ],
  },
  flashback: { cost: "{4}{R}" },
});
