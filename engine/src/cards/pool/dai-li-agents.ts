import { defineCard } from "../define.js";

// EDHREC rank 14003.
//
// Each earthbend is its own instance of the word "target", so the two may
// name the same land (rule 115.3, the ruling — Cracked Earth Technique's
// shape). X is counted as the attack trigger resolves (the ruling), once for
// the loss and again for the gain, with nothing in between to change it.
const ENTER_TEXT =
  "When this creature enters, earthbend 1, then earthbend 1. (To earthbend 1, target land you control becomes a 0/0 creature with haste that's still a land. Put a +1/+1 counter on it. When it dies or is exiled, return it to the battlefield tapped.)";
const ATTACK_TEXT =
  "Whenever this creature attacks, each opponent loses X life and you gain X life, where X is the number of creatures you control with +1/+1 counters on them.";
const X = {
  countOf: { type: "creature", controlledBy: "you", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
} as const;

export default defineCard({
  name: "Dai Li Agents",
  manaCost: "{3}{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 4,
  text: `${ENTER_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["land-you-control", "land-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "earthbend", target: 0, amount: 1 },
          { kind: "earthbend", target: 1, amount: 1 },
        ],
      },
      resolve: null,
      text: "When this creature enters, earthbend 1, then earthbend 1.",
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: X, who: "each-opponent" },
          { kind: "gain-life", amount: X },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
