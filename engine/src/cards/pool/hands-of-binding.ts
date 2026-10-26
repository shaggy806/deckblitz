import { defineCard } from "../define.js";

// Gatecrash. Cipher (rule 702.99): `cipher: true`.

export default defineCard({
  name: "Hands of Binding",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Tap target creature an opponent controls. That creature doesn't untap during its controller's next untap step.\nCipher (Then you may exile this spell card encoded on a creature you control. Whenever that creature deals combat damage to a player, its controller may cast a copy of the encoded card without paying its mana cost.)",
  targets: ["creature-an-opponent-controls"],
  effect: { kind: "tap", target: 0, doesntUntapNext: true },
  cipher: true,
});
