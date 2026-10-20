import { defineCard } from "../define.js";

// Ruling: a creature that can't block the target creature (tapped, say), or
// one whose blocking has a cost, isn't made to block it.

const ETB =
  "When this creature enters, if it was kicked, all creatures able to block target creature this turn do so.";

export default defineCard({
  name: "Taunting Arbormage",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Wizard"],
  power: 2,
  toughness: 3,
  text: `Kicker {3} (You may pay an additional {3} as you cast this spell.)\n${ETB}`,
  kicker: { cost: "{3}" },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "self-kicked" },
      targets: ["creature"],
      effect: { kind: "restrict", target: 0, restrictions: ["must-be-blocked"] },
      resolve: null,
      text: ETB,
    },
  ],
});
