import { defineCard } from "../define.js";

const GRANT_TEXT =
  'Artifact creatures you control have "Whenever this creature deals combat damage to a player, put a +1/+1 counter on it."';

export default defineCard({
  name: "Supplementation Node",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["artifact", "creature"],
  subtypes: ["Borg"],
  power: 2,
  toughness: 2,
  text: GRANT_TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { types: ["artifact", "creature"], controlledBy: "you" } },
      grantsTriggered: [
        {
          trigger: { on: "deals-combat-damage-to-player", who: "self" },
          targets: [],
          effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          resolve: null,
          text: "Whenever this creature deals combat damage to a player, put a +1/+1 counter on it.",
        },
      ],
      text: GRANT_TEXT,
    },
  ],
});
