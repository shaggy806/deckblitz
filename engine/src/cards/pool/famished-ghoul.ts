import { defineCard } from "../define.js";

// EDHREC rank 31780.

export default defineCard({
  name: "Famished Ghoul",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 3,
  toughness: 2,
  text: "{1}{B}, Sacrifice this creature: Exile up to two target cards from a single graveyard.",
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false, sacrifice: "self" },
      targets: [
        {
          kind: "any-number",
          of: { kind: "card-in-graveyard", whose: "any" },
          max: 2,
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
      text: "{1}{B}, Sacrifice this creature: Exile up to two target cards from a single graveyard.",
    },
  ],
});
