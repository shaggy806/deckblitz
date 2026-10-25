import { defineCard } from "../define.js";

export default defineCard({
  name: "Mardu Strike Leader",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 2,
  dash: { cost: "{3}{B}" },
  text: "Whenever this creature attacks, create a 2/1 black Warrior creature token.\nDash {3}{B} (You may cast this spell for its dash cost. If you do, it gains haste, and it's returned from the battlefield to its owner's hand at the beginning of the next end step.)",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Black Warrior Token", count: 1 },
      resolve: null,
      text: "Whenever this creature attacks, create a 2/1 black Warrior creature token.",
    },
  ],
});
