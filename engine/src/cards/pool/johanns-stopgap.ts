import { defineCard } from "../define.js";

// EDHREC rank 23247.

export default defineCard({
  name: "Johann's Stopgap",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["sorcery"],
  kicker: { cost: "", keyword: "bargain", reduceGeneric: 2 },
  text: "Bargain (You may sacrifice an artifact, enchantment, or token as you cast this spell.)\nThis spell costs {2} less to cast if it's bargained.\nReturn target nonland permanent to its owner's hand. Draw a card.",
  targets: ["nonland-permanent"],
  effect: {
    kind: "sequence",
    effects: [{ kind: "return-to-hand", target: 0 }, { kind: "draw", amount: 1 }],
  },
});
