import { defineCard } from "../define.js";

// EDHREC rank 11119. The counters may go on any two attacking creatures, not
// only the legendary ones that triggered it (the ruling).

const ATTACK_TEXT =
  "Whenever you attack with two or more legendary creatures, put a +1/+1 counter on each of up to two target attacking creatures.";
const END_TEXT = "At the beginning of your end step, if you control a creature with power 4 or greater, draw a card.";

export default defineCard({
  name: "Master's Guidance",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `${ATTACK_TEXT}\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 2, filter: { type: "creature", supertype: "legendary" } },
      targets: [{ kind: "any-number", of: { kind: "permanent", filter: { type: "creature", attacking: true } }, max: 2 }],
      effect: {
        kind: "for-each-target",
        from: 0,
        effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "controls", filter: { type: "creature", power: { op: "gte", n: 4 } }, atLeast: 1 },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
