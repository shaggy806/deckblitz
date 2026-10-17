import { defineCard } from "../define.js";

// EDHREC rank 13648.
const GRANTED_TEXT =
  "Whenever this creature deals combat damage to a player, exile the top card of your library. You may play that card this turn.";

export default defineCard({
  name: "Capricious Sliver",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 3,
  toughness: 3,
  text: `Sliver creatures you control have "${GRANTED_TEXT}"`,
  static: [
    {
      affects: { scope: "creatures-you-control", subtype: "Sliver" },
      grantsTriggered: [
        {
          trigger: { on: "deals-combat-damage-to-player", who: "self" },
          targets: [],
          effect: { kind: "impulse-exile", amount: 1, duration: "end-of-turn" },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: `Sliver creatures you control have "${GRANTED_TEXT}"`,
    },
  ],
});
