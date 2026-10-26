import { defineCard } from "../define.js";

// Cipher (rule 702.99): `cipher: true`.

export default defineCard({
  name: "Hidden Strings",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "You may tap or untap target permanent, then you may tap or untap another target permanent.\nCipher (Then you may exile this spell card encoded on a creature you control. Whenever that creature deals combat damage to a player, its controller may cast a copy of the encoded card without paying its mana cost.)",
  targets: ["permanent", { kind: "other", of: "permanent", than: { slot: 0 } }],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "modal",
        minModes: 0,
        maxModes: 1,
        modes: [
          { text: "Tap the first permanent", effect: { kind: "tap", target: 0 } },
          { text: "Untap the first permanent", effect: { kind: "untap", target: 0 } },
        ],
      },
      {
        kind: "modal",
        minModes: 0,
        maxModes: 1,
        modes: [
          { text: "Tap the second permanent", effect: { kind: "tap", target: 1 } },
          { text: "Untap the second permanent", effect: { kind: "untap", target: 1 } },
        ],
      },
    ],
  },
  cipher: true,
});
