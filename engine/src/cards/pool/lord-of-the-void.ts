import { defineCard } from "../define.js";

// Gatecrash (GTC). The seven are exiled first, then a creature card is put
// from among them (`thisWay: "exiled"` over the exile zone) onto the
// battlefield under your control — not optional when there is one (the
// ruling); the rest stay exiled.
//
// Rulings:
//   [2013-01-24] Lord of the Void's ability isn't optional. If there is a creature card among the
//     seven cards you exiled, you must put one onto the battlefield under your control.

const TEXT =
  "Whenever this creature deals combat damage to a player, exile the top seven cards of that player's library, then put a creature card from among them onto the battlefield under your control.";

export default defineCard({
  name: "Lord of the Void",
  manaCost: "{4}{B}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 7,
  toughness: 7,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile-from-library", whose: "trigger-player", amount: 7 },
          {
            kind: "look-and-choose",
            zone: "exile",
            min: 1,
            max: 1,
            filter: { thisWay: "exiled", type: "creature" },
            destination: "battlefield",
            leftover: "stay",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
