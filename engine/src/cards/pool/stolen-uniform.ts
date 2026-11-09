import { defineCard } from "../define.js";
import type { StaticCondition } from "../define.js";

// "This turn" is a stated duration (rule 603.7b), so losing it, regaining it
// and losing it again triggers again; the "until end of turn" ending in the
// cleanup step counts (the ruling).
const ATTACHED_TO_YOURS: StaticCondition = {
  kind: "target",
  index: 1,
  filter: { attachedTo: { type: "creature", controlledBy: "you" } },
};

export default defineCard({
  name: "Stolen Uniform",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Choose target creature you control and target Equipment. Gain control of that Equipment until end of turn. Attach it to the chosen creature. When you lose control of that Equipment this turn, if it's attached to a creature you control, unattach it.",
  targets: ["creature-you-control", { kind: "permanent", whose: "any", filter: { subtype: "Equipment" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-control", target: 1, untilEndOfTurn: true },
      // An illegal creature: control still changes, but no attaching (the ruling).
      { kind: "attach", target: 0, attachment: 1 },
      {
        kind: "delayed-trigger",
        at: { losesControl: 1, thisTurn: true },
        if: ATTACHED_TO_YOURS,
        effect: { kind: "conditional", condition: ATTACHED_TO_YOURS, then: { kind: "unattach", target: 1 } },
        text: "When you lose control of that Equipment this turn, if it's attached to a creature you control, unattach it.",
      },
    ],
  },
});
