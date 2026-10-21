import { defineCard } from "../define.js";

// EDHREC rank 21479.
// Hellbent's condition is Necromancer's Familiar's; the grant is Manaweft
// Sliver's, over Sliver creatures you control (this one included).

const PING = "{T}: This creature deals 1 damage to target player or planeswalker.";
const TEXT = `Hellbent — As long as you have no cards in hand, Sliver creatures you control have "${PING}"`;

export default defineCard({
  name: "Bladeback Sliver",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Sliver", controlledBy: "you" } },
      condition: { kind: "hand-size", atMost: 0 },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: ["player-or-planeswalker"],
          effect: { kind: "damage", amount: 1, target: 0 },
          resolve: null,
          text: PING,
        },
      ],
      text: TEXT,
    },
  ],
});
