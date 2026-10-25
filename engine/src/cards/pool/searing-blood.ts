import { defineCard } from "../define.js";

// EDHREC rank 17322. The death watch is Grim Javelineer's delayed trigger on
// the target, this turn only (rule 603.7); its 3 damage goes to whoever
// controlled the creature as it died (its ruling) — the trigger object's
// controller, read from its last known information.
const DIES_TEXT = "When that creature dies this turn, Searing Blood deals 3 damage to the creature's controller.";

export default defineCard({
  name: "Searing Blood",
  manaCost: "{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: `Searing Blood deals 2 damage to target creature. ${DIES_TEXT}`,
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 2, target: 0 },
      {
        kind: "delayed-trigger",
        at: { leaves: 0, to: ["graveyard"], thisTurn: true },
        effect: { kind: "damage", amount: 3, who: "trigger-controller" },
        text: DIES_TEXT,
      },
    ],
  },
});
