import { defineCard } from "../define.js";

// EDHREC rank 17862.
const ATTACK_TEXT = "Whenever this creature attacks, create a Food token.";
const AURA_TEXT = `Enchanted creature gets +0/+3 and has "${ATTACK_TEXT}"`;

export default defineCard({
  name: "Creeping Crystal Coating",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: `Flash\nEnchant creature\n${AURA_TEXT} (It's an artifact with "{2}, {T}, Sacrifice this token: You gain 3 life.")`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [0, 3],
      grantsTriggered: [
        {
          trigger: { on: "attacks", who: "self" },
          targets: [],
          effect: { kind: "create-token", token: "Food Token", count: 1 },
          resolve: null,
          text: ATTACK_TEXT,
        },
      ],
      text: AURA_TEXT,
    },
  ],
});
