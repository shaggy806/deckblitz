import { defineCard } from "../define.js";

export default defineCard({
  name: "Treva's Charm",
  manaCost: "{G}{W}{U}",
  colors: ["W", "U", "G"],
  types: ["instant"],
  text: "Choose one —\n• Destroy target enchantment.\n• Exile target attacking creature.\n• Draw a card, then discard a card.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Destroy target enchantment.",
        targets: ["enchantment"],
        effect: { kind: "destroy", target: 0 },
      },
      {
        text: "Exile target attacking creature.",
        targets: [{ kind: "permanent", filter: { attacking: true, type: "creature" } }],
        effect: { kind: "exile", target: 0 },
      },
      {
        text: "Draw a card, then discard a card.",
        effect: {
          kind: "sequence",
          effects: [{ kind: "draw", amount: 1 }, { kind: "discard", target: "you", amount: 1 }],
        },
      },
    ],
  },
});
