import { defineCard } from "../define.js";

// Gatecrash. Cipher (rule 702.99): `cipher: true`.

export default defineCard({
  name: "Voidwalk",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Exile target creature. Return it to the battlefield under its owner's control at the beginning of the next end step.\nCipher (Then you may exile this spell card encoded on a creature you control. Whenever that creature deals combat damage to a player, its controller may cast a copy of the encoded card without paying its mana cost.)",
  targets: ["creature"],
  effect: {
    kind: "flicker",
    target: 0,
    returnAt: "next-end-step",
    returnText: "Return the exiled card to the battlefield under its owner's control.",
  },
  cipher: true,
});
