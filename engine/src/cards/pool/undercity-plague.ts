import { defineCard } from "../define.js";

// Gatecrash. Cipher (rule 702.99): `cipher: true`.

export default defineCard({
  name: "Undercity Plague",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target player loses 1 life, discards a card, then sacrifices a permanent of their choice.\nCipher (Then you may exile this spell card encoded on a creature you control. Whenever that creature deals combat damage to a player, its controller may cast a copy of the encoded card without paying its mana cost.)",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "lose-life", amount: 1, target: 0 },
      { kind: "discard", target: 0, amount: 1 },
      { kind: "sacrifice", who: "target", filter: {}, count: 1 },
    ],
  },
  cipher: true,
});
