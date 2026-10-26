import { defineCard } from "../define.js";
import type { TriggeredAbility } from "../../abilities.js";

// EDHREC rank 8505.
//
// Rulings:
//   [2012-07-01] Whenever a creature you control attacks alone, count the number of instances of
//     exalted among permanents you control. After those abilities resolve, that’s how many times
//     the creature will get +1/+1.
//
// Exalted is the "attacks-alone" trigger (rule 702.83), and "other creatures
// you control have exalted" Order of Sacred Dusk's grant of it: each
// instance triggers on its own (702.83b).

const EXALTED_TEXT =
  "Exalted (Whenever a creature you control attacks alone, that creature gets +1/+1 until end of turn.)";
const GRANT_TEXT =
  "Other creatures you control have exalted. (If a creature has multiple instances of exalted, each triggers separately.)";
const EXALTED: TriggeredAbility = {
  trigger: { on: "attacks-alone", who: "you-control" },
  targets: [],
  effect: { kind: "modify-pt", target: "trigger-object", power: 1, toughness: 1, duration: "end-of-turn" },
  resolve: null,
  text: EXALTED_TEXT,
};

export default defineCard({
  name: "Sublime Archangel",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 4,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${EXALTED_TEXT}\n${GRANT_TEXT}`,
  triggered: [EXALTED],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you" }, excludeSelf: true },
      grantsTriggered: [EXALTED],
      text: GRANT_TEXT,
    },
  ],
});
