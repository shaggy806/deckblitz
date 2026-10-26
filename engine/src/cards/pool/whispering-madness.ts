import { defineCard } from "../define.js";

// Cipher (rule 702.99): `cipher: true`.

export default defineCard({
  name: "Whispering Madness",
  manaCost: "{2}{U}{B}",
  colors: ["U",  "B"],
  types: ["sorcery"],
  text: "Each player discards their hand, then draws cards equal to the greatest number of cards a player discarded this way.\nCipher (Then you may exile this spell card encoded on a creature you control. Whenever that creature deals combat damage to a player, its controller may cast a copy of the encoded card without paying its mana cost.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard-hand", who: "each-player" },
      { kind: "draw", who: "each-player", amount: { thisWay: "discarded", perPlayer: "greatest" } },
    ],
  },
  cipher: true,
});
