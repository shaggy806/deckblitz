import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 29219.
//
// "Attacks or blocks" is two triggers. The count is taken as the ability
// resolves, Atlas himself included while he's a creature you control with
// power 4 or greater.

const TRIGGER_TEXT =
  "Whenever Atlas attacks or blocks, you gain 1 life for each creature you control with power 4 or greater.";

const gain: EffectSpec = {
  kind: "gain-life",
  amount: { countOf: { type: "creature", controlledBy: "you", power: { op: "gte", n: 4 } } },
};

export default defineCard({
  name: "Atlas, Sizable Stooge",
  manaCost: "{2}{B/G}{B/G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Villain"],
  power: 5,
  toughness: 4,
  keywords: ["reach"],
  text: `Reach (This creature can block creatures with flying.)\n${TRIGGER_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: gain,
      resolve: null,
      text: TRIGGER_TEXT,
    },
    {
      trigger: { on: "blocks", who: "self" },
      targets: [],
      effect: gain,
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
