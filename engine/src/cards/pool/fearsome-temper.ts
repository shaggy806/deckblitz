import { defineCard } from "../define.js";

// A block already made stands (the ruling).
const GRANTED = "{2}{R}: Target creature can't block this creature this turn.";
const TEXT = `Enchanted creature gets +2/+2 and has "${GRANTED}"`;

export default defineCard({
  name: "Fearsome Temper",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 2],
      grantsActivated: [
        {
          cost: { mana: "{2}{R}", tap: false },
          targets: ["creature"],
          effect: { kind: "restrict", target: 0, restrictions: [{ kind: "cant-block", attacker: "source" }]},
          resolve: null,
          text: GRANTED,
        },
      ],
      text: TEXT,
    },
  ],
});
