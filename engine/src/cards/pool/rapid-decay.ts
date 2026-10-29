import { defineCard } from "../define.js";

// EDHREC rank 28664.

export default defineCard({
  name: "Rapid Decay",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  cycling: { cost: "{2}" },
  text: "Exile up to three target cards from a single graveyard.\nCycling {2} ({2}, Discard this card: Draw a card.)",
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
