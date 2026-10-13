import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 7076.
// "Enters or attacks" is two triggers, each only for this creature (the
// ruling). "Those creatures" are the other creatures you control as it
// resolves — the set the counters went on, fixed then (rule 611.2c), as
// Felidar Retreat's.
const TRIGGER_TEXT =
  "Whenever Spider-Man enters or attacks, put a +1/+1 counter on each other creature you control. Those creatures gain trample until end of turn.";
const OTHERS = { type: "creature", controlledBy: "you" } as const;
const EFFECT: EffectSpec = {
  kind: "sequence",
  effects: [
    { kind: "add-counter-all", filter: OTHERS, counter: "+1/+1", amount: 1, exceptSource: true },
    { kind: "grant-keyword-all", filter: OTHERS, keyword: "trample", duration: "end-of-turn", exceptSource: true },
  ],
};

export default defineCard({
  name: "Spider-Man, Miles Morales",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spider", "Human", "Hero"],
  power: 5,
  toughness: 5,
  keywords: ["vigilance", "trample"],
  text: `Vigilance, trample (Attacking doesn't cause this creature to tap. He can deal excess combat damage to the player he's attacking.)\n${TRIGGER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: EFFECT,
      resolve: null,
      text: TRIGGER_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: EFFECT,
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
