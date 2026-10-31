import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// The added [+1] combines with each loyalty cost into one (rule 606.5, whose
// example is this card): a [+1] puts two counters on, a [−4] removes three,
// a [−X] removes X−1 — and 606.6 asks for the combined count.

const TRIGGER_TEXT =
  "Whenever Carth enters or a planeswalker you control dies, look at the top seven cards of your library. You may reveal a planeswalker card from among them and put it into your hand. Put the rest on the bottom of your library in a random order.";
const LOYALTY_TEXT = "Planeswalkers' loyalty abilities you activate cost an additional [+1] to activate.";

const LOOK: EffectSpec = {
  kind: "look-and-choose",
  zone: "library",
  count: 7,
  reveal: "chosen",
  min: 0,
  max: 1,
  filter: { type: "planeswalker" },
  destination: "hand",
  leftover: "bottom-random",
};

export default defineCard({
  name: "Carth the Lion",
  manaCost: "{2}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 5,
  text: `${TRIGGER_TEXT}\n${LOYALTY_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: LOOK,
      resolve: null,
      text: TRIGGER_TEXT,
    },
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "planeswalker" } },
      targets: [],
      effect: LOOK,
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      abilityCostModification: {
        applies: { type: "planeswalker" },
        abilityKind: "loyalty",
        byYou: true,
        increaseLoyalty: 1,
      },
      text: LOYALTY_TEXT,
    },
  ],
});
