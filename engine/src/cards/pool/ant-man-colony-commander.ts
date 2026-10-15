import { defineCard } from "../define.js";

// EDHREC rank 16135.
//
// The {1} payment sets off a reflexive trigger that targets as it goes on
// the stack (rule 603.12) — Matt Murdock, Justice Seeker's shape. The second
// ability watches every +1/+1 counter its controller puts on any creature,
// theirs or not (Mikey & Leo's `counters-put … byYou`), once each turn.

const ATTACK_TEXT =
  "Whenever Ant-Man attacks, you may pay {1}. When you do, put a +1/+1 counter on target creature.";
const COUNTER_TEXT =
  "Whenever you put a +1/+1 counter on a creature, create a 1/1 green Insect creature token. This ability triggers only once each turn.";

export default defineCard({
  name: "Ant-Man, Colony Commander",
  manaCost: "{1}{G}{U}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rogue", "Hero"],
  power: 2,
  toughness: 2,
  text: `${ATTACK_TEXT}\n${COUNTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1} to put a +1/+1 counter on target creature?",
        cost: "{1}",
        effect: {
          kind: "reflexive-trigger",
          targets: ["creature"],
          effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          text: "When you do, put a +1/+1 counter on target creature.",
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
    {
      trigger: { on: "counters-put", who: "any", counter: "+1/+1", filter: { type: "creature" }, byYou: true },
      oncePerTurn: true,
      targets: [],
      effect: { kind: "create-token", token: "Insect Token", count: 1 },
      resolve: null,
      text: COUNTER_TEXT,
    },
  ],
});
