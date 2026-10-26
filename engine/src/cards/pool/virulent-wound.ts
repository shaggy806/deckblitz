import { defineCard } from "../define.js";

// EDHREC rank 14088. Searing Blood's shape: the death watch is a delayed
// trigger on the target, this turn only (rule 603.7), set up in the same
// resolution as the counter, so a creature the counter kills is seen dying.
// The poison counter goes to whoever controlled the creature as it died — the
// trigger object's controller, from its last known information.
const DIES_TEXT = "When that creature dies this turn, its controller gets a poison counter.";

export default defineCard({
  name: "Virulent Wound",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text: `Put a -1/-1 counter on target creature. ${DIES_TEXT}`,
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "-1/-1", amount: 1 },
      {
        kind: "delayed-trigger",
        at: { leaves: 0, to: ["graveyard"], thisTurn: true },
        effect: { kind: "add-player-counters", counter: "poison", amount: 1, who: "trigger-controller" },
        text: DIES_TEXT,
      },
    ],
  },
});
