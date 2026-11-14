import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// One ability with two trigger events: each card an opponent discards, and
// each time an opponent mills one or more cards (once per mill).
const TRIGGER_TEXT =
  "Whenever an opponent discards a card or mills one or more cards, put a +1/+1 counter on each Advisor you control.";
const MILL_TEXT = "{2}{U/B}: Target player mills four cards.";

const COUNTERS: EffectSpec = {
  kind: "add-counter-all",
  filter: { subtype: "Advisor", controlledBy: "you" },
  counter: "+1/+1",
  amount: 1,
};

export default defineCard({
  name: "Lo and Li, Royal Advisors",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 3,
  toughness: 3,
  text: `${TRIGGER_TEXT}\n${MILL_TEXT} (They put the top four cards of their library into their graveyard.)`,
  triggered: [
    {
      trigger: { on: "discards", who: "opponent", perCard: true },
      targets: [],
      effect: COUNTERS,
      resolve: null,
      text: TRIGGER_TEXT,
    },
    {
      trigger: { on: "mills", who: "opponent" },
      sameAbilityAs: 0,
      targets: [],
      effect: COUNTERS,
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{U/B}", tap: false },
      targets: ["player"],
      effect: { kind: "mill", target: 0, amount: 4 },
      resolve: null,
      text: MILL_TEXT,
    },
  ],
});
