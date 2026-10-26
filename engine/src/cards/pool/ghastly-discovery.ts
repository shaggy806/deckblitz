import { defineCard } from "../define.js";

export default defineCard({
  name: "Ghastly Discovery",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  conspire: true,
  text: "Draw two cards, then discard a card.\nConspire (As you cast this spell, you may tap two untapped creatures you control that share a color with it. When you do, copy it.)",
  targets: [],
  effect: { kind: "sequence", effects: [{ kind: "draw", amount: 2 }, { kind: "discard", target: "you", amount: 1 }] },
});
