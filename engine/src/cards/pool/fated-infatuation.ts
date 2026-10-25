import { defineCard } from "../define.js";

export default defineCard({
  name: "Fated Infatuation",
  manaCost: "{U}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Create a token that's a copy of target creature you control. If it's your turn, scry 2.",
  targets: ["creature-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token-copy", of: 0, count: 1 },
      { kind: "conditional", condition: { kind: "your-turn" }, then: { kind: "scry", amount: 2 } },
    ],
  },
});
