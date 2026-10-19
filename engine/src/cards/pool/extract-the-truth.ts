import { defineCard } from "../define.js";

// "You may choose": choosing nothing is allowed even with a creature,
// enchantment or planeswalker card in that hand (the ruling).
export default defineCard({
  name: "Extract the Truth",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text:
    "Choose one —\n" +
    "• Target opponent reveals their hand. You may choose a creature, enchantment, or planeswalker card from it. That player discards that card.\n" +
    "• Target opponent sacrifices an enchantment of their choice.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Target opponent reveals their hand. You may choose a creature, enchantment, or planeswalker card from it. That player discards that card.",
        targets: ["opponent"],
        effect: {
          kind: "discard-chosen",
          target: 0,
          filter: { typesAnyOf: ["creature", "enchantment", "planeswalker"] },
          optional: true,
        },
      },
      {
        text: "Target opponent sacrifices an enchantment of their choice.",
        targets: ["opponent"],
        effect: { kind: "sacrifice", who: "target", filter: { type: "enchantment" }, count: 1 },
      },
    ],
  },
});
