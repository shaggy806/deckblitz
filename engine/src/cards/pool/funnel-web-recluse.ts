import { defineCard } from "../define.js";

export default defineCard({
  name: "Funnel-Web Recluse",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spider"],
  power: 3,
  toughness: 5,
  keywords: ["reach"],
  text: "Reach\nMorbid — When this creature enters, if a creature died this turn, investigate. (Create a Clue token. It's an artifact with \"{2}, Sacrifice this token: Draw a card.\")",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Clue Token", count: 1 },
      resolve: null,
      text: "Morbid — When this creature enters, if a creature died this turn, investigate.",
      condition: { kind: "creature-died-this-turn" },
    },
  ],
});
