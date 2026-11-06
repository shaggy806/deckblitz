import { defineCard } from "../define.js";

// Star Trek Commander (TRC).

const GRANTED = "Whenever this creature deals combat damage to a player, draw a card.";
const TEXT = `Artifact creatures you control have "${GRANTED}"`;

export default defineCard({
  name: "Co-Option Adjutant",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Borg"],
  power: 3,
  toughness: 3,
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { types: ["artifact", "creature"], controlledBy: "you" } },
      grantsTriggered: [
        {
          trigger: { on: "deals-combat-damage-to-player", who: "self" },
          targets: [],
          effect: { kind: "draw", amount: 1 },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: TEXT,
    },
  ],
});
