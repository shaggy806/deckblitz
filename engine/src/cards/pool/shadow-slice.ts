import { defineCard } from "../define.js";

// Gatecrash. Cipher (rule 702.99): `cipher: true`.

export default defineCard({
  name: "Shadow Slice",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target opponent loses 3 life.\nCipher (Then you may exile this spell card encoded on a creature you control. Whenever that creature deals combat damage to a player, its controller may cast a copy of the encoded card without paying its mana cost.)",
  targets: ["opponent"],
  effect: { kind: "lose-life", amount: 3, target: 0 },
  cipher: true,
});
