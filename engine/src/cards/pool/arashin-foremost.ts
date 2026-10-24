import type { EffectSpec } from "../../effects.js";
import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";

// EDHREC rank 18145.
//
// "Enters or attacks" is two triggers, each with its own target.

const TRIGGER_TEXT =
  "Whenever this creature enters or attacks, another target Warrior creature you control gains double strike until end of turn.";

const ANOTHER_WARRIOR: TargetSpec = {
  kind: "other",
  of: { kind: "permanent", whose: "you", filter: { type: "creature", subtype: "Warrior" } },
};
const DOUBLE_STRIKE: EffectSpec = { kind: "grant-keyword", target: 0, keyword: "double-strike", duration: "end-of-turn" };

export default defineCard({
  name: "Arashin Foremost",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 2,
  keywords: ["double-strike"],
  text: `Double strike\n${TRIGGER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [ANOTHER_WARRIOR],
      effect: DOUBLE_STRIKE,
      resolve: null,
      text: TRIGGER_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [ANOTHER_WARRIOR],
      effect: DOUBLE_STRIKE,
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
