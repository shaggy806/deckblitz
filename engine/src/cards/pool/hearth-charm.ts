import { defineCard } from "../define.js";

export default defineCard({
  name: "Hearth Charm",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text:
    "Choose one —\n" +
    "• Destroy target artifact creature.\n" +
    "• Attacking creatures get +1/+0 until end of turn.\n" +
    "• Target creature with power 2 or less can't be blocked this turn.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Destroy target artifact creature.",
        targets: [{ kind: "permanent", filter: { types: ["artifact", "creature"] } }],
        effect: { kind: "destroy", target: 0 },
      },
      {
        text: "Attacking creatures get +1/+0 until end of turn.",
        effect: {
          kind: "modify-pt-all",
          filter: { type: "creature", attacking: true },
          power: 1,
          toughness: 0,
          duration: "end-of-turn",
        },
      },
      {
        text: "Target creature with power 2 or less can't be blocked this turn.",
        targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "lte", n: 2 } } }],
        effect: { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
      },
    ],
  },
});
