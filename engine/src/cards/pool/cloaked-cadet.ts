import { defineCard } from "../define.js";
import { training } from "../helpers.js";

// EDHREC rank 19301.
//
// "Whenever one or more +1/+1 counters are put on one or more Humans you
// control … triggers only once each turn": a `counters-put` trigger fires per
// permanent per event, and `oncePerTurn` lets only the first of them through,
// so one card however many counters or Humans (the ruling).

export default defineCard({
  name: "Cloaked Cadet",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Ranger"],
  power: 2,
  toughness: 4,
  text: "Training (Whenever this creature attacks with another creature with greater power, put a +1/+1 counter on this creature.)\nWhenever one or more +1/+1 counters are put on one or more Humans you control, draw a card. This ability triggers only once each turn.",
  triggered: [
    training(),
    {
      trigger: { on: "counters-put", who: "you-control", counter: "+1/+1", filter: { subtype: "Human" } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      oncePerTurn: true,
      resolve: null,
      text: "Whenever one or more +1/+1 counters are put on one or more Humans you control, draw a card. This ability triggers only once each turn.",
    },
  ],
});
