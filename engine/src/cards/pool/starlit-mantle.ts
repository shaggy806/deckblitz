import { defineCard } from "../define.js";

// "Enchanted creature" is the `"attached"` reference: the creature the Aura
// enchants as the trigger resolves, or — the Aura gone — the one it last
// enchanted (its ruling).
const ENTERS = "When this Aura enters, enchanted creature gains hexproof until end of turn.";

export default defineCard({
  name: "Starlit Mantle",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: `Flash (You may cast this spell any time you could cast an instant.)\nEnchant creature you control\n${ENTERS} (It can't be the target of spells or abilities your opponents control.)\nEnchanted creature gets +1/+1.`,
  targets: ["creature-you-control"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "grant-keyword", target: "attached", keyword: "hexproof", duration: "end-of-turn" },
      resolve: null,
      text: ENTERS,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [1, 1], text: "Enchanted creature gets +1/+1." }],
});
