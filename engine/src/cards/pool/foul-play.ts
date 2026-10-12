import { defineCard } from "../define.js";

export default defineCard({
  name: "Foul Play",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Destroy target creature with power 2 or less. Investigate. (Create a Clue token. It's an artifact with \"{2}, Sacrifice this token: Draw a card.\")",
  targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "lte", n: 2 } } }],
  effect: {
    kind: "sequence",
    effects: [{ kind: "destroy", target: 0 }, { kind: "create-token", token: "Clue Token", count: 1 }],
  },
});
