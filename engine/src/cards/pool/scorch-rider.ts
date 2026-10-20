import { defineCard } from "../define.js";

const ETB = "When this creature enters, if it was kicked, it gains haste until end of turn.";

export default defineCard({
  name: "Scorch Rider",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 4,
  toughness: 3,
  text: `Kicker {1}{R} (You may pay an additional {1}{R} as you cast this spell.)\n${ETB}`,
  kicker: { cost: "{1}{R}" },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "self-kicked" },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "haste", duration: "end-of-turn" },
      resolve: null,
      text: ETB,
    },
  ],
});
