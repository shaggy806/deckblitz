import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// Mystery Booster Commander Edition. "Whenever A and whenever B" is one
// ability written as two entries (`sameAbilityAs`), so "the second time this
// ability has resolved this turn" counts both. A: a source you control deals
// exactly 1 damage to you. B: a spell or ability you control causes you to
// lose exactly 1 life — an effect's loss (rule 119.3), not damage's (A's) nor
// a cost's.
const EMINENCE_TEXT =
  "Eminence — At the beginning of your upkeep, Sahir deals 1 damage to you. This ability triggers only if Sahir is in the command zone or on the battlefield.";
const GROW_TEXT =
  "Whenever a source you control deals exactly 1 damage to you and whenever a spell or ability you control causes you to lose exactly 1 life, put a +1/+1 counter on Sahir. If this is the second time this ability has resolved this turn, draw a card.";

const GROW: EffectSpec = {
  kind: "sequence",
  effects: [
    { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
    { kind: "conditional", condition: { kind: "resolved-this-turn", n: 2 }, then: { kind: "draw", amount: 1 } },
  ],
};

export default defineCard({
  name: "Sahir, Visitor in Darkness",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 3,
  text: `${EMINENCE_TEXT}\n${GROW_TEXT}`,
  triggered: [
    {
      fromCommandZone: true,
      condition: { kind: "source-zone", zones: ["command", "battlefield"], sameObject: true },
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "damage", amount: 1, who: "you" },
      resolve: null,
      text: EMINENCE_TEXT,
    },
    {
      trigger: { on: "deals-damage", who: "you-control", to: "you", exactly: 1 },
      targets: [],
      effect: GROW,
      resolve: null,
      text: GROW_TEXT,
    },
    {
      trigger: { on: "loses-life", who: "you", byEffectOf: "you", exactly: 1 },
      sameAbilityAs: 1,
      targets: [],
      effect: GROW,
      resolve: null,
      text: GROW_TEXT,
    },
  ],
});
