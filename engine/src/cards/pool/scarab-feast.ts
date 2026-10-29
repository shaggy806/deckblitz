import { defineCard } from "../define.js";

// EDHREC rank 20321.

export default defineCard({
  name: "Scarab Feast",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  cycling: { cost: "{B}" },
  text: "Exile up to three target cards from a single graveyard.\nCycling {B} ({B}, Discard this card: Draw a card.)",
  targets: [
    {
      kind: "any-number",
      of: { kind: "card-in-graveyard", whose: "any" },
      max: 3,
      sameController: true,
    },
  ],
  effect: {
    kind: "for-each-target",
    from: 0,
    simultaneous: true,
    effect: { kind: "exile", target: 0 },
  },
});
