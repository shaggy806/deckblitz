import { defineCard } from "../define.js";

// Battlebond. EDHREC rank 27020.
//
// Any damage, not only combat damage (Thieving Otter's trigger).

const TEXT = "Whenever this creature deals damage to an opponent, target player draws a card.";

export default defineCard({
  name: "Saltwater Stalwart",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Warrior"],
  power: 2,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "opponent" },
      targets: ["player"],
      effect: { kind: "draw", amount: 1, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
