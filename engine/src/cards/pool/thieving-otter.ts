import { defineCard } from "../define.js";

// EDHREC rank 11990. Ikoria: Lair of Behemoths.

const TRIGGER_TEXT = "Whenever this creature deals damage to an opponent, draw a card.";

export default defineCard({
  name: "Thieving Otter",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Otter"],
  power: 2,
  toughness: 2,
  text: TRIGGER_TEXT,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "opponent" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
