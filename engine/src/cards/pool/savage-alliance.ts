import { defineCard } from "../define.js";

export default defineCard({
  name: "Savage Alliance",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Escalate {1} (Pay this cost for each mode chosen beyond the first.)\nChoose one or more —\n• Creatures target player controls gain trample until end of turn.\n• Savage Alliance deals 2 damage to target creature.\n• Savage Alliance deals 1 damage to each creature target opponent controls.",
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 3,
    costPerExtraMode: "{1}",
    modes: [
      {
        text: "Creatures target player controls gain trample until end of turn.",
        targets: ["player"],
        effect: {
          kind: "grant-keyword-all",
          filter: { type: "creature", controlledBy: "you" },
          controlledByTarget: 0,
          keyword: "trample",
          duration: "end-of-turn",
        },
      },
      {
        text: "Savage Alliance deals 2 damage to target creature.",
        targets: ["creature"],
        effect: { kind: "damage", amount: 2, target: 0 },
      },
      {
        text: "Savage Alliance deals 1 damage to each creature target opponent controls.",
        targets: ["opponent"],
        effect: { kind: "damage-all", filter: { type: "creature" }, amount: 1, controlledByTarget: 0 },
      },
    ],
  },
});
