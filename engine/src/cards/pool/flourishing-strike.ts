import { defineCard } from "../define.js";

// EDHREC rank 23858.

export default defineCard({
  name: "Flourishing Strike",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  kicker: { cost: "{2}{G}", keyword: "entwine" },
  text: "Choose one —\n• Flourishing Strike deals 5 damage to target creature with flying.\n• Target creature gets +3/+3 until end of turn.\nEntwine {2}{G} (Choose both if you pay the entwine cost.)",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Flourishing Strike deals 5 damage to target creature with flying.",
        targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
        effect: { kind: "damage", amount: 5, target: 0 },
      },
      {
        text: "Target creature gets +3/+3 until end of turn.",
        targets: ["creature"],
        effect: { kind: "modify-pt", target: 0, power: 3, toughness: 3, duration: "end-of-turn" },
      },
    ],
    kickedModes: 2,
  },
});
