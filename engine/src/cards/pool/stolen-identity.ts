import { defineCard } from "../define.js";

// Cipher (rule 702.99): `cipher: true`.

export default defineCard({
  name: "Stolen Identity",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Create a token that's a copy of target artifact or creature.\nCipher (Then you may exile this spell card encoded on a creature you control. Whenever that creature deals combat damage to a player, its controller may cast a copy of the encoded card without paying its mana cost.)",
  targets: [{ kind: "permanent", filter: { typesAnyOf: ["artifact", "creature"] } }],
  effect: { kind: "create-token-copy", of: 0, count: 1, who: "you" },
  cipher: true,
});
