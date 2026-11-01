import { defineCard } from "../define.js";

const TEXT = "When this creature enters, destroy all other creatures you control. If it was kicked, destroy all other creatures instead.";

export default defineCard({
  name: "Desolation Giant",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Giant"],
  power: 3,
  toughness: 3,
  kicker: { cost: "{W}{W}" },
  text: `Kicker {W}{W} (You may pay an additional {W}{W} as you cast this spell.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "self-kicked" },
        then: { kind: "destroy-all", filter: { type: "creature" }, exceptSource: true },
        else: { kind: "destroy-all", filter: { type: "creature", controlledBy: "you" }, exceptSource: true },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
