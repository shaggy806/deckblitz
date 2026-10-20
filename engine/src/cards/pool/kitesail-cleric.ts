import { defineCard } from "../define.js";

const ETB = "When this creature enters, if it was kicked, tap up to two target creatures.";

export default defineCard({
  name: "Kitesail Cleric",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kor", "Cleric"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: `Kicker {2}{W} (You may pay an additional {2}{W} as you cast this spell.)\nFlying\n${ETB}`,
  kicker: { cost: "{2}{W}" },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "self-kicked" },
      targets: [
        { kind: "optional", of: "creature" },
        { kind: "optional", of: { kind: "other", of: "creature", than: { slot: 0 } } },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "tap", target: 1 },
        ],
      },
      resolve: null,
      text: ETB,
    },
  ],
});
