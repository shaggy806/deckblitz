import { defineCard } from "../define.js";

// Planar Chaos (PLC). EDHREC rank 19908.

export default defineCard({
  name: "Citanul Woodreaders",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 1,
  toughness: 4,
  kicker: { cost: "{2}{G}" },
  text: "Kicker {2}{G} (You may pay an additional {2}{G} as you cast this spell.)\nWhen this creature enters, if it was kicked, draw two cards.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 2 },
      resolve: null,
      text: "When this creature enters, if it was kicked, draw two cards.",
      condition: { kind: "self-kicked" },
    },
  ],
});
