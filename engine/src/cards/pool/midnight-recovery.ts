import { defineCard } from "../define.js";

// Gatecrash. Cipher (rule 702.99): `cipher: true`.

export default defineCard({
  name: "Midnight Recovery",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Return target creature card from your graveyard to your hand.\nCipher (Then you may exile this spell card encoded on a creature you control. Whenever that creature deals combat damage to a player, its controller may cast a copy of the encoded card without paying its mana cost.)",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
  effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
  cipher: true,
});
