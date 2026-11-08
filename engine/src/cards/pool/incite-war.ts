import { defineCard } from "../define.js";

// EDHREC rank 25750.

export default defineCard({
  name: "Incite War",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  kicker: { cost: "{2}", keyword: "entwine" },
  text: "Choose one —\n• Creatures target player controls attack this turn if able.\n• Creatures you control gain first strike until end of turn.\nEntwine {2} (Choose both if you pay the entwine cost.)",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Creatures target player controls attack this turn if able.",
        targets: ["player"],
        effect: { kind: "restrict", filter: { controlledBy: "you", type: "creature" }, controlledByTarget: 0, restrictions: ["must-attack"], duration: "end-of-turn" },
      },
      {
        text: "Creatures you control gain first strike until end of turn.",
        effect: {
          kind: "grant-keyword-all",
          filter: { type: "creature", controlledBy: "you" },
          keyword: "first-strike",
          duration: "end-of-turn",
        },
      },
    ],
    kickedModes: 2,
  },
});
