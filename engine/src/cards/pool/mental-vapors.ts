import { defineCard } from "../define.js";

// Gatecrash. Cipher (rule 702.99): `cipher: true`.

export default defineCard({
  name: "Mental Vapors",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target player discards a card.\nCipher (Then you may exile this spell card encoded on a creature you control. Whenever that creature deals combat damage to a player, its controller may cast a copy of the encoded card without paying its mana cost.)",
  targets: ["player"],
  effect: { kind: "discard", target: 0, amount: 1 },
  cipher: true,
});
