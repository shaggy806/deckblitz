import { defineCard } from "../define.js";

export default defineCard({
  name: "Windmill Slam",
  manaCost: "{7}",
  colors: [],
  types: ["sorcery"],
  miracle: { cost: "{0}" },
  text: "Create a 4/4 Windmill artifact creature token with defender. When you do, it deals damage equal to its power to any target.\nMiracle {0} (You may cast this card for its miracle cost when you draw it if it's the first card you drew this turn.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Windmill Token", count: 1 },
      {
        kind: "reflexive-trigger",
        about: "created",
        targets: ["any-target"],
        effect: { kind: "damage", amount: { powerOf: "trigger-object" }, target: 0, from: "trigger-object" },
        text: "When you do, it deals damage equal to its power to any target.",
      },
    ],
  },
});
