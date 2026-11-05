import { defineCard } from "../define.js";

export default defineCard({
  name: "Huddle Up",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  assist: true,
  text: "Assist (Another player can pay up to {2} of this spell's cost.)\nTwo target players each draw a card.",
  targets: ["player", { kind: "other", of: "player", than: { slots: [0] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 1, target: 0 },
      { kind: "draw", amount: 1, target: 1 },
    ],
  },
});
