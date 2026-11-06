import { defineCard } from "../define.js";

// EDHREC rank 23031.

const TEXT =
  'Artifact creatures you control have "Whenever this creature deals combat damage to a player, you may pay 1 life. If you do, draw a card."';

export default defineCard({
  name: "Hive Mind Coprocessor",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Borg"],
  power: 4,
  toughness: 4,
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { types: ["artifact", "creature"], controlledBy: "you" } },
      grantsTriggered: [
        {
          trigger: { on: "deals-combat-damage-to-player", who: "self" },
          targets: [],
          effect: { kind: "may", prompt: "Pay 1 life to draw a card?", costLife: 1, effect: { kind: "draw", amount: 1 } },
          resolve: null,
          text: "Whenever this creature deals combat damage to a player, you may pay 1 life. If you do, draw a card.",
        },
      ],
      text: TEXT,
    },
  ],
});
