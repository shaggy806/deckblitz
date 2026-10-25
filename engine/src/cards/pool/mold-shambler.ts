import { defineCard } from "../define.js";

const ETB = "When this creature enters, if it was kicked, destroy target noncreature permanent.";

export default defineCard({
  name: "Mold Shambler",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Fungus", "Beast"],
  power: 3,
  toughness: 3,
  kicker: { cost: "{1}{G}" },
  text: `Kicker {1}{G} (You may pay an additional {1}{G} as you cast this spell.)\n${ETB}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "self-kicked" },
      targets: [{ kind: "permanent", filter: { notTypes: ["creature"] } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: ETB,
    },
  ],
});
