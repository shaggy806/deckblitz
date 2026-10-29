import { defineCard } from "../define.js";

// EDHREC rank 29834.

export default defineCard({
  name: "Rag Dealer",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 1,
  toughness: 1,
  text: "{2}{B}, {T}: Exile up to three target cards from a single graveyard.",
  activated: [
    {
      cost: { mana: "{2}{B}", tap: true },
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
      resolve: null,
      text: "{2}{B}, {T}: Exile up to three target cards from a single graveyard.",
    },
  ],
});
