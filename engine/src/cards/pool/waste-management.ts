import { defineCard } from "../define.js";

// EDHREC rank 19379.
// Kicked, the spell has only the player target; either way it makes a Rogue for each creature card
// it exiled (the ruling).

export default defineCard({
  name: "Waste Management",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Kicker {3}{B} (You may pay an additional {3}{B} as you cast this spell.)\nExile up to two target cards from a single graveyard. If this spell was kicked, instead exile target player's graveyard. Create a 2/2 black Rogue creature token for each creature card exiled this way.",
  targets: [
    {
      kind: "any-number",
      of: { kind: "card-in-graveyard", whose: "any" },
      max: 2,
      sameController: true,
    },
  ],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "for-each-target",
        from: 0,
        simultaneous: true,
        effect: { kind: "exile", target: 0 },
      },
      {
        kind: "create-token",
        token: "Rogue Token",
        count: { thisWay: "exiled", filter: { type: "creature" } },
      },
    ],
  },
  kicker: {
    cost: "{3}{B}",
    targets: ["player"],
    effect: {
      kind: "sequence",
      effects: [
        { kind: "exile-graveyard", target: 0 },
        {
          kind: "create-token",
          token: "Rogue Token",
          count: { thisWay: "exiled", filter: { type: "creature" } },
        },
      ],
    },
  },
});
