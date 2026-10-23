import { defineCard } from "../define.js";
import { melee } from "../helpers.js";

// EDHREC rank 21311.
//
// Rulings:
//   [2016-08-23] You determine the size of the bonus as the melee ability resolves. Count each
//     opponent that you attacked with one or more creatures.
//
// The second ability is Hydra Omnivore's: the combat damage dealt to that
// opponent, dealt again by this creature to each other opponent.

const MELEE_TEXT =
  "Melee (Whenever this creature attacks, it gets +1/+1 until end of turn for each opponent you attacked this combat.)";
const SPLASH_TEXT = "Whenever this creature deals combat damage to an opponent, it deals that much damage to each other opponent.";

export default defineCard({
  name: "Grenzo's Ruffians",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 2,
  toughness: 2,
  text: `${MELEE_TEXT}\n${SPLASH_TEXT}`,
  triggered: [
    melee(),
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self", toOpponent: true },
      targets: [],
      effect: { kind: "damage", amount: { triggerValue: true }, who: "each-other-opponent" },
      resolve: null,
      text: SPLASH_TEXT,
    },
  ],
});
