import { defineCard } from "../define.js";

export default defineCard({
  name: "Unexpected Assistance",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  convoke: true,
  text: "Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nDraw three cards, then discard a card.",
  effect: {
    kind: "sequence",
    effects: [{ kind: "draw", amount: 3 }, { kind: "discard", target: "you", amount: 1 }],
  },
});
