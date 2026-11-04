import { defineCard } from "../define.js";

// Fallout.

const ATTACK_TEXT =
  "ED-E My Love — Whenever you attack, if the number of attacking creatures is greater than the number of quest counters on ED-E, put a quest counter on it.";
const SACRIFICE_TEXT =
  "{2}, Sacrifice ED-E: Draw a card, then draw an additional card for each quest counter on ED-E.";

export default defineCard({
  name: "ED-E, Lonesome Eyebot",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  supertypes: ["legendary"],
  subtypes: ["Robot"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${ATTACK_TEXT}\n${SACRIFICE_TEXT}`,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      condition: {
        kind: "amounts",
        left: { countOf: { type: "creature", attacking: true } },
        op: "gt",
        right: { countersOn: "source", counter: "quest" },
      },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "quest", amount: 1 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "draw", amount: { countersOn: "source", counter: "quest" } },
        ],
      },
      resolve: null,
      text: SACRIFICE_TEXT,
    },
  ],
});
