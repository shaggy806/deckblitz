import { defineCard } from "../define.js";

export default defineCard({
  name: "Artistic Refusal",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  convoke: true,
  text: "Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nChoose one or both —\n• Counter target spell.\n• Draw two cards, then discard a card.",
  castModal: {
    minModes: 1,
    maxModes: 2,
    modes: [
      {
        text: "Counter target spell.",
        targets: ["spell"],
        effect: { kind: "counter", target: 0 },
      },
      {
        text: "Draw two cards, then discard a card.",
        effect: {
          kind: "sequence",
          effects: [{ kind: "draw", amount: 2 }, { kind: "discard", target: "you", amount: 1 }],
        },
      },
    ],
  },
});
