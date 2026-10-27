import { defineCard } from "../define.js";

// EDHREC rank 23727.

const ETB = "When this creature enters, destroy all lands you control. If it was kicked, destroy all lands instead.";

export default defineCard({
  name: "Desolation Angel",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 5,
  toughness: 4,
  keywords: ["flying"],
  kicker: { cost: "{W}{W}" },
  text: `Kicker {W}{W} (You may pay an additional {W}{W} as you cast this spell.)\nFlying\n${ETB}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "self-kicked" },
        then: { kind: "destroy-all", filter: { type: "land" } },
        else: { kind: "destroy-all", filter: { type: "land", controlledBy: "you" } },
      },
      resolve: null,
      text: ETB,
    },
  ],
});
