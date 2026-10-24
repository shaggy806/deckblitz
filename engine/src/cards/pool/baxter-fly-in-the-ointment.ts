import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// EDHREC rank 7566.
//
// "Enters or attacks" is one ability with two trigger events. The creatures
// that gain flying are the ones with a counter of any kind as it resolves.
const FLY_TEXT =
  "Whenever Baxter enters or attacks, each creature you control with a counter on it gains flying until end of turn.";
const DRAW_TEXT = "Whenever you draw a card, put a +1/+1 counter on Baxter.";

const FLY: EffectSpec = {
  kind: "grant-keyword-all",
  filter: { type: "creature", controlledBy: "you", counters: { compare: { op: "gte", n: 1 } } },
  keyword: "flying",
  duration: "end-of-turn",
};

export default defineCard({
  name: "Baxter, Fly in the Ointment",
  manaCost: "{3}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Insect", "Mutant", "Scientist"],
  power: 2,
  toughness: 2,
  text: `${FLY_TEXT}\n${DRAW_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: FLY,
      resolve: null,
      text: FLY_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      sameAbilityAs: 0,
      targets: [],
      effect: FLY,
      resolve: null,
      text: FLY_TEXT,
    },
    {
      trigger: { on: "draws", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
