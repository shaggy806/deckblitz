import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 16215. Marvel Super Heroes Commander.
//
// "Enters or attacks" is two triggers with one effect: Swords to
// Plowshares on up to one target, the life read from the creature as it last
// existed on the battlefield (rule 608.2h). The exile-watcher is Soulherder's
// trigger, other creatures only; "its power" is the exiled creature's as it
// last existed there. A creature her own trigger exiles fires it too: its
// controller gains life, then so do you.
const EXILE_TEXT =
  "Whenever Captain Marvel enters or attacks, exile up to one target creature. That creature's controller gains life equal to its power.";
const WATCH_TEXT =
  "Whenever a creature other than Captain Marvel is exiled from the battlefield, you gain life equal to its power.";

const exile: EffectSpec = {
  kind: "sequence",
  effects: [
    { kind: "exile", target: 0 },
    { kind: "gain-life", amount: { powerOf: 0 }, toControllerOfTarget: 0 },
  ],
};

export default defineCard({
  name: "Captain Marvel, Shooting Star",
  manaCost: "{5}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Kree", "Hero"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying\n${EXILE_TEXT}\n${WATCH_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: "creature" }],
      effect: exile,
      resolve: null,
      text: EXILE_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "optional", of: "creature" }],
      effect: exile,
      resolve: null,
      text: EXILE_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "any", filter: { type: "creature" }, otherOnly: true, to: ["exile"] },
      targets: [],
      effect: { kind: "gain-life", amount: { powerOf: "trigger-object" } },
      resolve: null,
      text: WATCH_TEXT,
    },
  ],
});
