import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// One ability with two trigger events, written as two entries counted as one
// (`sameAbilityAs`). "A Detective you control is turned face up" includes
// this creature, if it was face down (rule 708.8).

const TEXT =
  "Whenever another Detective you control enters and whenever a Detective you control is turned face up, this creature gets +1/+1 until end of turn.";

const PUMP: EffectSpec = { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" };

export default defineCard({
  name: "Perimeter Enforcer",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Detective"],
  power: 1,
  toughness: 1,
  keywords: ["flying", "lifelink"],
  text: `Flying, lifelink\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Detective" }, otherOnly: true },
      targets: [],
      effect: PUMP,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "turned-face-up", who: "you-control", filter: { subtype: "Detective" } },
      sameAbilityAs: 0,
      targets: [],
      effect: PUMP,
      resolve: null,
      text: TEXT,
    },
  ],
});
