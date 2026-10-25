import { defineCard } from "../define.js";

// The granted ability is the enchanted creature's, so its controller
// activates it, and any permanent they control pays the sacrifice — this
// Aura or the creature itself included (the rulings).
const GRANTED_TEXT = "{1}, Sacrifice a permanent: This creature gains flying until end of turn.";
const STATIC_TEXT = `Enchanted creature gets +2/+2 and has "${GRANTED_TEXT}"`;

export default defineCard({
  name: "Lunarch Mantle",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${STATIC_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 2],
      grantsActivated: [
        {
          cost: { mana: "{1}", tap: false, sacrifice: { filter: {} } },
          targets: [],
          effect: { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: STATIC_TEXT,
    },
  ],
});
