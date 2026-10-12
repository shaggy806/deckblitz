import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// EDHREC rank 12278.

const TEXT =
  "Whenever Syr Vondam enters or attacks, other creatures you control get +1/+0 and gain deathtouch until end of turn.";

const RALLY: EffectSpec = {
  kind: "sequence",
  effects: [
    {
      kind: "modify-pt-all",
      filter: { type: "creature", controlledBy: "you" },
      power: 1,
      toughness: 0,
      duration: "end-of-turn",
      exceptSource: true,
    },
    {
      kind: "grant-keyword-all",
      filter: { type: "creature", controlledBy: "you" },
      keyword: "deathtouch",
      duration: "end-of-turn",
      exceptSource: true,
    },
  ],
};

// "Enters or attacks" is two triggers.
export default defineCard({
  name: "Syr Vondam, the Lucent",
  manaCost: "{2}{W}{B}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 4,
  toughness: 4,
  keywords: ["deathtouch", "lifelink"],
  text: `Deathtouch, lifelink\n${TEXT}`,
  triggered: [
    { trigger: { on: "enters-battlefield", who: "self" }, targets: [], effect: RALLY, resolve: null, text: TEXT },
    { trigger: { on: "attacks", who: "self" }, targets: [], effect: RALLY, resolve: null, text: TEXT },
  ],
});
