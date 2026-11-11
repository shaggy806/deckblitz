import { defineCard } from "../define.js";

export default defineCard({
  name: "Here Comes a New Hero!",
  manaCost: "{X}{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Target player draws X cards. Create a token that's a copy of up to one target creature with mana value X or less.",
  targets: [
    "player",
    { kind: "optional", of: { kind: "permanent", filter: { type: "creature", manaValue: { op: "lte", n: "x" } } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: "x", target: 0 },
      { kind: "create-token-copy", of: 1, count: 1 },
    ],
  },
});
