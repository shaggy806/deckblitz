import { defineCard } from "../define.js";

// Khans of Tarkir (KTK). EDHREC rank 25814. A `block-if-able` requirement
// naming this creature, for this combat only.

const TRIGGER =
  "Whenever this creature attacks, target creature defending player controls blocks it this combat if able.";

export default defineCard({
  name: "Avalanche Tusker",
  manaCost: "{2}{G}{U}{R}",
  colors: ["U", "R", "G"],
  types: ["creature"],
  subtypes: ["Elephant", "Warrior"],
  power: 6,
  toughness: 4,
  text: TRIGGER,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["creature-defending-player-controls"],
      effect: { kind: "block-if-able", target: 0, attacker: "source", thisCombat: true },
      resolve: null,
      text: TRIGGER,
    },
  ],
});
