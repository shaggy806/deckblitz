import { CHOSEN_COLOR } from "../../effects.js";
import { defineCard } from "../define.js";

// The color is chosen as it resolves, after the payment and before the hand is
// seen (the ruling).
const TEXT =
  "Whenever Crosis deals combat damage to a player, you may pay {2}{B}. If you do, choose a color, then that player reveals their hand and discards all cards of that color.";

export default defineCard({
  name: "Crosis, the Purger",
  manaCost: "{3}{U}{B}{R}",
  colors: ["U", "B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {2}{B} to choose a color and have that player reveal their hand and discard all cards of it?",
        cost: "{2}{B}",
        effect: {
          kind: "choose-value",
          value: "color",
          then: { kind: "discard-hand", who: "trigger-player", filter: { colors: [CHOSEN_COLOR] }, reveal: true },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
