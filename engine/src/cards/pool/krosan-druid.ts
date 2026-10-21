import { defineCard } from "../define.js";

// EDHREC rank 24581.

export default defineCard({
  name: "Krosan Druid",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Centaur", "Druid"],
  power: 2,
  toughness: 3,
  kicker: { cost: "{4}{G}" },
  text: "Kicker {4}{G} (You may pay an additional {4}{G} as you cast this spell.)\nWhen this creature enters, if it was kicked, you gain 10 life.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 10 },
      resolve: null,
      text: "When this creature enters, if it was kicked, you gain 10 life.",
      condition: { kind: "self-kicked" },
    },
  ],
});
