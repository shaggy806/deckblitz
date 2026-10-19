import { defineCard } from "../define.js";

// EDHREC rank 25945.
//
// Rulings:
//   [2022-09-09] Cleaving Skyrider's triggered ability counts all attacking creatures, even
//     attacking creatures other players control.

const ETB_TEXT =
  "When this creature enters, if it was kicked, it deals X damage to any target, where X is the number of attacking creatures.";

export default defineCard({
  name: "Cleaving Skyrider",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 2,
  keywords: ["flash", "flying"],
  text: `Flash\nKicker {2}{R} (You may pay an additional {2}{R} as you cast this spell.)\nFlying\n${ETB_TEXT}`,
  kicker: { cost: "{2}{R}" },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "self-kicked" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: { countOf: { type: "creature", attacking: true } }, target: 0 },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
