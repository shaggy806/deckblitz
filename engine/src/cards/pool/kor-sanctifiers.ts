import { defineCard } from "../define.js";

// EDHREC rank 23822.

export default defineCard({
  name: "Kor Sanctifiers",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kor", "Cleric"],
  power: 2,
  toughness: 3,
  kicker: { cost: "{W}" },
  text: "Kicker {W} (You may pay an additional {W} as you cast this spell.)\nWhen this creature enters, if it was kicked, destroy target artifact or enchantment.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["artifact-or-enchantment"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "When this creature enters, if it was kicked, destroy target artifact or enchantment.",
      condition: { kind: "self-kicked" },
    },
  ],
});
