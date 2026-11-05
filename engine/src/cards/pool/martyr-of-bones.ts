import { defineCard } from "../define.js";

// EDHREC rank 31058.

export default defineCard({
  name: "Martyr of Bones",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
  text: "{1}, Reveal X black cards from your hand, Sacrifice this creature: Exile up to X target cards from a single graveyard.",
  activated: [
    {
      cost: {
        mana: "{1}",
        tap: false,
        reveal: { count: "x", filter: { colors: ["B"] }, text: "black cards" },
        sacrifice: "self",
      },
      targets: [
        {
          kind: "any-number",
          of: { kind: "card-in-graveyard", whose: "any" },
          max: "x",
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
      text: "{1}, Reveal X black cards from your hand, Sacrifice this creature: Exile up to X target cards from a single graveyard.",
    },
  ],
});
