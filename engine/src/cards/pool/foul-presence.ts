import { defineCard } from "../define.js";

// EDHREC rank 30725.

const GRANTED = "{T}: Target creature gets -1/-1 until end of turn.";
const TEXT = `Enchanted creature gets -1/-1 and has "${GRANTED}"`;

export default defineCard({
  name: "Foul Presence",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [-1, -1],
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: ["creature"],
          effect: { kind: "modify-pt", target: 0, power: -1, toughness: -1, duration: "end-of-turn" },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: TEXT,
    },
  ],
});
