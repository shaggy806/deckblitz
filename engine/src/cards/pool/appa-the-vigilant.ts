import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

const TEXT =
  "Whenever Appa or another Ally you control enters, creatures you control get +1/+1 and gain flying and vigilance until end of turn.";
const YOURS = { type: "creature", controlledBy: "you" } as const;
const PUMP: EffectSpec = {
  kind: "sequence",
  effects: [
    { kind: "modify-pt-all", filter: YOURS, power: 1, toughness: 1, duration: "end-of-turn" },
    { kind: "grant-keyword-all", filter: YOURS, keyword: "flying", duration: "end-of-turn" },
    { kind: "grant-keyword-all", filter: YOURS, keyword: "vigilance", duration: "end-of-turn" },
  ],
};

export default defineCard({
  name: "Appa, the Vigilant",
  manaCost: "{5}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Bison", "Ally"],
  power: 6,
  toughness: 6,
  keywords: ["flying", "vigilance"],
  text: `Flying, vigilance\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: PUMP,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Ally" }, otherOnly: true },
      sameAbilityAs: 0,
      targets: [],
      effect: PUMP,
      resolve: null,
      text: TEXT,
    },
  ],
});
