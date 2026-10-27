import { defineCard } from "../define.js";
import type { TriggeredAbility } from "../../abilities.js";

const FLANKING: TriggeredAbility = {
  trigger: { on: "blocked-by", who: "self", blocker: { notKeyword: "flanking" } },
  targets: [],
  effect: {
    kind: "modify-pt",
    target: "trigger-object",
    power: -1,
    toughness: -1,
    duration: "end-of-turn",
  },
  resolve: null,
  text: "Flanking",
};

export default defineCard({
  name: "Cavalry Master",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 3,
  toughness: 3,
  keywords: ["flanking"],
  text: "Flanking (Whenever a creature without flanking blocks this creature, the blocking creature gets -1/-1 until end of turn.)\nOther creatures you control with flanking have flanking. (Each instance of flanking triggers separately.)",
  triggered: [FLANKING],
  static: [
    {
      // An extra instance of flanking (rule 702.25b): its own trigger, not
      // the keyword again — the keyword is what "with flanking" reads.
      affects: { scope: "creatures-you-control", excludeSelf: true, withKeyword: "flanking" },
      grantsTriggered: [FLANKING],
      text: "Other creatures you control with flanking have flanking.",
    },
  ],
});
