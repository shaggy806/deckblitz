import { defineCard } from "../define.js";
import type { TriggeredAbility } from "../../abilities.js";

// EDHREC rank 12483. Sublime Archangel's granted exalted, on Auras: each Aura's
// instance triggers on its own (rule 702.83b).

const EXALTED: TriggeredAbility = {
  trigger: { on: "attacks-alone", who: "you-control" },
  targets: [],
  effect: { kind: "modify-pt", target: "trigger-object", power: 1, toughness: 1, duration: "end-of-turn" },
  resolve: null,
  text: "Exalted (Whenever a creature you control attacks alone, that creature gets +1/+1 until end of turn.)",
};
const GRANT_TEXT =
  "Auras you control have exalted. (Whenever a creature you control attacks alone, it gets +1/+1 until end of turn for each instance of exalted among permanents you control.)";

export default defineCard({
  name: "Rashel, Fist of Torm",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 4,
  keywords: ["double-strike"],
  text: `Double strike\n${GRANT_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "enchantment", subtype: "Aura", controlledBy: "you" } },
      grantsTriggered: [EXALTED],
      text: GRANT_TEXT,
    },
  ],
});
