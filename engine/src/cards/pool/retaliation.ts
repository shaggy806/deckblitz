import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 24672. Pygmy Troll's trigger, granted.

const GRANTED_TEXT = "Whenever this creature becomes blocked by a creature, this creature gets +1/+1 until end of turn.";

export default defineCard({
  name: "Retaliation",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `Creatures you control have "${GRANTED_TEXT}"`,
  static: [
    {
      affects: { scope: "creatures-you-control" },
      grantsTriggered: [
        {
          trigger: { on: "blocked-by", who: "self" },
          targets: [],
          effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: `Creatures you control have "${GRANTED_TEXT}"`,
    },
  ],
});
