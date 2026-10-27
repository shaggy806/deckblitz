import { defineCard } from "../define.js";

// EDHREC rank 23751. Chaos Charm's targeted modal shape.

export default defineCard({
  name: "Fever Charm",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Choose one —\n• Target creature gains haste until end of turn.\n• Target creature gets +2/+0 until end of turn.\n• Fever Charm deals 3 damage to target Wizard creature.",
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Target creature gains haste until end of turn.",
        targets: ["creature"],
        effect: { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
      },
      {
        text: "Target creature gets +2/+0 until end of turn.",
        targets: ["creature"],
        effect: { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
      },
      {
        text: "Fever Charm deals 3 damage to target Wizard creature.",
        targets: [{ kind: "permanent", filter: { type: "creature", subtype: "Wizard" } }],
        effect: { kind: "damage", amount: 3, target: 0 },
      },
    ],
  },
});
