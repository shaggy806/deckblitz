import { defineCard } from "../define.js";
import { CHOSEN_COLOR } from "../../effects.js";

const TEXT =
  "Whenever Darigaaz deals combat damage to a player, you may pay {2}{R}. If you do, choose a color, then that player reveals their hand and Darigaaz deals damage to the player equal to the number of cards of that color revealed this way.";

// The color is chosen as it resolves, after the payment and before the hand
// is seen; a multicolored card of that color counts.
export default defineCard({
  name: "Darigaaz, the Igniter",
  manaCost: "{3}{B}{R}{G}",
  colors: ["B", "R", "G"],
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
        prompt: "Pay {2}{R} to choose a color and have that player reveal their hand?",
        cost: "{2}{R}",
        effect: {
          kind: "choose-value",
          value: "color",
          then: {
            kind: "sequence",
            effects: [
              { kind: "reveal-hand", who: "trigger-player" },
              {
                kind: "damage",
                who: "trigger-player",
                amount: { thisWay: "revealed", filter: { colors: [CHOSEN_COLOR] } },
              },
            ],
          },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
