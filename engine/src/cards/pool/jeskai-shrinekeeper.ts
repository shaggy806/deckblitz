import { defineCard } from "../define.js";

// EDHREC rank 13597.

const DAMAGE_TEXT = "Whenever this creature deals combat damage to a player, you gain 1 life and draw a card.";

export default defineCard({
  name: "Jeskai Shrinekeeper",
  manaCost: "{2}{U}{R}{W}",
  colors: ["W", "U", "R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 3,
  toughness: 3,
  keywords: ["flying", "haste"],
  text: `Flying, haste\n${DAMAGE_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 1 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
