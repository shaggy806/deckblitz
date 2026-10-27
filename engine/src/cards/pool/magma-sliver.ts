import { defineCard } from "../define.js";

// Legions (LGN). EDHREC rank 11945.
//
// X counts every Sliver on the battlefield, each player's, as the granted
// ability resolves.

const GRANTED = "{T}: Target Sliver creature gets +X/+0 until end of turn, where X is the number of Slivers on the battlefield.";

export default defineCard({
  name: "Magma Sliver",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 3,
  toughness: 3,
  text: `All Slivers have "${GRANTED}"`,
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Sliver" } },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: [{ kind: "permanent", filter: { type: "creature", subtype: "Sliver" } }],
          effect: {
            kind: "modify-pt",
            target: 0,
            power: { countOf: { subtype: "Sliver" } },
            toughness: 0,
            duration: "end-of-turn",
          },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: `All Slivers have "${GRANTED}"`,
    },
  ],
});
