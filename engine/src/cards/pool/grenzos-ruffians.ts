import { defineCard } from "../define.js";
import { melee } from "../helpers.js";

const TEXT = "Whenever this creature deals combat damage to an opponent, it deals that much damage to each other opponent.";

export default defineCard({
  name: "Grenzo's Ruffians",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 2,
  toughness: 2,
  text: `Melee (Whenever this creature attacks, it gets +1/+1 until end of turn for each opponent you attacked this combat.)\n${TEXT}`,
  triggered: [
    melee(),
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self", toOpponent: true },
      targets: [],
      effect: { kind: "damage", amount: { triggerValue: true }, who: "each-other-opponent" },
      resolve: null,
      text: TEXT,
    },
  ],
});
