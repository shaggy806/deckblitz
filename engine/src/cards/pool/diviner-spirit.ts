import { defineCard } from "../define.js";

const TRIGGER_TEXT =
  "Whenever this creature deals combat damage to a player, you and that player each draw that many cards.";

export default defineCard({
  name: "Diviner Spirit",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 4,
  text: TRIGGER_TEXT,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: { triggerValue: true } },
          { kind: "draw", amount: { triggerValue: true }, who: "trigger-player" },
        ],
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
